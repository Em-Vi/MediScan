import os
import google.generativeai as genai
import requests
# from app.config import GEMINI_API_KEY,OCR_SPACE_API_KEY
import logging
from app.services.image_service import extract_text_from_image


logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

OCR_SPACE_API_KEY = ""
GEMINI_API_KEY = ""
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
    1. Extracting text using OCR.space API
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
        
        if not OCR_SPACE_API_KEY:
            logger.warning("No OCR.space API key available")
            return "Image analysis is not available because the OCR_SPACE_API_KEY is not set."
        
        if not os.path.exists(image_path):
            logger.error(f"Image file not found: {image_path}")
            return "Error: Image file not found."
        
        # Extract text using OCR.space API
        logger.info(f"Sending image to OCR.space API: {image_path}")
        
        url = "https://api.ocr.space/parse/image"
        
        # Set headers with API key
        headers = {
            "apikey": OCR_SPACE_API_KEY
        }
        
        # Prepare parameters
        params = {
            "language": "eng",
            "isOverlayRequired": "false",
            "detectOrientation": "true",
        }
        
        with open(image_path, "rb") as file:
            files = {"file": file}
            logger.info("Sending request to OCR.space API")
            response = requests.post(url, headers=headers, params=params, files=files)
        
        # Check for successful response
        if response.status_code != 200:
            logger.error(f"OCR.space API error: {response.status_code} - {response.text}")
            return "Error: The OCR service returned an error. Please try again later."
        
        # Parse the OCR response
        ocr_result = response.json()
        logger.info(f"OCR.space response received: {ocr_result.get('OCRExitCode')}")
        
        # Check for OCR exit code (1 = success)
        if ocr_result.get("OCRExitCode") != 1:
            error_msg = ocr_result.get("ErrorMessage", "Unknown OCR error")
            logger.error(f"OCR.space processing error: {error_msg}")
            return f"OCR processing error: {error_msg}"
        
        # Extract the parsed text from OCR result
        parsed_results = ocr_result.get("ParsedResults", [])
        if not parsed_results:
            logger.warning("No parsed results in OCR.space response")
            return "No text could be extracted from the image. The image might be unclear or doesn't contain readable text."
        
        # Combine all parsed text from results
        extracted_text = ""
        for result in parsed_results:
            text = result.get("ParsedText", "")
            if text:
                extracted_text += text + "\n"
        
        # Check if we got any text
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
        import traceback
        logger.error(traceback.format_exc())
        
        if "API key not valid" in error_message.lower():
            return "Error: The API key is not valid. Please check your API keys."
            
        return f"I'm sorry, I encountered an error while analyzing the image: {error_message}"
