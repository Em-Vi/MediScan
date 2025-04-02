import pytesseract
from PIL import Image
import io
import os

def extract_text_from_image(image_data: bytes) -> str:
    """Extract text from image data using pytesseract OCR"""
    image = Image.open(io.BytesIO(image_data))
    return pytesseract.image_to_string(image)

def extract_text_from_file(file_path: str) -> str:
    """Extract text from image file using pytesseract OCR"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Image file not found: {file_path}")
    
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)
