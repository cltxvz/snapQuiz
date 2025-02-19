import os
import requests
import random
import google.generativeai as genai
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from bs4 import BeautifulSoup

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Google Gemini AI
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS

def fetch_random_image():
    """Scrapes a random full-resolution image from Wikimedia Commons."""
    
    topics = ["nature", "landscape", "animals", "architecture", "food", "art", "history"]
    search_topic = random.choice(topics)

    base_url = "https://commons.wikimedia.org"
    random_file_url = f"{base_url}/wiki/Special:Random/File"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        # Step 1: Get Random File Page
        response = requests.get(random_file_url, headers=headers)
        print(f"Fetching random Wikimedia Commons image from: {random_file_url}")
        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "lxml")

        # Step 2: Find the full-resolution image URL
        image_div = soup.find("div", class_="fullMedia")
        if image_div:
            image_link = image_div.find("a")
            if image_link and "href" in image_link.attrs:
                full_image_url = image_link["href"]

                # Ensure the URL is correctly formatted
                if not full_image_url.startswith("https:"):
                    full_image_url = "https:" + full_image_url

                print(f"Selected full-size image: {full_image_url}")

                return {
                    "image_url": full_image_url,
                    "description": f"A random {search_topic} image from Wikimedia Commons"
                }

    except Exception as e:
        print(f"Error in fetch_random_image(): {e}")

    return None

def download_image(image_url):
    """Downloads the image and returns it as a Pillow Image object, handling potential Wikimedia restrictions."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(image_url, headers=headers, stream=True)

        print(f"Downloading image: {image_url}")
        print(f"Response status: {response.status_code}")

        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            return img

    except Exception as e:
        print(f"Error downloading image: {e}")

    return None


def generate_quiz(image_url):
    """Generates structured multiple-choice quiz questions using Google Gemini Vision."""

    img = download_image(image_url)
    if not img:
        return "Could not download image for analysis."

    prompt = f"""
    Analyze this image carefully and generate a **challenging** multiple-choice quiz with 10 questions.

    **IMPORTANT RULES:**
    - Each question must be **a full sentence**.
    - Each question must have **exactly 4 answer choices**.
    - The **correct answer must always be the first choice**.
    - Questions should test **detailed observation skills**, such as:
      ✅ Specific colors, patterns, or objects in the image.
      ✅ Relationships between objects in the scene.
      ✅ Rarely noticed details like background elements.
    - STRICT FORMAT (no extra text before or after):
      "What is the dominant color in the image? - Blue - Red - Green - Yellow"
      "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
      "What pattern appears on the main subject's clothing? - Stripes - Dots - Plaid - Plain"
    - Do **NOT** include:
      ❌ Any introduction text  
      ❌ "Here is a multiple-choice quiz..."  
      ❌ Explanations before or after the questions  
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([prompt, img])

        if response and response.text:
            quiz_text = response.text.strip()

            # Remove any AI-generated intro or extra text
            if "Here is a multiple-choice quiz" in quiz_text:
                quiz_text = quiz_text.split("\n", 1)[-1].strip()  # Remove the first line

            return quiz_text

    except Exception as e:
        print(f"Error in AI quiz generation: {e}")

    return "Could not generate quiz."



@app.route('/get_quiz', methods=['POST'])
def get_quiz():
    """API Endpoint to get a quiz based on an existing image."""
    data = request.json  
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "Missing image data"}), 400

    quiz = generate_quiz(image_url)  # Pass only the image_url
    return jsonify({"image_url": image_url, "quiz": quiz})


@app.route('/get_image')
def get_image():
    """API Endpoint to get a random image from Wikimedia Commons."""
    image_data = fetch_random_image()
    if image_data:
        return jsonify(image_data)
    return jsonify({"error": "Could not fetch image"}), 500

if __name__ == '__main__':
    app.run(debug=True)
