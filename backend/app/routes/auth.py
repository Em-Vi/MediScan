from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserSignup, UserLogin, TokenRequest, verificationRequest
from app.services.auth_service import signup_user, login_user, verify, get_user_details_from_token
from app.utils.jwt import verify_access_token
from app.services.email_service import send_verification_email
from app.db import db

router = APIRouter(prefix="/auth")

@router.post("/signup")
async def signup(user: UserSignup):
    return await signup_user(user)

@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user)

@router.post("/verify")
async def verify_email(data: TokenRequest):
    return await verify(data.token)

@router.post("/send-verification")
async def send_verification(data: verificationRequest):
    return await send_verification_email(data.email, data.token)

@router.get("/me")
async def get_current_user(data: TokenRequest):
    return await get_user_details_from_token(data.token)