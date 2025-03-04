import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ScorePage({ gameData, setGameData }) {
    const navigate = useNavigate();

    // If quiz or score data is missing, redirect to the Welcome Page
    useEffect(() => {
        if (!gameData || !gameData.quiz || gameData.quiz.length === 0 || gameData.score === null) {
            navigate("/");
        }
    }, [gameData, navigate]);

    // Wipe game data when user navigates away from the score page
    useEffect(() => {
        const handleUnload = () => {
            localStorage.clear(); // Clear storage
            localStorage.setItem("imageTimer", 15); // Reset image timer

            setGameData((prevGameData) => ({
                imageData: null,
                quiz: [],
                playerAnswers: {}, // Reset answers
                score: null,
                mode: prevGameData?.mode || "Basic Mode", // Preserve selected mode
            }));
        };

        // Listen for route change (user leaving the score page)
        return () => handleUnload();
    }, [setGameData, gameData?.mode]); // Include gameData.mode in dependencies

    // Prevent rendering if data is missing
    if (!gameData || !gameData.quiz || gameData.quiz.length === 0 || gameData.score === null) {
        return null;
    }

    const { score, quiz, imageData, playerAnswers } = gameData;

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* HEADER */}
            <Header />

            {/* MAIN CONTENT */}
            <div className="container text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <h2 className="text-xl fw-bold mb-4 mt-4">Results</h2>

                {/* Image Display */}
                {imageData?.image_url && (
                    <div className="mb-4 text-center">
                        <img 
                            src={imageData.image_url} 
                            alt="Quiz Reference" 
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
                )}

                {/* Enlarged Final Score */}
                <p className="text-lg fw-bold" style={{ fontSize: "2.5rem" }}>
                    Final Score: {score} / {quiz.length}
                </p>

                {/* Display All Questions & User Answers */}
                <div className="mt-4 p-4 bg-light rounded shadow-lg w-75 text-start">
                    {quiz.length > 0 ? (
                        quiz.map((q) => (
                            <div key={q.id} className="mb-4">
                                <h4 className="text-dark">{q.question || "Question not available"}</h4>
                                <p className="text-success fw-bold">
                                    Correct Answer: {q.correctAnswer}
                                </p>
                                <p className={`fw-bold ${playerAnswers[q.id] === q.correctAnswer ? "text-success" : "text-danger"}`}>
                                    Your Answer: {playerAnswers[q.id] || "No answer selected"}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-danger">No quiz data available.</p>
                    )}
                </div>

                {/* Play Again Button */}
                <div className="mt-4">
                    <button className="btn btn-danger px-4 py-2 fw-bold mb-4" onClick={() => navigate("/")}>
                        Play Again
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}

export default ScorePage;
