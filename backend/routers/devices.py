import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Device, User
from schemas import DeviceOut
from auth import get_current_user, require_admin
from config import UPLOAD_DIR

router = APIRouter(prefix="/api/devices", tags=["devices"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def _save_image(file: UploadFile) -> str | None:
    if not file or not file.filename:
        return None
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image format")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    return filename


def _device_to_out(d: Device) -> DeviceOut:
    image_url = f"/uploads/devices/{d.image}" if d.image else None
    return DeviceOut(
        id=d.id,
        name=d.name,
        description=d.description or "",
        category=d.category or "",
        serial_number=d.serial_number,
        image=d.image,
        image_url=image_url,
        status=d.status,
        created_at=d.created_at,
    )


@router.get("", response_model=list[DeviceOut])
def list_devices(
    category: str | None = Query(None),
    status: str | None = Query(None),
    keyword: str | None = Query(None),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    q = db.query(Device)
    if category:
        q = q.filter(Device.category == category)
    if status:
        q = q.filter(Device.status == status)
    if keyword:
        q = q.filter(
            Device.name.ilike(f"%{keyword}%")
            | Device.serial_number.ilike(f"%{keyword}%")
        )
    return [_device_to_out(d) for d in q.order_by(Device.id).all()]


@router.get("/{device_id}", response_model=DeviceOut)
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return _device_to_out(device)


@router.post("", response_model=DeviceOut)
def create_device(
    name: str = Form(...),
    description: str = Form(""),
    category: str = Form(""),
    serial_number: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = db.query(Device).filter(Device.serial_number == serial_number).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serial number already exists")
    image_filename = _save_image(image) if image else None
    device = Device(
        name=name,
        description=description,
        category=category,
        serial_number=serial_number,
        image=image_filename,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return _device_to_out(device)


@router.put("/{device_id}", response_model=DeviceOut)
def update_device(
    device_id: int,
    name: str = Form(None),
    description: str = Form(None),
    category: str = Form(None),
    serial_number: str = Form(None),
    status: str = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if name is not None:
        device.name = name
    if description is not None:
        device.description = description
    if category is not None:
        device.category = category
    if serial_number is not None:
        device.serial_number = serial_number
    if status is not None:
        device.status = status
    if image and image.filename:
        device.image = _save_image(image)
    db.commit()
    db.refresh(device)
    return _device_to_out(device)


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device deleted"}
