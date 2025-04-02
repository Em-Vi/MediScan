from fastapi import APIRouter, HTTPException, Body, Depends
from pydantic import BaseModel
import uuid
from datetime import datetime

from app.services.ai_service import generate_ai_response
from app.models.database import db
from app.utils.auth_utils import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str = None

@router.post("/")
async def chat_with_ai(request: ChatRequest = Body(...), user=Depends(get_current_user)):
    try:
        # Generate AI response using Gemini
        ai_response = generate_ai_response(request.message)
        
        # Create a session ID if none provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Store user message in database
        user_message = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "session_id": session_id,
            "content": request.message,
            "sender": "user",
            "timestamp": datetime.now().isoformat()
        }
        db.insert_message(user_message)
        
        # Store AI response in database
        bot_message = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "session_id": session_id,
            "content": ai_response,
            "sender": "bot",
            "timestamp": datetime.now().isoformat()
        }
        db.insert_message(bot_message)

        return {
            "response": ai_response,
            "session_id": session_id,
            "user_message_id": user_message["id"],
            "bot_message_id": bot_message["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
