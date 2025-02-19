import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Flask backend

function App() {
  const [imageData, setImageData] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Reset everything on first load
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Start the game: fetch image and quiz
  const startGame = async () => {
    setGameStarted(true);
    setScore(null);
    setPlayerAnswers({});
  
    try {
      // Fetch Image
      const imageRes = await axios.get(`${API_URL}/get_image`);
      setImageData(imageRes.data);
  
      // Fetch Quiz
      const quizRes = await axios.post(`${API_URL}/get_quiz`, {
        image_url: imageRes.data.image_url,
      });
  
      console.log("Raw AI Quiz Response:", quizRes.data.quiz); // Log raw response for debugging
  
      // Convert AI response to structured multiple-choice format
      const formattedQuiz = parseQuiz(quizRes.data.quiz);
      if (formattedQuiz.length === 0) {
        console.error("Quiz parsing failed: No valid questions were generated.");
      }
  
      setQuiz(formattedQuiz);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  // Convert AI-generated text into structured multiple-choice quiz format
  const parseQuiz = (quizText) => {
    if (!quizText || typeof quizText !== "string") {
      console.error("Invalid quiz data received:", quizText);
      return [];
    }
  
    const questions = quizText.split("\n").filter(q => q.trim() !== ""); // Remove blank lines
  
    return questions
      .map((q, index) => {
        const parts = q.split(" - ").map(part => part.trim());
  
        if (parts.length !== 5) {  // Expecting 5 parts: Question + 4 answer choices
          console.warn(`Skipping invalid question format: ${q}`);
          return null;
        }
  
        return {
          id: index,
          question: parts[0], // Use the first part as the question
          choices: [parts[1], parts[2], parts[3], parts[4]], // 4 answer choices
          correctAnswer: parts[1] // The first answer is assumed correct
        };
      })
      .filter(q => q !== null); // Remove invalid entries
  };

  // Handle Player's Answer Selection
  const handleAnswerSelect = (questionId, answer) => {
    setPlayerAnswers({ ...playerAnswers, [questionId]: answer });
  };

  // Calculate Score
  const calculateScore = () => {
    let correctCount = 0;
    quiz.forEach((q) => {
      if (playerAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  // Restart Game
  const restartGame = () => {
    setGameStarted(false);
    setImageData(null);
    setQuiz([]);
    setPlayerAnswers({});
    setScore(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">SnapQuiz</h1>

      {!gameStarted ? (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={startGame}
          >
            Start Game
          </button>
        </>
      ) : (
        <>
          {/* Show Image */}
          {imageData && (
            <div className="mb-4">
              <img
                src={imageData.image_url}
                alt="Quiz"
                className="rounded shadow-lg w-96 h-auto"
              />
            </div>
          )}

          {/* Show Quiz */}
          <div className="mt-4 p-4 bg-gray-800 rounded shadow-lg w-96">
            {quiz.map((q) => (
              <div key={q.id} className="mb-4">
                <h2 className="text-lg font-semibold">{q.question}</h2>
                {q.choices.map((choice, index) => (
                  <label
                    key={index}
                    className="block bg-gray-700 p-2 mt-2 rounded cursor-pointer hover:bg-gray-600"
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={choice}
                      checked={playerAnswers[q.id] === choice}
                      onChange={() => handleAnswerSelect(q.id, choice)}
                      className="mr-2"
                    />
                    {choice}
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Show Score or Submit Button */}
          {!score ? (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={calculateScore}
            >
              Submit Quiz
            </button>
          ) : (
            <div className="mt-4 text-xl font-semibold">
              Your Score: {score} / {quiz.length}
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={restartGame}
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
