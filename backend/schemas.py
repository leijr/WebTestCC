from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ──
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str
    must_change_password: bool


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ── User ──
class UserCreate(BaseModel):
    username: str
    email: str


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    role: str | None = None
    is_active: bool | None = None


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    must_change_password: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreateResponse(BaseModel):
    id: int
    username: str
    email: str
    password: str
    message: str


class ResetPasswordResponse(BaseModel):
    password: str
    message: str


# ── Device ──
class DeviceCreate(BaseModel):
    name: str
    description: str = ""
    category: str = ""
    serial_number: str


class DeviceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    serial_number: str | None = None
    status: str | None = None


class DeviceOut(BaseModel):
    id: int
    name: str
    description: str
    category: str
    serial_number: str
    image: str | None = None
    image_url: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Borrow ──
class BorrowRequest(BaseModel):
    device_id: int
    expected_return_date: datetime


class ReturnRequest(BaseModel):
    return_condition: str = "good"
    notes: str = ""


class BorrowRecordOut(BaseModel):
    id: int
    user_id: int
    device_id: int
    borrow_date: datetime
    expected_return_date: datetime
    actual_return_date: datetime | None = None
    return_condition: str | None = None
    status: str
    notes: str
    username: str = ""
    device_name: str = ""
    device_sn: str = ""

    model_config = {"from_attributes": True}


# ── Dashboard ──
class DashboardStats(BaseModel):
    total_devices: int
    available_devices: int
    borrowed_devices: int
    overdue_count: int
