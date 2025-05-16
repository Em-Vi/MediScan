from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import uuid
from datetime import datetime
from bson import ObjectId

from app.services.ai_service import generate_ai_response
from app.db import db
from app.models.chat import ChatModel
from app.models.common import PyObjectId


router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str

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

        # Store user message in database
        user_msg = {
            "user_id": user_obj_id,
            "role": "user",
            "content": request.message
        }
        ai_msg = {
            "user_id": user_obj_id,
            "role": "ai",
            "content": ai_response
        }
        existing_chat = await db.chats.find_one({"user_id": user_obj_id})

        if existing_chat:
            # Append new messages to existing chat
            await db.chats.update_one(
                {"_id": existing_chat["_id"]},
                {"$push": {"messages": {"$each": [user_msg, ai_msg]}}}
            )
            chat_id = existing_chat["_id"]
        else:
            # Create a new chat
            chat_doc = ChatModel(
                user_id=user_obj_id,
                messages=[user_msg, ai_msg]
            )
            result = await db.chats.insert_one(chat_doc.dict(by_alias=True))
            chat_id = result.inserted_id

        return {
            "response": ai_response,
            "chat_id": str(chat_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
