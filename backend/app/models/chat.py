from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import PyObjectId

class ChatModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    title: Optional[str] = "Untitled Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
