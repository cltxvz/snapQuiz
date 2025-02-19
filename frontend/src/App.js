import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WelcomePage from "./components/WelcomePage";

const API_URL = "http://127.0.0.1:5000"; // Flask backend

function App() {
  const [imageData, setImageData] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  // Start game: Wait for both image and quiz before showing anything
  const startGame = async () => {
    setGameStarted(true);
    setScore(null);
    setPlayerAnswers({});
    setShowImage(false);
    setQuizStarted(false);
    setStartingGame(false);
    setLoadingStatus("Finding image online...");
  
    try {
      // Fetch Image
      const imageRes = await axios.get(`${API_URL}/get_image`);
      setImageData(imageRes.data); // ✅ Ensure image data is stored
  
      // Fetch Quiz
      setLoadingStatus("Generating quiz with AI... (might take a few seconds)");
      const quizRes = await axios.post(`${API_URL}/get_quiz`, {
        image_url: imageRes.data.image_url,
      });
  
      console.log("Raw AI Quiz Response:", quizRes.data.quiz);
  
      // Convert AI response to structured multiple-choice format
      const formattedQuiz = parseQuiz(quizRes.data.quiz);
  
      if (formattedQuiz.length === 0) {
        console.error("Quiz parsing failed: No valid questions were generated.");
        alert("Quiz generation failed. Please try again.");
        setGameStarted(false);
        return;
      }
  
      setQuiz(formattedQuiz);
      setLoadingStatus("");
  
      // Show "Starting game..." for 3 seconds
      setStartingGame(true);
      setTimeout(() => {
        setStartingGame(false);
        setShowImage(true);
  
        // Start countdown timer
        let countdown = 15;
        setTimeLeft(countdown);
        const timer = setInterval(() => {
          countdown -= 1;
          setTimeLeft(countdown);
  
          if (countdown === 0) {
            clearInterval(timer);
            setShowImage(false);
            setQuizStarted(true);
          }
        }, 1000);
      }, 3000); // 3-second delay before showing the image
  
    } catch (error) {
      console.error("Error starting game:", error);
      alert("An error occurred. Please try again.");
      setGameStarted(false);
    }
  };
  

  // Convert AI-generated text into structured multiple-choice quiz format
  const parseQuiz = (quizText) => {
    if (!quizText || typeof quizText !== "string") {
      console.error("Invalid quiz data received:", quizText);
      return [];
    }
  
    if (quizText.startsWith("ERROR")) {
      console.error("AI Error:", quizText);
      return [];
    }
  
    const questions = quizText.split("\n").filter(q => q.trim() !== "");
  
    return questions
      .map((q, index) => {
        const parts = q.split(" - ").map(part => part.trim());
  
        if (parts.length !== 5) {
          console.warn(`Skipping invalid question format: ${q}`);
          return null;
        }
  
        const correctAnswer = parts[1]; // The AI always places the correct answer first
        const choices = [parts[1], parts[2], parts[3], parts[4]];
  
        // Shuffle choices once before storing in state
        const shuffledChoices = choices
          .map(choice => ({ choice, sort: Math.random() })) // Attach random sort key
          .sort((a, b) => a.sort - b.sort) // Sort randomly
          .map(({ choice }) => choice); // Extract shuffled choices
  
        return {
          id: index,
          question: parts[0],
          choices: shuffledChoices, // Store shuffled choices
          correctAnswer: correctAnswer, // Keep track of the correct answer
        };
      })
      .filter(q => q !== null);
  };
  
  

  // Move to the next question or show results
  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  // Move to the previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
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

  return (
    <div className="d-flex flex-column min-vh-100 bg-gray-900 text-white">
      <Header />
  
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        {!gameStarted ? (
          <WelcomePage onStart={startGame} />
        ) : (
          <>
            {loadingStatus ? (
              <p className="text-xl font-semibold" style={{ color: "black" }}>{loadingStatus}</p>
            ) : startingGame ? (
              <p className="text-xl font-semibold" style={{ color: "black" }}>Starting game...</p>
            ) : showImage ? (
              <>
                <div className="mb-4 text-center" style={{ marginTop: "30px" }}>
                  <img 
                    src={imageData?.image_url} 
                    alt="Quiz" 
                    className="rounded shadow-lg" 
                    style={{
                      width: "80%",  
                      maxWidth: "1000px", 
                      minWidth: "1000px",
                      height: "auto", 
                      maxHeight: "800px",
                      minHeight: "800px", 
                      objectFit: "contain", 
                      border: "5px solid #333", 
                    }} 
                  />
                </div>
                <p className="text-xl font-semibold" style={{ color: "black" }}>Memorize this image!</p>
  
                {/* Timer Display */}
                <div className="w-64 bg-gray-700 rounded-full h-4 mt-2 relative">
                  <div
                    className="bg-green-500 h-4 rounded-full absolute"
                    style={{ width: `${(timeLeft / 15) * 100}%`, transition: "width 1s linear" }}
                  ></div>
                </div>
                <p className="text-lg font-semibold mt-2" style={{ color: "black" }}>{timeLeft} seconds left</p>
              </>
            ) : !showResults && quizStarted && quiz.length > 0 ? (
              <>
                <div 
                  className="mt-4 p-4 bg-gray-100 rounded shadow-lg w-96 text-center"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)"
                  }}
                >
                  <h2 
                    className="text-lg font-semibold mb-4"
                    style={{ color: "#333", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px" }}
                  >
                    {quiz[currentQuestion]?.question || "Loading..."}
                  </h2>
  
                  {/* Answer Choices */}
                  <div>
                    {quiz[currentQuestion]?.choices?.map((choice, index) => (
                      <button
                        key={index}
                        className="w-full p-3 my-2 rounded transition-all"
                        onClick={() => 
                          setPlayerAnswers({ ...playerAnswers, [quiz[currentQuestion]?.id]: choice })
                        }
                        style={{
                          backgroundColor: playerAnswers[quiz[currentQuestion]?.id] === choice ? "#d6d6d6" : "#f5f5f5",
                          color: playerAnswers[quiz[currentQuestion]?.id] === choice ? "#333" : "#333",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textAlign: "left",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.3s ease-in-out",
                          display: "block",
                          width: "100%"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#d6d6d6"}
                        onMouseOut={(e) => e.target.style.backgroundColor = playerAnswers[quiz[currentQuestion]?.id] === choice ? "#d6d6d6" : "#f5f5f5"}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
  
                  {/* Navigation Buttons */}
                  <div className="mt-4 flex justify-between">
                    {currentQuestion > 0 && (
                      <button 
                        className="px-4 py-2 rounded bg-gray-500 text-white"
                        onClick={prevQuestion}
                        style={{
                          backgroundColor: "#6c757d",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          border: "none",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          transition: "background-color 0.3s ease-in-out",
                          marginRight: "7px"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#5a6268"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#6c757d"}
                      >
                        Previous
                      </button>
                    )}
                    <button 
                      className="px-4 py-2 rounded bg-green-500 text-white"
                      onClick={nextQuestion}
                      style={{
                        backgroundColor: "#28a745",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        border: "none",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        transition: "background-color 0.3s ease-in-out"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
                    >
                      {currentQuestion === quiz.length - 1 ? "Submit Quiz" : "Next"}
                    </button>
                  </div>
                </div>
              </>
            ) : showResults && quiz.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4" style={{ color: "black" }}>Results</h2>
  
                {imageData && imageData.image_url && (
                  <div className="mb-4">
                    <img src={imageData.image_url} alt="Quiz" className="rounded shadow-lg w-96 h-auto" />
                  </div>
                )}
  
                <p className="text-lg font-bold" style={{ color: "black" }}>
                  Final Score: {score} / {quiz.length}
                </p>
  
                <div className="mt-4 p-4 bg-gray-800 rounded shadow-lg w-96">
                  {quiz.map((q) => (
                    <div key={q.id} className="mb-4">
                      <h2 className="text-lg font-semibold" style={{ color: "black" }}>
                        {q.question || "Question not available"}
                      </h2>
                      <p className="text-green-400 font-bold" style={{ color: "black" }}>
                        Correct Answer: {q.correctAnswer}
                      </p>
                      <p
                        className={`font-bold ${
                          playerAnswers[q.id] === q.correctAnswer ? "text-green-400" : "text-red-400"
                        }`}
                        style={{ color: "black" }}
                      >
                        Your Answer: {playerAnswers[q.id] || "No answer selected"}
                      </p>
                    </div>
                  ))}
                </div>
  
                <button className="bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={() => window.location.reload()}>
                  Play Again
                </button>
              </>
            ) : (
              <p className="text-xl font-semibold" style={{ color: "black" }}>Loading results...</p>
            )}
          </>
        )}
      </main>
  
      <Footer />
    </div>
  );
        
}

export default App;
