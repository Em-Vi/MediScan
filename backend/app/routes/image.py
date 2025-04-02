from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import os
import shutil
from datetime import datetime
from app.services.ai_service import analyze_image
from app.services.image_service import extract_text_from_file
from app.models.database import db

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create file URL (in production, this would be a proper URL)
        file_url = f"/uploads/{filename}"
        
        # Store file info in database
        file_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "filename": filename,
            "original_filename": file.filename,
            "file_path": file_path,
            "file_url": file_url,
            "uploaded_at": datetime.now().isoformat()
        }
        
        db.insert_file(file_data)
        
        return {
            "id": file_data["id"],
            "url": file_url,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/analyze")
async def analyze_prescription(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Save the file temporarily
        temp_file_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}.jpg")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze the image using OCR + Gemini
        analysis = await analyze_image(temp_file_path)
        
        # Delete temp file
        os.remove(temp_file_path)
        
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

@router.post("/ocr")
async def extract_text(
    file: UploadFile = File(...)
):
    try:
        # Save the file temporarily
        temp_file_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}.jpg")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text using pytesseract OCR
        extracted_text = extract_text_from_file(temp_file_path)
        
        # Delete temp file
        os.remove(temp_file_path)
        
        return {"text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")
