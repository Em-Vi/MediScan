from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime
import logging

# Import the mock database instead of Supabase
from app.models.mock_db import db
from app.utils.auth_utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    fullName: str

@router.get("/me")
async def get_user(user_id: Optional[str] = None):
    """Mock current user endpoint - for testing, accept a user_id query param"""
    if user_id:
        # Look up user by ID
        user = db.get_user(user_id)
        if user:
            return {"user": user}
    
    # For testing, return a mock user
    mock_user = {
        "id": "mock-user-id",
        "email": "test@example.com",
        "fullName": "Test User",
        "createdAt": datetime.now().isoformat(),
        "lastLogin": datetime.now().isoformat()
    }
    return {"user": mock_user}

@router.post("/login")
async def login(request: LoginRequest = Body(...)):
    """Simple mock login"""
    logger.info(f"Login attempt for email: {request.email}")
    
    # Check if user exists
    users = db._read_file("users.json")
    existing_users = [u for u in users if u.get("email") == request.email]
    
    if existing_users:
        user = existing_users[0]
        # Update last login time
        user["lastLogin"] = datetime.now().isoformat()
        db._write_file("users.json", users)
    else:
        # Create a new user for testing
        user = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "fullName": request.email.split('@')[0],
            "createdAt": datetime.now().isoformat(),
            "lastLogin": datetime.now().isoformat()
        }
        db.create_user(user)
    
    logger.info(f"User logged in: {user['id']}")
    
    return {
        "user": user,
        "token": f"mock-jwt-token-{user['id']}"  # In a real app, generate a proper JWT
    }

@router.post("/signup")
async def signup(request: SignupRequest = Body(...)):
    """Simple mock signup"""
    logger.info(f"Signup attempt for email: {request.email}")
    
    # Check if user already exists
    users = db._read_file("users.json")
    if any(u.get("email") == request.email for u in users):
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = {
        "id": str(uuid.uuid4()),
        "email": request.email,
        "fullName": request.fullName,
        "createdAt": datetime.now().isoformat(),
        "lastLogin": datetime.now().isoformat()
    }
    
    db.create_user(user)
    logger.info(f"User created: {user['id']}")
    
    return {
        "user": user,
        "token": f"mock-jwt-token-{user['id']}"  # In a real app, generate a proper JWT
    }
