import os
import google.generativeai as genai
from app.config import GEMINI_API_KEY
import logging
from app.services.image_service import extract_text_from_image


logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure the Gemini API if API key is available
if GEMINI_API_KEY:
    logger.info("GEMINI_API_KEY is set. Configuring Gemini API...")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    logger.info("Gemini model initialized successfully")
else:
    logger.warning("GEMINI_API_KEY is not set. AI responses will be mocked.")

# System prompt for context
SYSTEM_PROMPT = """
You are an advanced AI-powered pharmacy assistant named AutoDoc designed to support pharmacists in analyzing prescriptions, detecting drug interactions, providing patient counseling points, and assessing prescription safety. Your responses should be structured, concise, and clinically accurate based on the latest drug databases. Follow these guidelines when processing input:
1.  Drug Interaction Detection:
o  Identify potential major & moderate drug interactions.
o  Provide a brief explanation of the interaction, possible adverse effects, and recommendations.
o  If a serious interaction exists, highlight it with a warning message.
2.  Patient Counseling Points:
o  Provide essential patient counseling points, including dosage instructions, administration guidelines, common side effects, and storage recommendations.
o  Highlight any lifestyle modifications needed (e.g., avoid alcohol, take with food).
3.  Prescription Safety Assessment:
o  Extract age and weight of the patient from the prescription.
o  Verify if prescribed drug doses are appropriate for the patient's age and weight.
o  Flag overdoses or subtherapeutic doses and provide a suggestion for dose correction.
o  Identify any contraindicated drugs for the patient based on age.
4.  General Drug Queries:
o  Answer any queries about drug mechanism of action, indications, contraindications, side effects, metabolism, and excretion.
o  Provide information on alternative medications if needed.
If multiple drugs are provided, process all of them sequentially and summarize findings clearly. Ensure all responses are evidence-based and easy to understand for healthcare professionals.
"""

# Prescription analysis prompt
PRESCRIPTION_ANALYSIS_PROMPT = """
I have extracted the following text from a prescription image using OCR. Please analyze it and provide a structured response with the following information:

OCR EXTRACTED TEXT:
{extracted_text}

Please provide:
1. All medications identified with their dosages and frequencies
2. Any patient information detected (age, weight, etc.)
3. Potential issues with dosages or drug combinations
4. Appropriate patient counseling points for each medication
5. Any parts that seem illegible or unclear from the OCR text

Format your response in clear sections with appropriate markdown formatting. If the OCR text is incomplete or unclear, please indicate this and provide analysis based on what is available.
"""

def generate_ai_response(message: str) -> str:
    try:
        logger.info(f"Generating AI response for message: {message[:50]}...")
        
        if not GEMINI_API_KEY:
            logger.warning("No API key available, returning mock response")
            return "This is a mock response because the GEMINI_API_KEY is not set."
            
        # Combine system prompt with user message
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}"
        logger.info("Sending prompt to Gemini API")
        response = model.generate_content(full_prompt)
        logger.info("Response received from Gemini API")
        
        return response.text
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error generating AI response: {error_message}")
        
        if "API key not valid" in error_message.lower():
            return "Error: The Gemini API key is not valid. Please check your API key."
        
        return "I'm sorry, I encountered an error while processing your request. Please try again."

async def analyze_image(image_path: str) -> str:
    """
    Analyze a prescription image by:
    1. Extracting text using pytesseract OCR
    2. Sending the extracted text to Gemini for analysis
    
    Args:
        image_path: Path to the image file
    
    Returns:
        String containing the analysis results
    """
    try:
        logger.info(f"Starting image analysis for file: {image_path}")
        
        if not GEMINI_API_KEY:
            logger.warning("No API key available, returning mock response")
            return "Image analysis is not available because the GEMINI_API_KEY is not set."
        
        if not os.path.exists(image_path):
            logger.error(f"Image file not found: {image_path}")
            return "Error: Image file not found."
        
        # Read image file as bytes
        logger.info(f"Reading image file: {image_path}")
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        logger.info(f"Read {len(image_data)} bytes from image file")
        
        # Extract text using pytesseract OCR
        logger.info("Calling pytesseract OCR to extract text from image")
        extracted_text = extract_text_from_image(image_data)
        
        if not extracted_text or extracted_text.strip() == "":
            logger.warning("No text was extracted from the image")
            return "No text could be extracted from the image. The image might be unclear, rotated, or doesn't contain readable text."
        
        logger.info(f"Successfully extracted text ({len(extracted_text)} characters)")
        logger.info(f"Extracted text sample: {extracted_text[:200]}..." if len(extracted_text) > 200 else f"Extracted text: {extracted_text}")
        
        # Format prompt with extracted text
        logger.info("Formatting prompt with extracted text")
        analysis_prompt = PRESCRIPTION_ANALYSIS_PROMPT.format(extracted_text=extracted_text)
        
        # Combine system prompt with specific analysis prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\n{analysis_prompt}"
        
        # Send to Gemini for analysis
        logger.info("Sending prompt to Gemini API for analysis")
        response = model.generate_content(full_prompt)
        logger.info("Response received from Gemini API")
        
        return response.text
    except Exception as e:
        error_message = str(e)
        logger.error(f"Error analyzing image: {error_message}")
        
        if "API key not valid" in error_message.lower():
            return "Error: The Gemini API key is not valid. Please check your API key."
            
        return f"I'm sorry, I encountered an error while analyzing the image: {error_message}"
