from fastapi import APIRouter, Depends, HTTPException, status, Request
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
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = auth_header.split(" ", 1)[1]
    return await get_user_details_from_token(token)