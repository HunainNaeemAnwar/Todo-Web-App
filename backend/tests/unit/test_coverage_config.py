"""
Test Coverage Configuration (T003R)

Tests that verify the pytest/cov configuration meets Phase 3 coverage targets.
These tests are intentionally designed to FAIL if coverage config is missing or incorrect.
"""

import os
import configparser
from pathlib import Path


class TestCoverageConfiguration:
    """Verify coverage configuration meets Phase 3 targets."""

    def test_pytest_ini_exists_with_coverage_settings(self):
        """
        T003R-1: pytest.ini must exist and contain coverage settings.
        Target: 100% coverage config validation
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        assert pytest_ini_path.exists(), "pytest.ini must exist at backend/pytest.ini"

        config = configparser.ConfigParser()
        config.read(pytest_ini_path)

        assert "pytest" in config, "pytest.ini must have [pytest] section"
        pytest_opts = config.get("pytest", "addopts", fallback="")

        assert "--cov=src" in pytest_opts, "pytest.ini must include --cov=src"
        assert "--cov-report" in pytest_ini_path.read_text(), "pytest.ini must include coverage report option"
        assert "--cov-fail-under=80" in pytest_ini_path.read_text(), "Coverage must fail under 80%"

    def test_coverage_run_settings(self):
        """
        T003R-2: Coverage run settings must be correctly configured.
        Target: Source path and branch coverage enabled.
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        content = pytest_ini_path.read_text()

        assert "source = src" in content, "Coverage must target 'src' directory"
        assert "branch = True" in content or "branch = True" in content, "Branch coverage must be enabled"

    def test_coverage_report_exclude_lines(self):
        """
        T003R-3: Coverage report must have appropriate exclude lines.
        Target: Standard pragma and boilerplate exclusions.
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        content = pytest_ini_path.read_text()

        required_excludes = [
            "pragma: no cover",
            "def __repr__",
            "raise NotImplementedError",
            "if TYPE_CHECKING:",
        ]

        for exclude in required_excludes:
            assert exclude in content, f"Coverage must exclude: {exclude}"

    def test_coverage_minimum_threshold(self):
        """
        T003R-4: Coverage must fail if below 80% threshold.
        Target: 80% minimum coverage as per tasks.md.
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        content = pytest_ini_path.read_text()

        assert "--cov-fail-under=80" in content, "Coverage must fail under 80% threshold"

    def test_pytest_testpaths_configured(self):
        """
        T003R-5: pytest must be configured to find tests in correct location.
        Target: Test discovery from backend/tests directory.
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        content = pytest_ini_path.read_text()

        assert "testpaths = tests" in content, "pytest must be configured to look in 'tests' directory"

    def test_pytest_strict_markers_enabled(self):
        """
        T003R-6: pytest strict markers must be enabled.
        Target: Prevent undefined markers from silently passing.
        """
        pytest_ini_path = Path(__file__).parent.parent.parent / "pytest.ini"
        content = pytest_ini_path.read_text()

        assert "--strict-markers" in content, "pytest strict-markers must be enabled"
