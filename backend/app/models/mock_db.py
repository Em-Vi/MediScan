import os
import json
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MockDB:
    """Simple file-based database for development"""
    
    def __init__(self):
        self.data_dir = os.path.join(os.getcwd(), "mock_data")
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._initialize_file("users.json", [])
        self._initialize_file("messages.json", [])
        self._initialize_file("files.json", [])
    
    def _initialize_file(self, filename, default_data):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, "w") as f:
                json.dump(default_data, f)
    
    def _read_file(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {filename}: {str(e)}")
            return []
    
    def _write_file(self, filename, data):
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error writing to {filename}: {str(e)}")
            return False
    
    def get_user(self, user_id):
        users = self._read_file("users.json")
        for user in users:
            if user.get("id") == user_id:
                return user
        return None
    
    def create_user(self, user_data):
        users = self._read_file("users.json")
        
        # Check if user exists
        for user in users:
            if user.get("email") == user_data.get("email"):
                return user
        
        # Ensure user has an ID
        if "id" not in user_data:
            user_data["id"] = str(uuid.uuid4())
        
        # Add timestamps if missing
        if "createdAt" not in user_data:
            user_data["createdAt"] = datetime.now().isoformat()
        if "lastLogin" not in user_data:
            user_data["lastLogin"] = datetime.now().isoformat()
        
        users.append(user_data)
        self._write_file("users.json", users)
        return user_data
    
    def insert_message(self, message_data):
        messages = self._read_file("messages.json")
        
        # Ensure message has an ID
        if "id" not in message_data:
            message_data["id"] = str(uuid.uuid4())
        
        # Add timestamp if missing
        if "timestamp" not in message_data:
            message_data["timestamp"] = datetime.now().isoformat()
        
        messages.append(message_data)
        self._write_file("messages.json", messages)
        return message_data
    
    def get_messages_by_user(self, user_id):
        messages = self._read_file("messages.json")
        return [msg for msg in messages if msg.get("user_id") == user_id]
    
    def get_messages_by_session(self, session_id):
        messages = self._read_file("messages.json")
        return [msg for msg in messages if msg.get("session_id") == session_id]
    
    def insert_file(self, file_data):
        files = self._read_file("files.json")
        
        # Ensure file has an ID
        if "id" not in file_data:
            file_data["id"] = str(uuid.uuid4())
        
        files.append(file_data)
        self._write_file("files.json", files)
        return file_data

# Create a global instance
db = MockDB()