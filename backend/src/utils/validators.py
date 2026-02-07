"""Shared validation utilities for the backend API.

This module provides common validation functions used across multiple routers
to reduce code duplication and ensure consistency.
"""

import re
from datetime import datetime
from typing import Optional, Tuple
from fastapi import HTTPException
from starlette import status

# Email validation regex (RFC 5322 compliant subset)
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Validation constants
VALID_PRIORITIES = {"high", "medium", "low"}
VALID_CATEGORIES = {"work", "personal", "study", "health", "finance"}
VALID_CALENDAR_PERIODS = {"today", "week", "month"}
VALID_TASK_STATUSES = {"all", "active", "completed", "pending"}
VALID_DATE_FILTERS = {"today", "tomorrow", "week", "overdue", "no_due_date"}

# Password requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128


def validate_email_format(email: str) -> bool:
    """Validate email format using regex.

    Args:
        email: Email address to validate

    Returns:
        True if email format is valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def validate_email_or_raise(email: str) -> str:
    """Validate email and return normalized email or raise HTTPException.

    Args:
        email: Email address to validate

    Returns:
        Normalized (trimmed, lowercased) email string

    Raises:
        HTTPException: 400 if email is invalid
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required",
        )

    if not validate_email_format(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format",
        )

    return email.strip().lower()


def validate_password_or_raise(password: str) -> None:
    """Validate password requirements or raise HTTPException.

    Args:
        password: Password to validate

    Raises:
        HTTPException: 400 if password doesn't meet requirements
    """
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required",
        )

    if len(password) < PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least {PASSWORD_MIN_LENGTH} characters",
        )

    if len(password) > PASSWORD_MAX_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must not exceed {PASSWORD_MAX_LENGTH} characters",
        )


def validate_name_or_raise(name: str, field_name: str = "Name") -> str:
    """Validate name and return normalized name or raise HTTPException.

    Args:
        name: Name to validate
        field_name: Field name for error messages (default: "Name")

    Returns:
        Normalized (stripped) name string

    Raises:
        HTTPException: 400 if name is invalid
    """
    if not name or not name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} is required",
        )

    trimmed_name = name.strip()

    if len(trimmed_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be at least 2 characters",
        )

    if len(trimmed_name) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be less than 50 characters",
        )

    return trimmed_name


def validate_calendar_period(period: str) -> str:
    """Validate calendar period parameter.

    Args:
        period: Period string to validate

    Returns:
        Validated period string (lowercase)

    Raises:
        HTTPException: 400 if period is invalid
    """
    if not period:
        return "week"  # Default value

    period_lower = period.lower().strip()

    if period_lower not in VALID_CALENDAR_PERIODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Period must be one of: {', '.join(VALID_CALENDAR_PERIODS)}",
        )

    return period_lower


def validate_task_priority(priority: Optional[str]) -> Optional[str]:
    """Validate task priority value.

    Args:
        priority: Priority string to validate

    Returns:
        Validated priority string (lowercase) or None

    Raises:
        HTTPException: 400 if priority is invalid
    """
    if not priority:
        return None

    priority_lower = priority.lower().strip()

    if priority_lower not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Priority must be one of: {', '.join(VALID_PRIORITIES)}",
        )

    return priority_lower


def validate_task_category(category: Optional[str]) -> Optional[str]:
    """Validate task category value.

    Args:
        category: Category string to validate

    Returns:
        Validated category string (lowercase) or None

    Raises:
        HTTPException: 400 if category is invalid
    """
    if not category:
        return None

    category_lower = category.lower().strip()

    if category_lower not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}",
        )

    return category_lower


def validate_task_status_filter(filter_status: Optional[str]) -> Optional[str]:
    """Validate task status filter value.

    Args:
        filter_status: Status filter string to validate

    Returns:
        Validated status string (lowercase) or None

    Raises:
        HTTPException: 400 if status is invalid
    """
    if not filter_status:
        return None

    status_lower = filter_status.lower().strip()

    if status_lower not in VALID_TASK_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(VALID_TASK_STATUSES)}",
        )

    return status_lower


def validate_due_date(due_date_str: Optional[str]) -> Optional[datetime]:
    """Validate and parse due date string.

    Args:
        due_date_str: ISO 8601 date string to validate

    Returns:
        Parsed datetime object or None

    Raises:
        HTTPException: 400 if date format is invalid
    """
    if not due_date_str:
        return None

    try:
        # Handle various ISO 8601 formats
        date_str = due_date_str.strip()
        if date_str.endswith("Z"):
            date_str = date_str[:-1] + "+00:00"
        return datetime.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid due date format. Use ISO 8601 format (e.g., 2025-02-05T17:00:00Z)",
        )


def validate_date_filter(date_filter: Optional[str]) -> Optional[str]:
    """Validate date filter value.

    Args:
        date_filter: Date filter string to validate

    Returns:
        Validated date filter string (lowercase) or None

    Raises:
        HTTPException: 400 if date filter is invalid
    """
    if not date_filter:
        return None

    filter_lower = date_filter.lower().strip()

    if filter_lower not in VALID_DATE_FILTERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Date filter must be one of: {', '.join(VALID_DATE_FILTERS)}",
        )

    return filter_lower


def validate_analytics_period(period: str) -> str:
    """Validate analytics period parameter.

    Args:
        period: Period string to validate

    Returns:
        Validated period string (lowercase)

    Raises:
        HTTPException: 400 if period is invalid
    """
    valid_periods = {"week", "month", "quarter"}

    if not period:
        return "week"  # Default value

    period_lower = period.lower().strip()

    if period_lower not in valid_periods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Period must be one of: {', '.join(valid_periods)}",
        )

    return period_lower


def validate_pagination_params(
    page: Optional[int], limit: Optional[int]
) -> Tuple[int, int]:
    """Validate and normalize pagination parameters.

    Args:
        page: Page number (1-based)
        limit: Items per page

    Returns:
        Tuple of (validated_page, validated_limit)
    """
    validated_page = max(1, page if page is not None else 1)
    validated_limit = max(1, min(100, limit if limit is not None else 20))

    return validated_page, validated_limit


def sanitize_string_input(
    input_str: Optional[str], max_length: int = 255
) -> Optional[str]:
    """Sanitize string input by trimming and validating length.

    Args:
        input_str: Input string to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized string or None if input was None/empty

    Raises:
        HTTPException: 400 if string exceeds max length
    """
    if not input_str:
        return None

    trimmed = input_str.strip()

    if len(trimmed) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input exceeds maximum length of {max_length} characters",
        )

    return trimmed
