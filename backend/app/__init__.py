import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize Google Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Enable CORS for all routes
    CORS(app)

    # Register API routes from routes.py
    from app.routes import main
    app.register_blueprint(main)

    return app
