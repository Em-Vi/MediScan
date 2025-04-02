import uvicorn
import os
import shutil

# Clear out __pycache__ directories before starting
for root, dirs, files in os.walk("."):
    if "__pycache__" in dirs:
        cache_dir = os.path.join(root, "__pycache__")
        print(f"Removing cache directory: {cache_dir}")
        shutil.rmtree(cache_dir)

# Print environment variables for debugging
print(f"GEMINI_API_KEY set: {'GEMINI_API_KEY' in os.environ}")
if 'GEMINI_API_KEY' in os.environ:
    key = os.environ['GEMINI_API_KEY']
    print(f"API key length: {len(key)}")
    print(f"API key preview: {key[:5]}...{key[-5:]}")

# Run the server with debug logging
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")