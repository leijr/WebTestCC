from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), nullable=False)
    role = Column(String(10), nullable=False, default="employee")
    must_change_password = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    borrow_records = relationship("BorrowRecord", back_populates="user")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="")
    serial_number = Column(String(50), unique=True, nullable=False)
    image = Column(String(255), nullable=True)
    status = Column(String(20), default="available")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    borrow_records = relationship("BorrowRecord", back_populates="device")


class BorrowRecord(Base):
    __tablename__ = "borrow_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    borrow_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expected_return_date = Column(DateTime, nullable=False)
    actual_return_date = Column(DateTime, nullable=True)
    return_condition = Column(String(20), nullable=True)
    status = Column(String(20), default="borrowed")
    notes = Column(Text, default="")

    user = relationship("User", back_populates="borrow_records")
    device = relationship("Device", back_populates="borrow_records")
