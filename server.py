from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from setup_env import setup_environment

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Setup environment and get API key
GEMINI_API_KEY = setup_environment()

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    url = data.get('url')
    prompt = data.get('prompt')

    if not url or not prompt:
        return jsonify({'error': 'Missing URL or prompt'}), 400

    try:
        # Initialize Gemini model with safety settings
        generation_config = {
            "temperature": 0.7,
            "top_p": 1,
            "top_k": 1,
            "max_output_tokens": 2048,
        }

        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
        ]

        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        # Create the full prompt
        full_prompt = f"{prompt}\nURL: {url}"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        if response.prompt_feedback.block_reason:
            return jsonify({'error': f'Content blocked: {response.prompt_feedback.block_reason}'}), 400
            
        return jsonify({'analysis': response.text})
    
    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5001
    port = int(os.environ.get('PORT', 5001))
    # Run the server on all interfaces (0.0.0.0) instead of just localhost
    app.run(host='0.0.0.0', port=port, debug=False) 