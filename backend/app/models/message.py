from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime
from .common import PyObjectId

class MessageModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    chat_id: PyObjectId  # NEW: reference to chat
    user_id: PyObjectId
    role: Literal["user", "ai"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
