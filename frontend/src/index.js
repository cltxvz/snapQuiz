import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import GameModeSelection from "./pages/GameModeSelection";
import ImagePage from "./pages/ImagePage";
import QuizPage from "./pages/QuizPage";
import ScorePage from "./pages/ScorePage";
import "./index.css";

const AppRoutes = ({ gameData, setGameData }) => {
    const navigate = useNavigate();

    // Redirect to WelcomePage if quiz data is missing
    useEffect(() => {
        if (!gameData.quiz || gameData.quiz.length === 0) {
            navigate("/", { replace: true });
        }
    }, [gameData, navigate]);

    return (
        <Routes>
            <Route path="/" element={<WelcomePage gameData={gameData} setGameData={setGameData} />} />
            <Route path="/game-mode" element={<GameModeSelection gameData={gameData} setGameData={setGameData} />} />
            <Route path="/image" element={<ImagePage gameData={gameData} setGameData={setGameData} />} />
            <Route path="/quiz" element={<QuizPage gameData={gameData} setGameData={setGameData} />} />
            <Route path="/score" element={<ScorePage gameData={gameData} setGameData={setGameData} />} />
        </Routes>
    );
};

function App() {
    // Load gameData and timer from localStorage
    const [gameData, setGameData] = useState(() => {
        const savedGameData = localStorage.getItem("gameData");
        return savedGameData ? JSON.parse(savedGameData) : {
            imageData: null,
            quiz: [],
            mode: "Basic Mode",
            playerAnswers: {},
            score: null,
            timer: 15, // Default 15 seconds timer for ImagePage
        };
    });

    // Save gameData to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("gameData", JSON.stringify(gameData));
    }, [gameData]); 

    return (
        <Router>
            <AppRoutes gameData={gameData} setGameData={setGameData} />
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
