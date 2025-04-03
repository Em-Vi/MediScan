from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import os
import shutil
import traceback
import logging
from app.services.ai_service import analyze_image
from app.services.image_service import extract_text_from_file

router = APIRouter()
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        logger.info(f"Uploading file: {file.filename} for user_id: {user_id}")
        
        # Check if file is an image
        content_type = file.content_type
        if not content_type or not content_type.startswith("image/"):
            logger.warning(f"Invalid file type: {content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        if not file_extension:  # If no extension provided, default to .jpg
            file_extension = ".jpg"
        
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        logger.info(f"Saving file to: {file_path}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved successfully. Size: {os.path.getsize(file_path)} bytes")
        
        # Create file URL (in production, this would be a proper URL)
        file_url = f"/uploads/{filename}"
        
        file_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "filename": filename,
            "file_url": file_url
        }
        
        logger.info(f"Upload successful: {file_url}")
        
        return {
            "id": file_data["id"],
            "url": file_url,
            "filename": file.filename
        }
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error uploading file: {error_message}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error uploading file: {error_message}")

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
        logger.info(f"Processing image for user_id: {user_id}, file: {file.filename}")
        
        # Check if file is an image
        content_type = file.content_type
        logger.info(f"File content type: {content_type}")
        
        if not content_type or not content_type.startswith("image/"):
            logger.warning(f"Invalid file type: {content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate a unique filename and save the file
        file_extension = os.path.splitext(file.filename)[1]
        if not file_extension:
            file_extension = ".jpg"
        
        # Save as a persistent file
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        logger.info(f"Saving file to: {file_path}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        logger.info(f"File saved successfully. Size: {file_size} bytes")
        
        if file_size == 0:
            logger.error("File is empty")
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Create file URL
        file_url = f"/uploads/{filename}"
        
        # Analyze the image using OCR + Gemini
        logger.info("Beginning image analysis")
        analysis = await analyze_image(file_path)
        logger.info("Analysis complete")
        
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
        logger.error(f"Error analyzing image: {error_message}")
        logger.error(traceback.format_exc())
        
        # Try to clean up temporary file if it exists
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass
            
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {error_message}")

@router.post("/ocr")
async def extract_text(
    file: UploadFile = File(...)
):
    try:
        logger.info(f"OCR text extraction for file: {file.filename}")
        
        # Check if file is an image
        content_type = file.content_type
        if not content_type or not content_type.startswith("image/"):
            logger.warning(f"Invalid file type: {content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save the file temporarily
        temp_file_path = os.path.join(UPLOAD_DIR, f"temp_{uuid.uuid4()}.jpg")
        logger.info(f"Saving temporary file to: {temp_file_path}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Temporary file saved. Size: {os.path.getsize(temp_file_path)} bytes")
        
        # Extract text using pytesseract OCR
        logger.info("Beginning OCR text extraction")
        extracted_text = extract_text_from_file(temp_file_path)
        logger.info(f"OCR extraction complete. Text length: {len(extracted_text)}")
        
        # Delete temp file
        os.remove(temp_file_path)
        logger.info(f"Temporary file deleted: {temp_file_path}")
        
        return {"text": extracted_text}
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error extracting text: {error_message}")
        logger.error(traceback.format_exc())
        
        # Try to clean up temporary file if it exists
        try:
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass
            
        raise HTTPException(status_code=500, detail=f"Error extracting text: {error_message}")
