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
import mimetypes
import re
import time

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Google Gemini AI
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
# Allow all origins for development
CORS(app, resources={r"/*": {"origins": "*"}})  # Allows frontend requests

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
    """Downloads the image and converts it to a compatible JPEG format."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(image_url, headers=headers, stream=True)

        if response.status_code == 200:
            print(f"Downloading Image from: {image_url}")  # Debugging log
            img = Image.open(BytesIO(response.content))

            # Convert to RGB mode to avoid issues with non-standard formats
            img = img.convert("RGB")

            # Resize if necessary (prevents oversized images)
            max_size = (1024, 1024)  # Limit image size
            img.thumbnail(max_size)

            # Save as JPEG for Gemini compatibility
            image_path = "temp_image.jpg"
            img.save(image_path, "JPEG")

            print("Image Successfully Processed and Saved")
            return image_path
        else:
            print("Failed to download image.")
            return None
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None



def generate_quiz(image_url):
    """Generates structured multiple-choice quiz questions using Google Gemini Vision."""

    image_path = download_image(image_url)
    if not image_path:
        return "ERROR: Could not download image for analysis."

    try:
        uploaded_file = genai.upload_file(image_path)

        prompt = f"""
        Analyze this image and generate a **challenging** multiple-choice quiz with 10 questions.

        **IMPORTANT RULES:**
        - Each question must be **a full sentence** that clearly describes an object, color, shape, or element in the image.
        - Each question must have **exactly 4 answer choices**.
        - The **correct answer must always be the first choice**.
        - Make good, meaningful questions and not just generic ones. Actually analyze the image and make questions.
        - Never ask what the dominant color of the image is.
        - STRICT FORMAT (no extra text before or after):
          "What is the dominant color in the image? - Blue - Red - Green - Yellow"
          "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
        - **Avoid** code, numbers, or abstract answers.
        - **Make answers logical and visually understandable for a player.**
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([prompt, uploaded_file])

        os.remove(image_path)

        if response and response.text:
            quiz_text = response.text.strip()
            if "ERROR" in quiz_text or len(quiz_text) < 10:
                print("AI returned an invalid quiz.")
                return "ERROR: Quiz generation failed."
            return quiz_text

    except Exception as e:
        print(f"Error in AI quiz generation: {e}")
        return "ERROR: AI failed to generate quiz."

@app.route('/get_quiz', methods=['POST'])
def get_quiz():
    """Fetch a valid image and generate a quiz based on it."""
    max_retries = 5  # Limit the number of retries to avoid infinite loops
    attempts = 0

    while attempts < max_retries:
        attempts += 1
        print(f"Attempt {attempts}: Fetching new image...")

        # Step 1: Fetch an Image
        image_data = fetch_random_image()
        if not image_data or "image_url" not in image_data:
            print("⚠️ Failed to fetch a valid image. Retrying...")
            continue  # Fetch another image

        image_url = image_data["image_url"]
        print(f"Image Found: {image_url}")

        # Step 2: Try to Generate Quiz
        print("Generating quiz with AI for this image...")
        quiz = generate_quiz(image_url)

        if quiz.startswith("ERROR") or "Could not generate quiz" in quiz:
            print("AI failed to process the image. Retrying...")
            continue  # Fetch another image

        # Return both the image URL and the generated quiz
        return jsonify({
            "image_url": image_url,  # Ensure the correct image is sent
            "quiz": quiz
        })

    # If all attempts fail, return an error message
    print("Max retries reached. No valid images found.")
    return jsonify({"error": "Could not find a valid image after multiple attempts. Please refresh the page and try again."}), 500

@app.route('/get_image')
def get_image():
    """API Endpoint to get a valid image."""
    image_data = fetch_random_image()
    if image_data:
        return jsonify(image_data)
    return jsonify({"error": "Could not fetch image"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
    