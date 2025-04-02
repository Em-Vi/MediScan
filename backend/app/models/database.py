import os
from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class SupabaseDB:
    """Database access layer using Supabase"""
    
    def get_user(self, user_id: str):
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    
    def create_user(self, user_data):
        response = supabase.table('users').insert(user_data).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    
    def insert_message(self, message_data):
        response = supabase.table('messages').insert(message_data).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    
    def get_messages_by_user(self, user_id: str):
        response = supabase.table('messages').select('*').eq('user_id', user_id).execute()
        return response.data if response.data else []

    def get_messages_by_session(self, session_id: str):
        response = supabase.table('messages').select('*').eq('session_id', session_id).execute()
        return response.data if response.data else []

# Create a global instance
db = SupabaseDB()