from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from .common import PyObjectId

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    username: str
    email: EmailStr
    password: str
    is_verified: bool = False
    verification_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str    

class TokenRequest(BaseModel):
    token: str
    
class verificationRequest(BaseModel):
    email: EmailStr
    token: str    
