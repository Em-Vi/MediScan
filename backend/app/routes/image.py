from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import os
import shutil
import traceback
from app.services.ai_service import analyze_image
from app.services.image_service import extract_text_from_file

router = APIRouter(prefix="/image")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze_prescription(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Analyze an uploaded prescription image:
    1. Extract text using OCR (pytesseract)
    2. Analyze text with Gemini model
    3. Return structured analysis to user
    """
    temp_file_path = None
    try:
        # Check if file is an image
        content_type = file.content_type
        
        if not content_type or not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate a unique filename and save the file
        file_extension = os.path.splitext(file.filename)[1]
        if not file_extension:
            file_extension = ".jpg"
        
        # Save as a persistent file
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        
        if file_size == 0:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Create file URL
        file_url = f"/uploads/{filename}"
        
        # Analyze the image using OCR + Gemini
        analysis = await analyze_image(file_path)
        
        return {
            "analysis": analysis,
            "image": {
                "id": str(uuid.uuid4()),
                "url": file_url,
                "filename": file.filename
            }
        }
    except Exception as e:
        error_message = str(e)
        
        # Try to clean up temporary file if it exists
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass
            
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {error_message}")

