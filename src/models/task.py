"""Task data model for Todo Console App."""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Task:
    """Represents a single todo item."""

    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
