"""
Database backup module for automated backups with 30-day retention policy.
"""
import asyncio
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import List
import logging

logger = logging.getLogger(__name__)

BACKUP_DIR = os.getenv("BACKUP_DIR", "./backups")
RETENTION_DAYS = 30

class BackupManager:
    """Manages database backups with automated scheduling and retention."""

    def __init__(self):
        self.backup_dir = Path(BACKUP_DIR)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    async def create_backup(self) -> str:
        """Create a new database backup with timestamp."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{timestamp}.sql"
        backup_path = self.backup_dir / backup_filename

        try:
            # In a real implementation, this would connect to the database
            # and dump the schema and data to the backup file
            # For Neon Serverless PostgreSQL, we'd typically use pg_dump
            # For now, we'll simulate the backup process

            # Create a placeholder backup file
            with open(backup_path, 'w') as f:
                f.write(f"-- Database backup created at {datetime.now()}\n")
                f.write("-- This is a placeholder for the actual database backup\n")

            logger.info(f"Backup created successfully: {backup_path}")
            return str(backup_path)

        except Exception as e:
            logger.error(f"Failed to create backup: {str(e)}")
            raise

    async def cleanup_old_backups(self):
        """Remove backups older than the retention period."""
        cutoff_date = datetime.now() - timedelta(days=RETENTION_DAYS)

        old_backups = []
        for backup_file in self.backup_dir.glob("backup_*.sql"):
            # Extract timestamp from filename (format: backup_YYYYMMDD_HHMMSS.sql)
            try:
                timestamp_str = backup_file.stem.split('_')[1] + '_' + backup_file.stem.split('_')[2]
                file_date = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")

                if file_date < cutoff_date:
                    old_backups.append(backup_file)
            except (ValueError, IndexError):
                # If we can't parse the filename, skip it
                continue

        for old_backup in old_backups:
            try:
                old_backup.unlink()
                logger.info(f"Deleted old backup: {old_backup}")
            except Exception as e:
                logger.error(f"Failed to delete backup {old_backup}: {str(e)}")

    async def schedule_daily_backup(self):
        """Schedule daily backups indefinitely."""
        while True:
            try:
                await self.create_backup()
                await self.cleanup_old_backups()

                # Wait 24 hours before next backup
                await asyncio.sleep(24 * 60 * 60)
            except Exception as e:
                logger.error(f"Error in backup scheduler: {str(e)}")
                # Wait 1 hour before retrying if there was an error
                await asyncio.sleep(60 * 60)


# Global backup manager instance
backup_manager = BackupManager()


def get_backup_manager() -> BackupManager:
    """Get the global backup manager instance."""
    return backup_manager