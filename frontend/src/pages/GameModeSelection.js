import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function GameModeSelection({ gameData, setGameData }) {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState(gameData.mode || "Basic Mode");

    const gameModes = {
        "Basic Mode": {
            description: "A standard game where you see one image and answer questions about it.",
            rules: [
                "You will see one image for 15 seconds.",
                "After that, answer AI-generated questions based on the image.",
                "Score is based on correct answers."
            ],
        },
        "2-Images": {
            description: "Memorize two images before answering questions!",
            rules: [
                "You will see two images for 15 seconds each.",
                "Then, answer questions based on both images.",
                "Score is based on correct answers."
            ],
        },
        "4-Images": {
            description: "A challenging mode where you must remember four images.",
            rules: [
                "You will see four images for 15 seconds each.",
                "Answer AI-generated questions covering all images.",
                "Score is based on correct answers."
            ],
        },
        "Timed Mode": {
            description: "Answer as many questions as you can before the timer runs out!",
            rules: [
                "You will see one image for 15 seconds.",
                "Answer as many questions as possible in a limited time.",
                "Your final score depends on correct answers before time runs out."
            ],
        }
    };

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
    };

    const confirmSelection = () => {
        setGameData({ ...gameData, mode: selectedMode });
        navigate("/"); // Redirect back to Welcome Page
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* HEADER */}
            <Header />

            {/* MAIN CONTENT */}
            <div className="container flex-grow-1 mt-4">
                <div className="row">
                    {/* Game Mode Selection */}
                    <div className="col-md-5 p-4 border-end">
                        <h2 className="fw-bold">Select Game Mode</h2>
                        <p>Choose a mode to see its details.</p>

                        <div className="list-group">
                            {Object.keys(gameModes).map((mode) => (
                                <button
                                    key={mode}
                                    className={`list-group-item list-group-item-action text-start ${
                                        selectedMode === mode ? "active" : ""
                                    }`}
                                    onClick={() => handleModeSelect(mode)}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Mode Description */}
                    <div className="col-md-6 ms-4 p-4">
                        <h3 className="fw-bold">{selectedMode}</h3>
                        <p>{gameModes[selectedMode].description}</p>

                        <h5 className="fw-semibold mt-3">Rules:</h5>
                        <ul>
                            {gameModes[selectedMode].rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>

                        {/* Confirm Button */}
                        <button className="btn btn-success mt-3" onClick={confirmSelection}>
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}

export default GameModeSelection;
