from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.database import db
from app.utils.auth_utils import get_current_user

router = APIRouter()

@router.get("/{user_id}")
async def get_user_messages(user_id: str, user=Depends(get_current_user)):
    """Get all messages for a user"""
    try:
        messages = db.get_messages_by_user(user_id)
        
        # Group messages by session_id
        sessions = {}
        for msg in messages:
            session_id = msg.get("session_id", "default")
            if session_id not in sessions:
                sessions[session_id] = {
                    "id": session_id,
                    "title": "Conversation",  # Default title
                    "lastMessageDate": msg.get("timestamp"),
                    "messages": []
                }
            
            # Update session data
            sessions[session_id]["messages"].append(msg)
            
            # Update last message date if current message is newer
            if msg.get("timestamp") > sessions[session_id]["lastMessageDate"]:
                sessions[session_id]["lastMessageDate"] = msg.get("timestamp")
                sessions[session_id]["lastMessage"] = msg.get("content", "")
        
        # Create a list of sessions
        session_list = list(sessions.values())
        
        # Sort sessions by last message date (newest first)
        session_list.sort(key=lambda x: x["lastMessageDate"], reverse=True)
        
        # Generate titles from first user message if not set
        for session in session_list:
            if session["title"] == "Conversation":
                user_messages = [m for m in session["messages"] if m.get("sender") == "user"]
                if user_messages:
                    first_msg = user_messages[0]["content"]
                    session["title"] = first_msg[:30] + ("..." if len(first_msg) > 30 else "")
        
        return {"sessions": session_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving messages: {str(e)}")

@router.get("/{user_id}/{session_id}")
async def get_session_messages(user_id: str, session_id: str, user=Depends(get_current_user)):
    """Get all messages for a specific session"""
    try:
        messages = db.get_messages_by_session(session_id)
        
        # Filter by user_id for security
        messages = [msg for msg in messages if msg.get("user_id") == user_id]
        
        # Sort by timestamp
        messages.sort(key=lambda x: x.get("timestamp", ""))
        
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session messages: {str(e)}")
