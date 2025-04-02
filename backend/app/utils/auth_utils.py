from fastapi import Header, HTTPException, Depends
from typing import Dict, Any, Optional
import uuid

from app.models.database import db

# Simple mock user for testing
DEFAULT_USER = {
    "id": "1",
    "email": "test@example.com",
    "fullName": "Test User",
    "createdAt": "2023-01-01T00:00:00Z",
    "lastLogin": "2023-01-01T00:00:00Z"
}

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Simple mock auth for development - in a real app, this would validate JWT tokens
    """
    # For simplicity, we'll return a default user
    # You can enhance this later with proper token validation
    
    if not authorization:
        # Create and return default user if no token provided
        user = db.get_user(DEFAULT_USER["id"])
        if not user:
            user = db.create_user(DEFAULT_USER)
        return user
    
    # Handle "Bearer token" format
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        # In a real app, you would validate the token
        # For now, just return the default user
        user = db.get_user(DEFAULT_USER["id"])
        if not user:
            user = db.create_user(DEFAULT_USER)
        return user
    
    raise HTTPException(status_code=401, detail="Invalid authorization header")
