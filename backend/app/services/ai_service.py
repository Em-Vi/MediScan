import os
import google.generativeai as genai
import requests
from app.config import settings
from app.services.image_service import extract_text_from_image

OCR_SPACE_API_KEY = settings.OCR_SPACE_API_KEY
GEMINI_API_KEY = settings.GEMINI_API_KEY

# Configure the Gemini API if API key is available
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
else:
    model = None

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
        if not GEMINI_API_KEY or not model:
            return "This is a mock response because the GEMINI_API_KEY is not set."
        # Combine system prompt with user message
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        error_message = str(e)
        if "API key not valid" in error_message.lower():
            return "Error: The Gemini API key is not valid. Please check your API key."
        return "I'm sorry, I encountered an error while processing your request. Please try again."

async def analyze_image(image_path: str) -> str:
    """
    Analyze a prescription image by:
    1. Extracting text using OCR.space API
    2. Sending the extracted text to Gemini for analysis
    """
    try:
        if not GEMINI_API_KEY or not model:
            return "Image analysis is not available because the GEMINI_API_KEY is not set."
        if not OCR_SPACE_API_KEY:
            return "Image analysis is not available because the OCR_SPACE_API_KEY is not set."
        if not os.path.exists(image_path):
            return "Error: Image file not found."
        # Extract text using OCR.space API
        url = "https://api.ocr.space/parse/image"
        headers = {"apikey": OCR_SPACE_API_KEY}
        params = {"language": "eng", "isOverlayRequired": "false", "detectOrientation": "true"}
        with open(image_path, "rb") as file:
            files = {"file": file}
            response = requests.post(url, headers=headers, params=params, files=files)
        if response.status_code != 200:
            return "Error: The OCR service returned an error. Please try again later."
        ocr_result = response.json()
        if ocr_result.get("OCRExitCode") != 1:
            error_msg = ocr_result.get("ErrorMessage", "Unknown OCR error")
            return f"OCR processing error: {error_msg}"
        parsed_results = ocr_result.get("ParsedResults", [])
        if not parsed_results:
            return "No text could be extracted from the image. The image might be unclear or doesn't contain readable text."
        extracted_text = ""
        for result in parsed_results:
            text = result.get("ParsedText", "")
            if text:
                extracted_text += text + "\n"
        if not extracted_text or extracted_text.strip() == "":
            return "No text could be extracted from the image. The image might be unclear, rotated, or doesn't contain readable text."
        analysis_prompt = PRESCRIPTION_ANALYSIS_PROMPT.format(extracted_text=extracted_text)
        full_prompt = f"{SYSTEM_PROMPT}\n\n{analysis_prompt}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        error_message = str(e)
        if "API key not valid" in error_message.lower():
            return "Error: The API key is not valid. Please check your API keys."
        return f"I'm sorry, I encountered an error while analyzing the image: {error_message}"
