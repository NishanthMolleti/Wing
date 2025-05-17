import os
import sys
from dotenv import load_dotenv

def setup_environment():
    # Load environment variables from .env file
    load_dotenv()
    
    # Get API key from environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables")
        print("Please set your API key using:")
        print("export GEMINI_API_KEY='your_api_key_here'")
        sys.exit(1)
    
    return api_key

if __name__ == "__main__":
    api_key = setup_environment()
    print("Environment setup successful!") 