import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ImagePage({ gameData, setGameData }) {
    const navigate = useNavigate();
    
    const totalImages = gameData.imageData?.image_urls?.length || 1;

    // Load saved state from localStorage or set defaults
    const [currentImageIndex, setCurrentImageIndex] = useState(() => {
        return parseInt(localStorage.getItem("currentImageIndex")) || 0;
    });

    const [timeLeft, setTimeLeft] = useState(() => {
        return parseInt(localStorage.getItem("imageTimer")) || 15;
    });

    useEffect(() => {
        if (!gameData.imageData || !gameData.imageData.image_urls) {
            navigate("/");
            return;
        }

        // If quiz has already started, redirect immediately
        if (localStorage.getItem("quizStarted") === "true") {
            navigate("/quiz");
            return;
        }
    }, [gameData, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    localStorage.setItem("imageTimer", newTime);

                    if (newTime === 0) {
                        clearInterval(timer);

                        if (currentImageIndex < totalImages - 1) {
                            // Move to next image
                            const newIndex = currentImageIndex + 1;
                            setCurrentImageIndex(newIndex);
                            localStorage.setItem("currentImageIndex", newIndex);
                            setTimeLeft(15);
                            localStorage.setItem("imageTimer", 15);
                        } else {
                            // Last image: Redirect to quiz and set flag
                            localStorage.setItem("quizStarted", "true"); // Prevents re-showing images
                            setTimeout(() => {
                                localStorage.removeItem("imageTimer");
                                localStorage.removeItem("currentImageIndex");
                                navigate("/quiz");
                            }, 2000);
                        }
                    }

                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft, currentImageIndex, totalImages, navigate]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="container text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                {timeLeft > 0 ? (
                    <>
                        {gameData.imageData?.image_urls && gameData.imageData.image_urls.length > 0 ? (
                            <img 
                                src={gameData.imageData.image_urls[currentImageIndex]} 
                                alt={`Scene ${currentImageIndex + 1} for quiz`}
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
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                }} 
                            />
                        ) : (
                            <p className="text-danger">⚠️ Image not available.</p>
                        )}

                        <p className="text-xl font-semibold" style={{ color: "black" }}>
                            Memorize this image!
                        </p>

                        <div className="w-64 bg-gray-700 rounded-full h-4 mt-2 relative">
                            <div
                                className="bg-green-500 h-4 rounded-full absolute"
                                style={{
                                    width: `${(timeLeft / 15) * 100}%`,
                                    transition: "width 1s linear"
                                }}
                            ></div>
                        </div>

                        <p className="text-lg font-semibold mt-1" style={{ color: "black" }}>
                            {timeLeft} seconds left
                        </p>
                    </>
                ) : (
                    <h3 className="fw-bold">Time's up! Redirecting to quiz...</h3>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default ImagePage;
