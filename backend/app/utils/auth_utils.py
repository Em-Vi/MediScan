from fastapi import Depends, HTTPException, Header
from typing import Optional
from app.models.mock_db import db

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Mock function to get the current user from a token
    In a real app, this would validate the JWT token
    """
    if not authorization:
        return {
            "id": "mock-user-id",
            "email": "test@example.com",
            "fullName": "Test User"
        }
    
    # Extract user ID from mock token
    # Format is "mock-jwt-token-{user_id}"
    try:
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            
            if token.startswith("mock-jwt-token-"):
                user_id = token.replace("mock-jwt-token-", "")
                user = db.get_user(user_id)
                if user:
                    return user
    except Exception:
        pass
    
    # Default mock user
    return {
        "id": "mock-user-id",
        "email": "test@example.com",
        "fullName": "Test User"
    }
