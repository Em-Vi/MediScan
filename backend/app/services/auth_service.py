from app.db import db
from app.models.user import UserSignup, UserLogin
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, verify_access_token
from fastapi import HTTPException, status
from app.services.email_service import send_verification_email
import uuid

async def signup_user(user: UserSignup):
    exists = await db["users"].find_one({"email": user.email})
    if exists:
        raise HTTPException(
            status_code=400,
            detail="User already exists",
        )
    
    token = str(uuid.uuid4())
    
    user_data = user.dict()
    user_data["password"] = hash_password(user.password)   
    user_data["is_verified"] = False
    user_data["verification_token"] = token
    
    await db["users"].insert_one(user_data)
    await send_verification_email(user.email, token)
    token = create_access_token({"username": user.username ,"email": user.email,"is_verified": False})
    
    return {"message": "Signup successful, check your email to verify", "access_token": token}

async def login_user(user: UserLogin):
    found = await db["users"].find_one({"email": user.email})
    # Verify the raw password entered by the user against the hashed password in the database
    if not found or not verify_password(user.password, found["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )
        
    token = create_access_token({"username": found["username"], "email": found["email"], "is_verified": found["is_verified"]})
    return {"access_token": token}   

async def verify(token: str):
    user = await db["users"].find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    await db["users"].update_one({"_id": user["_id"]}, {"$set": {"is_verified": True}, "$unset": {"verification_token": ""}})
    return {"message": "Email verified successfully"}

async def get_user_details_from_token(token: str):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    username = payload.get("username")
    email = payload.get("email")
    is_verified = payload.get("is_verified")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token payload missing username",
        )

    return {
        "username": username,
        "email": email,
        "is_verified": is_verified          
    }