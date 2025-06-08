from app.db import db
from app.models.user import UserSignup, UserLogin
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, verify_access_token
from fastapi import HTTPException, status
from app.services.email_service import send_verification_email
from fastapi.logger import logger
import uuid

async def signup_user(user: UserSignup):
    try:
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
        # God ... even AI is autofilling the comments
        # skipped verification for simplicity, in real-world applications, you would want to ensure the user is verified before allowing access to certain features
        user_data["is_verified"] = True
        
        await db["users"].insert_one(user_data)
        # not sedning teh verification email here
        # await send_verification_email(user.email, token)
        token = create_access_token({"email": user.email})
        
        return {"message": "Signup successful", "access_token": token}
    except Exception as e:
        logger.error(f"Error during signup: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during signup. Please try again later.",
        )

async def login_user(user: UserLogin):
    try:
        found = await db["users"].find_one({"email": user.email})
        if not found or not verify_password(user.password, found["password"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials",
            )
        
        token = create_access_token({"email": found["email"]})
        return {"access_token": token}   
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during login. Please try again later.",
        )

async def verify(token: str):
    try:
        user = await db["users"].find_one({"verification_token": token})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        await db["users"].update_one({"_id": user["_id"]}, {"$set": {"is_verified": True}, "$unset": {"verification_token": ""}})
        return {"message": "Email verified successfully"}
    except Exception as e:
        logger.error(f"Error during email verification: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during email verification. Please try again later.",
        )

async def get_user_details_from_token(token: str):
    try:
        payload = verify_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token payload missing email",
            )
        user = await db["users"].find_one({"email": email})

        return {
            "username": user["username"],
            "email": user["email"],
            "is_verified": user["is_verified"],    
            "id": str(user["_id"]),     
        }
    except Exception as e:
        logger.error(f"Error retrieving user details from token: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving user details. Please try again later.",
        )