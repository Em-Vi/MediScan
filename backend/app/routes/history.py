from fastapi import APIRouter, HTTPException
from typing import List
from app.db import db
from bson import ObjectId

router = APIRouter(prefix="/history")

from app.models.chat import ChatModel
from app.models.message import MessageModel

def clean_mongo_types(obj):
    if isinstance(obj, dict):
        return {k: clean_mongo_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_mongo_types(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif hasattr(obj, "isoformat"):
        return obj.isoformat()
    return obj

@router.get("/{user_id}")
async def get_user_history(user_id: str):
    """Get all chat sessions for a user, with last message and date"""
    try:
        # Fetch all chats for the user (async)
        chat_docs = await db.chats.find({"user_id": ObjectId(user_id)}).to_list(length=None)
        sessions = []
        for chat in chat_docs:
            chat_id = chat["_id"]
            # Get the last message for this chat (async)
            last_msg = await db.messages.find_one({"chat_id": chat_id}, sort=[("timestamp", -1)])
            session = {
                "id": str(chat_id),
                "title": chat.get("title", "Untitled Chat"),
                "created_at": chat.get("created_at"),
                "updated_at": chat.get("updated_at"),
                "last_message": last_msg["content"] if last_msg else None,
                "last_message_date": last_msg["timestamp"] if last_msg else None,
            }
            sessions.append(session)
        # Sort sessions by last_message_date (newest first)
        sessions.sort(key=lambda s: s["last_message_date"] or s["created_at"], reverse=True)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")
        
#            
@router.get("/{user_id}/{session_id}")
async def get_session_messages(user_id: str, session_id: str):
    """Get all messages for a specific session"""
    try:
        query = {"chat_id": ObjectId(session_id)}
        messages_cursor = db.messages.find(query).sort("timestamp", 1)
        messages = await messages_cursor.to_list(length=None)
        # Recursively clean all ObjectId and datetime fields
        messages = [clean_mongo_types(msg) for msg in messages]
        for msg in messages:
            msg["id"] = msg.get("_id", msg.get("id"))
            msg["sender"] = msg.get("role", "user")
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session messages: {str(e)}")