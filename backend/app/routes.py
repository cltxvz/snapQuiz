from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from app.services import fetch_image, generate_quiz

# Create a Flask Blueprint for routes
main = Blueprint("main", __name__)

@main.route("/get_quiz", methods=["POST"])
@cross_origin()  # Ensure CORS is applied to this route
def get_quiz():
    """Fetch an image (or multiple images) and generate a quiz."""
    
    print("Request received for quiz generation")  # Debugging log

    game_mode = request.json.get("mode", "Basic Mode")  # Get mode from request
    print(f"Game Mode Selected: {game_mode}")

    # Fetch images based on the selected game mode
    num_images = 1
    if game_mode == "2-Images":
        num_images = 2
    elif game_mode == "4-Images":
        num_images = 4

    image_urls = []
    for _ in range(num_images):
        image_data = fetch_image()
        if not image_data or "image_url" not in image_data:
            print("Failed to fetch an image. Retrying...")
            continue
        image_urls.append(image_data["image_url"])

    if len(image_urls) < num_images:
        print("Could not fetch enough images.")
        return jsonify({"error": "Could not fetch enough valid images."}), 500

    print(f"Processing Images: {image_urls}")

    # Generate Quiz
    quiz = generate_quiz(image_urls, game_mode)
    if quiz.startswith("ERROR"):
        print("AI failed to generate a quiz.")
        return jsonify({"error": "AI quiz generation failed."}), 500

    response_data = {
        "image_urls": image_urls,  # Send all image URLs
        "quiz": quiz
    }

    print(f"Sending API Response: {response_data}")  # Debugging log
    return jsonify(response_data)

@main.route("/wake_up", methods=["GET"])
def wake_up():
    """Dummy route to wake up the backend."""
    return jsonify({"message": "Server is awake!"}), 200

@main.route("/get_image")
def get_image():
    """API Endpoint to get a valid image."""
    image_data = fetch_image()
    if image_data:
        return jsonify(image_data)
    return jsonify({"error": "Could not fetch image"}), 500
