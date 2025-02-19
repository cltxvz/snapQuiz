import React from "react";

function WelcomePage({ onStart }) {
  return (
    <div className="container text-center text-black">
      <h2 className="fw-bold">Welcome to SnapQuiz!</h2>
      <p className="mt-5 fs-5 text-black">
        Your challenge: Memorize a randomly selected image from the internet and answer questions based on what you saw.
      </p>
      <p className="fs-5 text-black">
        The image will be visible for 15 seconds. After that, the quiz will begin.
      </p>
      <p className="fs-5 text-black">
        Don't like the image you got? Refresh the page and start again!
      </p>
      <button
        className="btn btn-warning btn-lg mt-4 mb-5"
        onClick={onStart}
      >
        Start Game
      </button>
    </div>
  );
}

export default WelcomePage;
