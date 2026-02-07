import csv
import io
from datetime import datetime, timezone
from sqlalchemy import desc
from sqlmodel import Session, select
from src.models.task import Task


class ExportService:
    """Handles task exports."""

    def export_to_csv(
        self,
        session: Session,
        user_id: str,
        status: str = "all",
    ) -> str:
        """Generate CSV content for user tasks."""
        query = select(Task).where(Task.user_id == user_id)  # type: ignore

        if status == "active":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)

        tasks = session.exec(query.order_by(Task.created_at.desc())).all()  # type: ignore

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "id",
                "title",
                "description",
                "priority",
                "category",
                "due_date",
                "completed",
                "created_at",
            ]
        )

        for task in tasks:
            writer.writerow(
                [
                    task.id,
                    task.title,
                    task.description or "",
                    task.priority or "",  # type: ignore[reportAttributeAccessIssue]
                    task.category or "",  # type: ignore[reportAttributeAccessIssue]
                    task.due_date.isoformat() if task.due_date else "",  # type: ignore[reportAttributeAccessIssue]
                    "TRUE" if task.completed else "FALSE",
                    task.created_at.isoformat(),
                ]
            )

        return output.getvalue()

    async def generate_pdf_report(
        self,
        session: Session,
        user_id: str,
        report_type: str = "summary",
    ) -> dict:
        """Generate PDF report data for frontend jsPDF."""
        from src.services.analytics_service import analytics_service

        stats = analytics_service.get_user_stats(session, user_id)

        tasks = session.exec(
            select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())  # type: ignore
        ).all()

        report_data = {
            "title": "Productivity Report",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "total_tasks": stats["total_tasks"],
                "completed_tasks": stats["completed_tasks"],
                "completion_rate": stats["completion_rate"],
                "current_streak": stats["streak_current"],
            },
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description or "",
                    "priority": task.priority or "",  # type: ignore[reportAttributeAccessIssue]
                    "category": task.category or "",  # type: ignore[reportAttributeAccessIssue]
                    "due_date": task.due_date.isoformat() if task.due_date else "",  # type: ignore[reportAttributeAccessIssue]
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                }
                for task in tasks
            ],
            "type": report_type,
        }

        return report_data


export_service = ExportService()
