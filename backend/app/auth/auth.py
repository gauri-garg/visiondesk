from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.user_model import User

from app.auth.schemas import RegisterUser
from app.auth.schemas import LoginUser

from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from pydantic import BaseModel

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


class ResetPassword(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(
    user: RegisterUser,
    db: Session = Depends(get_db),
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already registered.",
        )

    new_user = User(

        full_name=user.full_name,

        email=user.email,

        password=hash_password(user.password),

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {

        "success": True,

        "message": "Registration successful."

    }


@router.post("/login")
def login(
    user: LoginUser,
    db: Session = Depends(get_db),
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Email not found. Please register.",
        )

    if not verify_password(
        user.password,
        existing.password,
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect password.",
        )

    token = create_access_token(

        {
            "sub": existing.email,
        }

    )

    return {

        "success": True,

        "access_token": token,

        "token_type": "bearer",

        "user": {

            "id": existing.id,

            "name": existing.full_name,

            "email": existing.email,

        }

    }


@router.post("/reset-password")
def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Email not found.",
        )

    user.password = hash_password(
        data.password
    )

    db.commit()

    return {

        "success": True,

        "message": "Password updated successfully."

    }