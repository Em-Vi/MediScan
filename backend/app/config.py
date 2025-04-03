import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Google API key for Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OCR_SPACE_API_KEY = os.getenv("OCR_SPACE_API_KEY")

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate required credentials
if not GEMINI_API_KEY:
    print("WARNING: No GEMINI_API_KEY found in environment variables.")
    print("Please set the GEMINI_API_KEY environment variable or create a .env file.")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase credentials are missing in environment variables.")
    print("Please set SUPABASE_URL and SUPABASE_KEY in environment variables or .env file.")