import httpx
from app.db import db
from app.config import settings

RESEND_API_KEY = settings.RESEND_API_KEY
FROM_EMAIL = settings.FROM_EMAIL
FRONTEND_URL = settings.FRONTEND_URL

async def send_verification_email(to_email: str, token: str):
    verify_url = f"{FRONTEND_URL}/verify-email/confirm?token={token}"
    await db["users"].update_one({"email": to_email}, {"$set": {"verification_token": token}})
    
    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": "Verify your Email",
        "html": f"<p>Click <a href='{verify_url}'>here</a> to verify your account.</p>",
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
        print(response.status_code, response.text)
