import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import QuizNavigation from "../components/QuizNavigation"; // Navigation Buttons

function QuizPage({ gameData, setGameData }) {
    const navigate = useNavigate();

    const [playerAnswers, setPlayerAnswers] = useState(() => gameData.playerAnswers || {});
    const [currentQuestion, setCurrentQuestion] = useState(() => gameData.currentQuestion || 0);
    const [quizEnded, setQuizEnded] = useState(false);

    // Load saved timer state from localStorage
    const [timeLeft, setTimeLeft] = useState(() => {
        return parseInt(localStorage.getItem("quizTimer")) || 15; // Default to 15 seconds
    });

    useEffect(() => {
        if (!gameData.quiz || gameData.quiz.length === 0) {
            navigate("/");
        }
    }, [gameData, navigate]);

    const quiz = gameData.quiz;

    // Handles answer selection
    const handleAnswerSelection = (choice) => {
        const updatedAnswers = { ...playerAnswers, [quiz[currentQuestion].id]: choice };
        setPlayerAnswers(updatedAnswers);
        setGameData((prevGameData) => ({
            ...prevGameData,
            playerAnswers: updatedAnswers,
        }));
    };

    // Moves to the next question or submits the quiz
    const nextQuestion = () => {
        if (currentQuestion < quiz.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setGameData((prevGameData) => ({
                ...prevGameData,
                currentQuestion: currentQuestion + 1,
            }));
        } else {
            setQuizEnded(true); // Set state, triggering `useEffect`
        }
    };

    // Moves to the previous question
    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
            setGameData((prevGameData) => ({
                ...prevGameData,
                currentQuestion: currentQuestion - 1,
            }));
        }
    };

    // Ensure the score calculation function is memoized
    const calculateScore = useCallback(() => {
        let correctCount = 0;
        quiz.forEach((q) => {
            if (playerAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });

        setGameData((prevGameData) => {
            const updatedGameData = {
                ...prevGameData,
                score: correctCount,
                playerAnswers,
                currentQuestion: 0,
            };

            // Clear the saved timer when quiz ends
            localStorage.removeItem("quizTimer");

            // Use a timeout to ensure state updates before navigating
            setTimeout(() => navigate("/score"), 500);

            return updatedGameData;
        });
    }, [playerAnswers, quiz, navigate, setGameData]);

    // Auto-submit quiz when time runs out
    useEffect(() => {
        if (timeLeft <= 0 && !quizEnded) {
            setQuizEnded(true);
        }
    }, [timeLeft, quizEnded]);

    // Ensure that score calculation runs only when the quiz ends
    useEffect(() => {
        if (quizEnded) {
            calculateScore();
        }
    }, [quizEnded, calculateScore]);

    // Timer Logic - Saves and retrieves time left
    useEffect(() => {
        if (gameData.mode !== "Timed Mode") return; // Only apply in Timed Mode

        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;
                    localStorage.setItem("quizTimer", newTime); // Save updated timer state

                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft, gameData.mode]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="container text-start flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                {gameData.mode === "Timed Mode" && (
                    <p className="fw-bold">Time Remaining: {timeLeft} seconds</p>
                )}
                <div className="mt-4 p-4 bg-light rounded shadow-lg w-75">
                    <h2 className="text-lg font-semibold mb-4">
                        {quiz[currentQuestion]?.question || "Loading..."}
                    </h2>
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
                    <QuizNavigation
                        currentQuestion={currentQuestion}
                        totalQuestions={quiz.length}
                        onPrev={prevQuestion}
                        onNext={nextQuestion}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default QuizPage;
