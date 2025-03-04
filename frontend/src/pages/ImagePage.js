import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ImagePage({ gameData, setGameData }) {
    const navigate = useNavigate();
    
    // Retrieve the saved time left from localStorage or use default 15s
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = localStorage.getItem("imageTimer");
        return savedTime ? parseInt(savedTime, 10) : 15;
    });

    // Debugging check: Log the image URL
    useEffect(() => {
    }, [gameData]);

    useEffect(() => {
        // If there's no image data, redirect to welcome page
        if (!gameData.imageData || !gameData.imageData.image_url) {
            navigate("/");
            return;
        }

        // Start the countdown only if there's time left
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    
                    // Save remaining time to localStorage
                    localStorage.setItem("imageTimer", newTime);

                    if (newTime === 0) {
                        clearInterval(timer);
                        setTimeout(() => {
                            localStorage.removeItem("imageTimer"); // Clear timer storage after use
                            navigate("/quiz");
                        }, 2000);
                    }
                    
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft, gameData, navigate]);

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* HEADER - Always visible */}
            <Header />

            {/* MAIN CONTENT */}
            <div className="container text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                {timeLeft > 0 ? (
                    <>
                        {/* IMAGE DISPLAY - Only render if gameData.imageData.image_url exists */}
                        {gameData.imageData?.image_url ? (
                            <div className="mb-4 text-center" style={{ marginTop: "30px" }}>
                                <img 
                                    src={gameData.imageData.image_url} 
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
                        ) : (
                            <p className="text-danger">⚠️ Image not available. Check gameData or CORS settings.</p>
                        )}

                        <p className="text-xl font-semibold" style={{ color: "black" }}>
                            Memorize this image!
                        </p>

                        {/* TIMER DISPLAY */}
                        <div className="w-64 bg-gray-700 rounded-full h-4 mt-2 relative">
                            <div
                                className="bg-green-500 h-4 rounded-full absolute"
                                style={{
                                    width: `${(timeLeft / 15) * 100}%`,
                                    transition: "width 1s linear"
                                }}
                            ></div>
                        </div>

                        <p className="text-lg font-semibold mt-2" style={{ color: "black" }}>
                            {timeLeft} seconds left
                        </p>
                    </>
                ) : (
                    <h3 className="fw-bold">Time's up! Redirecting to quiz...</h3>
                )}
            </div>

            {/* FOOTER - Always visible */}
            <Footer />
        </div>
    );
}

export default ImagePage;
