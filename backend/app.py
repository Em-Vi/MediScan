import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from .env
api_key = os.getenv("GEMINI_API_KEY")
# Set up API key
genai.configure(api_key=api_key)

# Initialize model
model = genai.GenerativeModel("gemini-2.0-flash")

# Example query
prompt = """
You are an AI Pharmacist specialized in assisting doctors and pharmacists.
- Provide accurate, well-researched responses on drugs, dosages, and interactions.
- If unsure, suggest consulting a licensed pharmacist or doctor.
- Do not provide treatment plans or diagnose conditions.
- Format responses in a clear, structured way.
"""
response = model.generate_content(prompt + "\n\nUser: Can I take ibuprofen with aspirin?")
print(response)