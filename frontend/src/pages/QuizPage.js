import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Timer from "../components/Timer"; // Timer Component
import QuizNavigation from "../components/QuizNavigation"; // Navigation Buttons

function QuizPage({ gameData, setGameData }) {
    const navigate = useNavigate();

    // Load player answers from gameData if they exist
    const [playerAnswers, setPlayerAnswers] = useState(() => gameData.playerAnswers || {});
    const [currentQuestion, setCurrentQuestion] = useState(() => gameData.currentQuestion || 0);

    // Redirect to home if quiz data is missing
    useEffect(() => {
        if (!gameData.quiz || gameData.quiz.length === 0) {
            navigate("/");
        }
    }, [gameData, navigate]);

    const quiz = gameData.quiz;

    // Handles answer selection and updates game data
    const handleAnswerSelection = (choice) => {
        const updatedAnswers = { ...playerAnswers, [quiz[currentQuestion].id]: choice };
        setPlayerAnswers(updatedAnswers);
        setGameData({ ...gameData, playerAnswers: updatedAnswers });
    };

    // Moves to the next question or submits the quiz
    const nextQuestion = () => {
        if (currentQuestion < quiz.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setGameData({ ...gameData, currentQuestion: currentQuestion + 1 });
        } else {
            calculateScore();
        }
    };

    // Moves to the previous question
    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setGameData({ ...gameData, currentQuestion: currentQuestion - 1 });
        }
    };

    // Calculates the score and redirects to results page
    const calculateScore = () => {
        let correctCount = 0;
        quiz.forEach((q) => {
            if (playerAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });

        setGameData({ 
            ...gameData, 
            score: correctCount, 
            playerAnswers, // Store answers so they persist
            currentQuestion: 0 // Reset question index for next game
        });

        navigate("/score");
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* HEADER */}
            <Header />

            {/* MAIN CONTENT */}
            <div className="container text-start flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                {/* Display Timer Only for Timed Mode */}
                {gameData.mode === "Timed Mode" && (
                    <Timer duration={30} onTimeUp={calculateScore} />
                )}

                {/* Question Display */}
                <div className="mt-4 p-4 bg-light rounded shadow-lg w-75">
                    <h2 className="text-lg font-semibold mb-4">
                        {quiz[currentQuestion]?.question || "Loading..."}
                    </h2>

                    {/* Answer Choices */}
                    <div>
                        {quiz[currentQuestion]?.choices.map((choice, index) => (
                            <button
                                key={index}
                                className={`w-100 p-3 my-2 rounded ${
                                    playerAnswers[quiz[currentQuestion]?.id] === choice
                                        ? "btn btn-primary"
                                        : "btn btn-outline-secondary"
                                }`}
                                onClick={() => handleAnswerSelection(choice)}
                            >
                                {choice}
                            </button>
                        ))}
                    </div>

                    {/* Quiz Navigation Buttons */}
                    <QuizNavigation
                        currentQuestion={currentQuestion}
                        totalQuestions={quiz.length}
                        onPrev={prevQuestion} 
                        onNext={nextQuestion} 
                    />
                </div>
            </div>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}

export default QuizPage;
