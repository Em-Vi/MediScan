from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import uuid
from typing import Optional
from datetime import datetime
from bson import ObjectId

from app.services.ai_service import generate_ai_response
from app.db import db
from app.models.chat import ChatModel
from app.models.common import PyObjectId
from app.models.message import MessageModel


router = APIRouter()
class ChatRequest(BaseModel):
    user_id: str
    message: str
    chat_id: Optional[str] = None

@router.post("/chat")
async def chat_with_ai(request: ChatRequest = Body(...)):
    try:
        # Generate AI response using Gemini
        ai_response = await generate_ai_response(request.message)

        # Convert user_id to PyObjectId using the correct validator
        try:
            user_obj_id = PyObjectId(ObjectId(request.user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user_id format")

        chat_id = None
        # If chat_id is provided, use it; otherwise, create a new chat session
        if request.chat_id:
            try:
                chat_id = ObjectId(request.chat_id)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid chat_id format")
        else:
            # Use the first few words of ai_response as the chat title
            title = " ".join(ai_response.split()[:5])
            chat_doc = ChatModel(
                user_id=user_obj_id,
                title=title
            )
            result = await db.chats.insert_one(chat_doc.dict(by_alias=True))
            chat_id = result.inserted_id

        # Create user and ai message documents
        user_msg = MessageModel(
            chat_id=chat_id,
            user_id=user_obj_id,
            role="user",
            content=request.message
        )
        ai_msg = MessageModel(
            chat_id=chat_id,
            user_id=user_obj_id,
            role="ai",
            content=ai_response
        )
        # Insert messages into messages collection
        await db.messages.insert_many([
            user_msg.dict(by_alias=True),
            ai_msg.dict(by_alias=True)
        ])

        return {
            "response": ai_response,
            "chat_id": str(chat_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
