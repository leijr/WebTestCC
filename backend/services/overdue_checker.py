from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import joinedload
from database import SessionLocal
from models import BorrowRecord
from services.email_service import send_overdue_reminder

scheduler = AsyncIOScheduler()


async def check_overdue():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        records = (
            db.query(BorrowRecord)
            .options(joinedload(BorrowRecord.user), joinedload(BorrowRecord.device))
            .filter(
                BorrowRecord.status == "borrowed",
                BorrowRecord.expected_return_date < now,
            )
            .all()
        )
        for r in records:
            r.status = "overdue"
            await send_overdue_reminder(
                r.user.email,
                r.user.username,
                r.device.name,
                r.expected_return_date.strftime("%Y-%m-%d %H:%M"),
            )
        if records:
            db.commit()
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(check_overdue, "interval", hours=1, id="overdue_check")
    scheduler.start()
