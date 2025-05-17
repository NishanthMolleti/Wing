import google.generativeai as genai
from setup_env import setup_environment

def test_gemini_setup():
    # Get API key
    api_key = setup_environment()
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    
    # List available models
    print("Available models:")
    for m in genai.list_models():
        print(f"- {m.name}")
    
    # Test simple generation with Gemini 1.5 Pro
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content("Hello, how are you?")
        print("\nTest response:", response.text)
    except Exception as e:
        print(f"\nError testing Gemini 1.5 Pro: {str(e)}")
        print("\nTrying with Gemini 1.0 Pro as fallback...")
        try:
            model = genai.GenerativeModel('gemini-1.0-pro')
            response = model.generate_content("Hello, how are you?")
            print("\nTest response with 1.0 Pro:", response.text)
        except Exception as e:
            print(f"\nError with fallback: {str(e)}")

if __name__ == "__main__":
    test_gemini_setup() 