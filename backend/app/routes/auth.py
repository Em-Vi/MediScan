from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import Dict, Any
import uuid
from datetime import datetime

from app.utils.auth_utils import get_current_user
from app.models.database import db

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    fullName: str

@router.get("/me")
async def get_user(user=Depends(get_current_user)):
    return {"user": user}

@router.post("/login")
async def login(request: LoginRequest = Body(...)):
    """Simple mock login"""
    # In a real app, you would validate credentials
    # For development, we'll create/return a user based on the email
    
    user = {
        "id": str(uuid.uuid4()),
        "email": request.email,
        "fullName": request.email.split('@')[0],
        "createdAt": datetime.now().isoformat(),
        "lastLogin": datetime.now().isoformat()
    }
    
    # Check if user exists
    users = [u for u in db._read_file('users.json') if u.get('email') == request.email]
    if users:
        user = users[0]
    else:
        user = db.create_user(user)
    
    return {
        "user": user,
        "token": "mock-jwt-token"  # In a real app, generate a proper JWT
    }

@router.post("/signup")
async def signup(request: SignupRequest = Body(...)):
    """Simple mock signup"""
    # Check if user already exists
    users = [u for u in db._read_file('users.json') if u.get('email') == request.email]
    if users:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = {
        "id": str(uuid.uuid4()),
        "email": request.email,
        "fullName": request.fullName,
        "createdAt": datetime.now().isoformat(),
        "lastLogin": datetime.now().isoformat()
    }
    
    db.create_user(user)
    
    return {
        "user": user,
        "token": "mock-jwt-token"  # In a real app, generate a proper JWT
    }
