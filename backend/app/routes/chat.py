from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import uuid
from datetime import datetime
from bson import ObjectId

from app.services.ai_service import generate_ai_response
from app.db import db
from app.models.message import MessageModel
from app.models.common import PyObjectId


router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str = None

@router.post("/chat")
async def chat_with_ai(request: ChatRequest = Body(...)):
    try:
        
        
        # Generate AI response using Gemini
        ai_response = generate_ai_response(request.message)
     
        
        # Create a session ID if none provided
        session_id = request.session_id or str(uuid.uuid4())

        # Convert user_id and session_id to PyObjectId using the correct validator
        try:
            user_obj_id = PyObjectId(ObjectId(request.user_id))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user_id format")
        try:
            session_obj_id = PyObjectId(ObjectId(request.user_id))
        except Exception:
            session_obj_id = PyObjectId()  # generate new ObjectId if not valid
            session_id = str(session_obj_id)

        # Store user message in database using MessageModel
        user_message = MessageModel(
            user_id=user_obj_id,
            session_id=session_obj_id,
            role="user",
            content=request.message
        )
        user_message_dict = user_message.dict(by_alias=True)
        db.insert_message(user_message_dict)

        # Store AI response in database using MessageModel
        bot_message = MessageModel(
            user_id=user_obj_id,
            session_id=session_obj_id,
            role="ai",
            content=ai_response
        )
        bot_message_dict = bot_message.dict(by_alias=True)
        db.insert_message(bot_message_dict)

        return {
            "response": ai_response,
            "session_id": session_id,
            "user_message_id": str(user_message_dict["_id"]),
            "bot_message_id": str(bot_message_dict["_id"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
