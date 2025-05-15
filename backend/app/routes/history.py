from fastapi import APIRouter, HTTPException
from typing import List
from app.db import db

router = APIRouter(prefix="/history")

@router.get("/{user_id}")
async def get_user_history(user_id: str):
    """Get all message history for a user"""
    try:
        # Get all sessions for the user
        sessions = db.get_all_user_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")
        
#             session_id = msg.get("session_id")
#             if session_id not in sessions:
#                 sessions[session_id] = {
#                     "id": session_id,
#                     "messages": [],
#                     "last_message": "",
#                     "last_message_date": "",
#                     "title": "Conversation"
#                 }
            
#             sessions[session_id]["messages"].append(msg)
            
#             # Update session metadata based on message
#             msg_date = msg.get("timestamp")
#             last_date = sessions[session_id]["last_message_date"]
            
#             if not last_date or msg_date > last_date:
#                 sessions[session_id]["last_message"] = msg.get("content", "")[:50] + "..."
#                 sessions[session_id]["last_message_date"] = msg_date
        
#         # Convert to list and sort by last message date (newest first)
#         session_list = list(sessions.values())
#         session_list.sort(key=lambda s: s["last_message_date"], reverse=True)
        
#         return {"sessions": session_list}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")

@router.get("/{user_id}/{session_id}")
async def get_session_messages(user_id: str, session_id: str):
    """Get all messages for a specific session"""
    try:
        messages = db.get_messages_for_session(user_id, session_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session messages: {str(e)}")
