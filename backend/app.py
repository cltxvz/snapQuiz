import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, jsonify

# Load environment variables
load_dotenv()
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Google Gemini AI
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)

def generate_quiz(image_url, difficulty="medium"):
    """Uses Google Gemini AI to generate quiz questions based on the image and difficulty level."""
    
    difficulty_prompts = {
        "easy": "Make the questions simple and focus on basic details.",
        "medium": "Make the questions moderately difficult, including object details and colors.",
        "hard": "Make the questions very detailed and challenging, focusing on obscure details."
    }
    
    prompt = f"""
    Look at this image: {image_url}.
    Generate a short quiz (10 questions) to test someone's memory after seeing the image.
    {difficulty_prompts.get(difficulty, 'Make the questions moderately difficult.')}
    """

    try:
        model = genai.GenerativeModel("gemini-pro")  # Use Gemini Pro model
        response = model.generate_content(prompt)

        if response and response.text:
            return response.text.strip()

    except Exception as e:
        print(f"Error in AI quiz generation: {e}")
    
    return "Could not generate quiz."

@app.route('/get_quiz/<difficulty>')
def get_quiz(difficulty):
    """API Endpoint to get a quiz based on the image and difficulty."""
    image_url = fetch_random_image()
    if image_url:
        quiz = generate_quiz(image_url, difficulty)
        return jsonify({"image_url": image_url, "quiz": quiz})
    return jsonify({"error": "Could not generate quiz"}), 500

def fetch_random_image():
    """Fetches a random image from Unsplash API."""
    url = f"https://api.unsplash.com/photos/random?client_id={UNSPLASH_ACCESS_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        image_url = data.get("urls", {}).get("regular")  # Get the regular-sized image
        if image_url:
            return image_url

    return None

@app.route('/get_image')
def get_image():
    """API Endpoint to get a random image from Unsplash."""
    image_url = fetch_random_image()
    if image_url:
        return jsonify({"image_url": image_url})
    return jsonify({"error": "Could not fetch image"}), 500

if __name__ == '__main__':
    app.run(debug=True)
