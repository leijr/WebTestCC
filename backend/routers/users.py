import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import (
    UserCreate, UserUpdate, UserOut, UserCreateResponse, ResetPasswordResponse
)
from auth import get_current_user, require_admin, hash_password
from services.email_service import send_welcome_email

router = APIRouter(prefix="/api/users", tags=["users"])


def generate_random_password(length=8):
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


async def _send_welcome_bg(email: str, username: str, password: str):
    await send_welcome_email(email, username, password)


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return db.query(User).filter(User.is_active == True).order_by(User.id).all()


@router.post("", response_model=UserCreateResponse)
def create_user(
    req: UserCreate,
    bg: BackgroundTasks,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    password = generate_random_password()
    user = User(
        username=req.username,
        email=req.email,
        password_hash=hash_password(password),
        role="employee",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    bg.add_task(send_welcome_email, user.email, user.username, password)
    return UserCreateResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        password=password,
        message="User created, password emailed",
    )


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    req: UserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for key, val in req.model_dump(exclude_unset=True).items():
        setattr(user, key, val)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deleted"}


@router.post("/{user_id}/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    user_id: int,
    bg: BackgroundTasks,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    new_password = generate_random_password()
    user.password_hash = hash_password(new_password)
    user.must_change_password = True
    db.commit()
    bg.add_task(send_welcome_email, user.email, user.username, new_password)
    return ResetPasswordResponse(password=new_password, message="Password reset, email sent")
