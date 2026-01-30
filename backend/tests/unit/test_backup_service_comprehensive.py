"""
Comprehensive unit tests for backup service to improve coverage.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
import tempfile
import asyncio
from datetime import datetime, timedelta
from src.database.backup import BackupManager


def test_backup_manager_initialization():
    """Test BackupManager initialization."""
    with patch('pathlib.Path.mkdir') as mock_mkdir:
        backup_manager = BackupManager()

        # Verify that the backup directory was created
        mock_mkdir.assert_called_once_with(parents=True, exist_ok=True)

        # Verify that the backup manager was created
        assert backup_manager is not None
        assert hasattr(backup_manager, 'backup_dir')


@pytest.mark.asyncio
async def test_create_backup_success():
    """Test successful backup creation."""
    with patch('pathlib.Path.mkdir'):
        backup_manager = BackupManager()

    # Mock the file operations
    with patch('builtins.open') as mock_file:
        mock_file_handle = Mock()
        mock_file.return_value.__enter__.return_value = mock_file_handle

        # Mock the backup directory
        with patch.object(backup_manager, 'backup_dir', Path(tempfile.mkdtemp())):
            # Call create_backup
            result = await backup_manager.create_backup()

            # Verify that the file was opened for writing
            mock_file.assert_called_once()
            # Verify that content was written to the file
            mock_file_handle.write.assert_called()


@pytest.mark.asyncio
async def test_create_backup_failure():
    """Test backup creation failure handling."""
    with patch('pathlib.Path.mkdir'):
        backup_manager = BackupManager()

    # Mock file operations to raise an exception
    with patch('builtins.open', side_effect=OSError("Disk full")):
        # Mock logging
        with patch('logging.Logger.error') as mock_logger_error:
            # Call create_backup and expect it to raise an exception
            with pytest.raises(OSError):
                await backup_manager.create_backup()

            # Verify that the error was logged
            assert mock_logger_error.called


@pytest.mark.asyncio
async def test_cleanup_old_backups():
    """Test cleanup of old backups."""
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch('src.database.backup.BACKUP_DIR', temp_dir):
            with patch('pathlib.Path.mkdir'):
                backup_manager = BackupManager()

            # Create actual backup files with different dates in filenames
            # Cutoff will be: Dec 2, 2023 - 30 days = Nov 2, 2023
            old_backup = backup_manager.backup_dir / "backup_20231101_120000.sql"  # Nov 1 - before cutoff
            recent_backup = backup_manager.backup_dir / "backup_20231201_120000.sql"  # Dec 1 - after cutoff

            # Create the files
            old_backup.touch()
            recent_backup.touch()

            # Verify files exist before cleanup
            assert old_backup.exists()
            assert recent_backup.exists()

            # Mock datetime to simulate we're on Dec 2, 2023
            with patch('src.database.backup.datetime') as mock_datetime:
                mock_now = datetime(2023, 12, 2, 12, 0, 0)
                mock_datetime.now.return_value = mock_now
                mock_datetime.strptime = staticmethod(datetime.strptime)
                mock_datetime.timedelta = timedelta

                # Call cleanup
                await backup_manager.cleanup_old_backups()

            # Verify old backup was deleted (Nov 1 is before Nov 2 cutoff)
            assert not old_backup.exists(), "Old backup should have been deleted"
            # Verify recent backup was not deleted (Dec 1 is after Nov 2 cutoff)
            assert recent_backup.exists(), "Recent backup should not have been deleted"


@pytest.mark.asyncio
async def test_cleanup_old_backups_with_unlink_error():
    """Test cleanup of old backups when unlink fails."""
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch('src.database.backup.BACKUP_DIR', temp_dir):
            with patch('pathlib.Path.mkdir'):
                backup_manager = BackupManager()

            # Create an old backup file
            old_backup = backup_manager.backup_dir / "backup_20231101_120000.sql"
            old_backup.touch()

            # Verify file exists
            assert old_backup.exists()

            # Mock unlink at the module level to raise an error
            original_unlink = Path.unlink

            def mock_unlink(self):
                raise OSError("Permission denied")

            # Mock datetime
            with patch('src.database.backup.datetime') as mock_datetime:
                mock_now = datetime(2023, 12, 2, 12, 0, 0)
                mock_datetime.now.return_value = mock_now
                mock_datetime.strptime = staticmethod(datetime.strptime)
                mock_datetime.timedelta = timedelta

                # Mock logging and unlink
                with patch('src.database.backup.logger') as mock_logger:
                    with patch.object(Path, 'unlink', mock_unlink):
                        # Call cleanup - should handle the error gracefully
                        await backup_manager.cleanup_old_backups()

                        # Verify that the error was logged
                        assert mock_logger.error.called


@pytest.mark.asyncio
async def test_schedule_daily_backup():
    """Test backup scheduling function."""
    with patch('pathlib.Path.mkdir'):
        backup_manager = BackupManager()

    # Mock the create_backup and cleanup_old_backups methods
    with patch.object(backup_manager, 'create_backup', side_effect=asyncio.CancelledError("Stop after first iteration")):
        with patch.object(backup_manager, 'cleanup_old_backups', return_value=None):
            # Mock logging
            with patch('logging.Logger.error') as mock_logger_error:
                # Call schedule_daily_backup - will be cancelled after first iteration
                with pytest.raises(asyncio.CancelledError):
                    await backup_manager.schedule_daily_backup()

                # The function should handle the cancellation gracefully without logging an error
                # (because CancelledError is a special exception that indicates intentional cancellation)
                mock_logger_error.assert_not_called()


@pytest.mark.asyncio
async def test_schedule_daily_backup_with_error():
    """Test backup scheduling when an error occurs."""
    with patch('pathlib.Path.mkdir'):
        backup_manager = BackupManager()

    # Mock the create_backup method to raise an exception
    with patch.object(backup_manager, 'create_backup', side_effect=Exception("Backup failed")):
        with patch.object(backup_manager, 'cleanup_old_backups', return_value=None):
            # Mock logging
            with patch('logging.Logger.error') as mock_logger_error:
                # Mock asyncio.sleep to raise CancelledError to break the infinite loop
                with patch('asyncio.sleep', side_effect=asyncio.CancelledError("Stop after error")):
                    # Call schedule_daily_backup - should log the error and continue
                    with pytest.raises(asyncio.CancelledError):
                        await backup_manager.schedule_daily_backup()

                    # Verify that the error was logged
                    assert mock_logger_error.called


def test_get_backup_manager():
    """Test getting the global backup manager instance."""
    from src.database.backup import get_backup_manager, backup_manager

    # Test that the function returns the same instance as the global variable
    result = get_backup_manager()

    assert result is backup_manager
    assert isinstance(result, BackupManager)


@pytest.mark.asyncio
async def test_backup_manager_with_real_temp_dir():
    """Test BackupManager with a real temporary directory."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Patch the BACKUP_DIR environment variable
        with patch('src.database.backup.BACKUP_DIR', temp_dir):
            backup_manager = BackupManager()

            # Verify that the backup directory exists
            assert backup_manager.backup_dir.exists()
            assert backup_manager.backup_dir.is_dir()

            # Create a backup
            backup_path = await backup_manager.create_backup()

            # Verify that the backup file was created
            assert Path(backup_path).exists()
            assert Path(backup_path).is_file()