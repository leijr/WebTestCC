import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import User, Device, BorrowRecord
from auth import get_current_user
from routers import auth, users, devices, borrow
from services.overdue_checker import start_scheduler
from init_admin import init_admin
from schemas import DashboardStats
from config import UPLOAD_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    init_admin()
    start_scheduler()
    yield


app = FastAPI(title="Device Management System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=os.path.dirname(UPLOAD_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(devices.router)
app.include_router(borrow.router)


@app.get("/api/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    total = db.query(Device).count()
    available = db.query(Device).filter(Device.status == "available").count()
    borrowed = db.query(Device).filter(Device.status == "borrowed").count()
    overdue = db.query(BorrowRecord).filter(BorrowRecord.status == "overdue").count()
    return DashboardStats(
        total_devices=total,
        available_devices=available,
        borrowed_devices=borrowed,
        overdue_count=overdue,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
