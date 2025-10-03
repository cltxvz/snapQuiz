# app/services.py

import os
import requests
import random
import google.generativeai as genai
import mimetypes
from PIL import Image
from io import BytesIO
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load API key
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Wikimedia Commons Image Fetching
def fetch_image():
    """Fetches a random image from Wikimedia Commons while filtering out non-image files."""
    topics = ["nature", "landscape", "animals", "architecture", "food", "art", "history"]
    search_topic = random.choice(topics)
    base_url = "https://commons.wikimedia.org"
    random_file_url = f"{base_url}/wiki/Special:Random/File"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        for _ in range(5):  # Retry up to 5 times to get a valid image
            response = requests.get(random_file_url, headers=headers)
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, "lxml")
            image_div = soup.find("div", class_="fullMedia")
            if image_div:
                image_link = image_div.find("a")
                if image_link and "href" in image_link.attrs:
                    full_image_url = image_link["href"]
                    if not full_image_url.startswith("http"):
                        full_image_url = "https:" + full_image_url  # Ensure HTTPS

                    # **Check MIME type to ensure it's an image**
                    mime_type, _ = mimetypes.guess_type(full_image_url)
                    if mime_type and mime_type.startswith("image") and not mime_type.endswith(("svg", "pdf", "webm", "svg+xml", "gif")):
                        print(f"Extracted Image URL: {full_image_url}")  # Debugging log
                        return {
                            "image_url": full_image_url,
                            "description": f"A random {search_topic} image from Wikimedia Commons"
                        }
                    else:
                        print(f"Skipping non-image file: {full_image_url}")

    except Exception as e:
        print(f"Error fetching image: {e}")
    
    return None  # Return None if no valid image is found after retries

# Download Image for AI Processing
def download_image(image_url):
    """Downloads and converts the image to a compatible format for AI processing."""
    
    # Ensure image_url is a full string, not a character
    if not isinstance(image_url, str) or not image_url.startswith("http"):
        print(f"Skipping invalid image URL: {image_url}")  
        return None  

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(image_url, headers=headers, stream=True)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img.thumbnail((1024, 1024))  # Limit size
            image_path = f"temp_image_{random.randint(1000,9999)}.jpg"
            img.save(image_path, "JPEG")

            print(f"Image Downloaded & Saved: {image_path}")  
            return image_path
        else:
            print(f"Failed to download image. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading image: {e}")
    
    return None


# Generate AI Quiz Based on Game Mode
def generate_quiz(image_urls, mode="Basic Mode"):
    """Generates a structured multiple-choice quiz based on game mode."""

    # Ensure `image_urls` is a list, even if it's a single image.
    if isinstance(image_urls, str):  
        image_urls = [image_urls]  # Convert single URL to a list

    print(f"Processing Images: {image_urls}")  # Debugging log

    image_paths = [download_image(url) for url in image_urls if isinstance(url, str) and url.startswith("http")]
    
    if not image_paths or None in image_paths:
        return "ERROR: Could not download images for analysis."

    # Upload images to AI
    uploaded_files = []
    for path in image_paths:
        try:
            uploaded_file = genai.upload_file(path)
            if uploaded_file:
                uploaded_files.append(uploaded_file)
            else:
                print(f"AI File Upload Failed: {path}")
                return "ERROR: AI file upload failed."
        except Exception as e:
            print(f"AI File Upload Error: {e}")
            return "ERROR: AI file upload exception."

    print(f"AI File Upload Successful: {uploaded_files}")

    # Define AI Prompt
    if mode == "Basic Mode":
        prompt = """
        Analyze this image and generate a **challenging** multiple-choice quiz with 5 questions.

        **IMPORTANT RULES:**
        - Each question must be **a full sentence** that clearly describes an object, color, shape, or element in the image.
        - Each question must have **exactly 4 answer choices**.
        - The **correct answer must always be the first choice**.
        - Make good, meaningful questions and not just generic ones. Actually analyze the image and make questions.
        - Avoid overly abstract questions (like emotions or feelings).
        - Never ask what the dominant color in the image is.
        - STRICT FORMAT (no extra text before or after):
          "What is the dominant color in the image? - Blue - Red - Green - Yellow"
          "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
        - **Avoid** code, numbers, or overly abstract answers.
        """

    elif mode == "2-Images":
        prompt = """
        You will analyze TWO images and generate a quiz combining elements from both images.

        **Rules:**
        - Create 5 multiple-choice questions.
        - Some questions should ask about details from Image 1, others from Image 2.
        - At least one question must compare both images.
        - Example comparison question: "Which image has more trees? - Image 1 - Image 2 - Both equally - Neither"
        - When your answer choices reference Images, don't specify in parenthesis what they are. For example, if image one is a 
        bird and image two is a tree, your answer choices should be Image 1, Image 2, and not Image 1 (bird) and Image 2 (tree).
        **IMPORTANT RULES:**
        - Each question must be **a full sentence** that clearly describes an object, color, shape, or element in the image.
        - Each question must have **exactly 4 answer choices**.
        - The **correct answer must always be the first choice**.
        - Make good, meaningful questions and not just generic ones. Actually analyze the image and make questions.
        - Avoid overly abstract questions (like emotions or feelings).
        - Never ask what the dominant color in the image is.
        - STRICT FORMAT (no extra text before or after):
          "What is the dominant color in the image? - Blue - Red - Green - Yellow"
          "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
        - **Avoid** code, numbers, or overly abstract answers.
        """

    elif mode == "4-Images":
        prompt = """
        You will analyze FOUR images and generate a quiz combining elements from all images.

        **Rules:**
        - Create 5 multiple-choice questions.
        - Some questions should ask about details from specific images.
        - At least two questions must compare multiple images.
        - Example comparison question: "Which image has the most red color? - Image 1 - Image 2 - Image 3 - Image 4"
        - When your answer choices reference Images, don't specify in parenthesis what they are. For example, if image one is a 
        bird and image two is a tree, your answer choices should be Image 1, Image 2, and not Image 1 (bird) and Image 2 (tree).
        **IMPORTANT RULES:**
        - Each question must be **a full sentence** that clearly describes an object, color, shape, or element in the image.
        - Each question must have **exactly 4 answer choices**.
        - The **correct answer must always be the first choice**.
        - Make good, meaningful questions and not just generic ones. Actually analyze the image and make questions.
        - Avoid overly abstract questions (like emotions or feelings).
        - Never ask what the dominant color in the image is.
        - STRICT FORMAT (no extra text before or after):
          "What is the dominant color in the image? - Blue - Red - Green - Yellow"
          "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
        - **Avoid** code, numbers, or overly abstract answers.
        """

    elif mode == "Timed Mode":
        prompt = """
        Generate an **increasingly difficult** quiz based on this image.

        **Rules:**
        - Create at least 5 questions (users answer as many as possible in limited time).
        - The first few questions should be easy, then gradually harder.
        - Ensure variety in difficulty.
        **IMPORTANT RULES:**
        - Each question must be **a full sentence** that clearly describes an object, color, shape, or element in the image.
        - Each question must have **exactly 4 answer choices**.
        - The **correct answer must always be the first choice**.
        - Make good, meaningful questions and not just generic ones. Actually analyze the image and make questions.
        - Avoid overly abstract questions (like emotions or feelings).
        - Never ask what the dominant color in the image is.
        - STRICT FORMAT (no extra text before or after):
          "What is the dominant color in the image? - Blue - Red - Green - Yellow"
          "What object is located in the upper right corner? - A bird - A lamp - A tree - A cloud"
        - **Avoid** code, numbers, or overly abstract answers.
        """

    else:
        return "ERROR: Invalid game mode."

    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content([prompt] + uploaded_files)

        # Log AI response
        print(f"AI Raw Response: {response.text}")

        # Remove temp images after processing
        for path in image_paths:
            os.remove(path)

        if response and response.text:
            quiz_text = response.text.strip()
            if "ERROR" in quiz_text or len(quiz_text) < 10:
                return "ERROR: Quiz generation failed."
            return quiz_text
        else:
            return "ERROR: AI returned empty response."

    except Exception as e:
        print(f"Error generating AI quiz: {e}")
        return "ERROR: AI quiz generation failed."
