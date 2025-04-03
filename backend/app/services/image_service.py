import pytesseract
from PIL import Image
import io
import os
import logging

logger = logging.getLogger(__name__)

def extract_text_from_image(image_data: bytes) -> str:
    """Extract text from image data using pytesseract OCR"""
    try:
        logger.info(f"Extracting text from image bytes of size: {len(image_data)} bytes")
        image = Image.open(io.BytesIO(image_data))
        logger.info(f"Image opened successfully. Size: {image.size}, Format: {image.format}")
        
        text = pytesseract.image_to_string(image)
        logger.info(f"Text extraction complete. Extracted text length: {len(text)}")
        logger.info(f"Extracted text: {text[:200]}..." if len(text) > 200 else f"Extracted text: {text}")
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image bytes: {str(e)}")
        raise

def extract_text_from_file(file_path: str) -> str:
    """Extract text from image file using pytesseract OCR"""
    try:
        if not os.path.exists(file_path):
            logger.error(f"Image file not found: {file_path}")
            raise FileNotFoundError(f"Image file not found: {file_path}")
        
        logger.info(f"Extracting text from image file: {file_path}")
        logger.info(f"File size: {os.path.getsize(file_path)} bytes")
        
        image = Image.open(file_path)
        logger.info(f"Image opened successfully. Size: {image.size}, Format: {image.format}")
        
        text = pytesseract.image_to_string(image)
        logger.info(f"Text extraction complete. Extracted text length: {len(text)}")
        logger.info(f"Extracted text: {text[:200]}..." if len(text) > 200 else f"Extracted text: {text}")
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from file {file_path}: {str(e)}")
        raise
