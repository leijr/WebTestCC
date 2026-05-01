from datetime import datetime, timezone
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from openpyxl import Workbook
from database import get_db
from models import Device, User, BorrowRecord
from schemas import BorrowRequest, ReturnRequest, BorrowRecordOut
from auth import get_current_user, require_admin, require_employee

router = APIRouter(prefix="/api/borrow", tags=["borrow"])


def _build_borrow_query(db: Session, user_id=None, device_id=None, status=None, start=None, end=None):
    q = db.query(BorrowRecord).options(joinedload(BorrowRecord.user), joinedload(BorrowRecord.device))
    if user_id:
        q = q.filter(BorrowRecord.user_id == user_id)
    if device_id:
        q = q.filter(BorrowRecord.device_id == device_id)
    if status:
        q = q.filter(BorrowRecord.status == status)
    if start:
        q = q.filter(BorrowRecord.borrow_date >= start)
    if end:
        q = q.filter(BorrowRecord.borrow_date <= end)
    return q


def _record_to_out(r: BorrowRecord) -> BorrowRecordOut:
    return BorrowRecordOut(
        id=r.id,
        user_id=r.user_id,
        device_id=r.device_id,
        borrow_date=r.borrow_date,
        expected_return_date=r.expected_return_date,
        actual_return_date=r.actual_return_date,
        return_condition=r.return_condition,
        status=r.status,
        notes=r.notes or "",
        username=r.user.username,
        device_name=r.device.name,
        device_sn=r.device.serial_number,
    )


@router.post("", response_model=BorrowRecordOut)
def borrow_device(
    req: BorrowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    device = db.query(Device).filter(Device.id == req.device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if device.status != "available":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device not available")

    device.status = "borrowed"
    record = BorrowRecord(
        user_id=current_user.id,
        device_id=device.id,
        expected_return_date=req.expected_return_date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _record_to_out(record)


@router.post("/{record_id}/return", response_model=BorrowRecordOut)
def return_device(
    record_id: int,
    req: ReturnRequest = ReturnRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    record = db.query(BorrowRecord).filter(
        BorrowRecord.id == record_id,
        BorrowRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    if record.status not in ("borrowed", "overdue"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already returned")

    record.status = "returned"
    record.actual_return_date = datetime.now(timezone.utc)
    record.return_condition = req.return_condition
    record.notes = req.notes

    device = db.query(Device).filter(Device.id == record.device_id).first()
    cond = req.return_condition
    if cond == "good":
        device.status = "available"
    elif cond == "damaged":
        device.status = "损坏"
    else:
        device.status = "丢失"

    db.commit()
    db.refresh(record)
    return _record_to_out(record)


@router.get("/me", response_model=list[BorrowRecordOut])
def my_borrows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(BorrowRecord)
        .options(joinedload(BorrowRecord.user), joinedload(BorrowRecord.device))
        .filter(BorrowRecord.user_id == current_user.id)
        .order_by(BorrowRecord.borrow_date.desc())
        .all()
    )
    return [_record_to_out(r) for r in records]


@router.get("/all", response_model=dict)
def all_borrows(
    user_id: int | None = Query(None),
    device_id: int | None = Query(None),
    status: str | None = Query(None),
    start: str | None = Query(None),
    end: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    q = _build_borrow_query(db, user_id, device_id, status, start, end)
    total = q.count()
    records = q.order_by(BorrowRecord.borrow_date.desc()).offset((page - 1) * size).limit(size).all()
    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [_record_to_out(r) for r in records],
    }


@router.get("/export")
def export_borrows(
    user_id: int | None = Query(None),
    device_id: int | None = Query(None),
    status: str | None = Query(None),
    start: str | None = Query(None),
    end: str | None = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    q = _build_borrow_query(db, user_id, device_id, status, start, end)
    records = q.order_by(BorrowRecord.borrow_date.desc()).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Borrow Records"
    ws.append(["借用人", "设备名称", "序列号", "借用时间", "预计归还", "实际归还", "状态", "归还状态", "备注"])
    for r in records:
        ws.append([
            r.user.username,
            r.device.name,
            r.device.serial_number,
            r.borrow_date.replace(tzinfo=None) if r.borrow_date else "",
            r.expected_return_date.replace(tzinfo=None) if r.expected_return_date else "",
            r.actual_return_date.replace(tzinfo=None) if r.actual_return_date else "",
            r.status,
            r.return_condition or "",
            r.notes or "",
        ])

    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=borrow_records.xlsx"},
    )
