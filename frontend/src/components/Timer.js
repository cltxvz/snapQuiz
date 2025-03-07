import React, { useEffect, useState } from "react";

function Timer({ duration, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft === 0) {
            console.log("⏳ Timer expired. Auto-submitting quiz.");
            onTimeUp(); // Call the function to auto-submit the quiz
            return;
        }

        const timer = setTimeout(() => setTimeLeft(prevTime => prevTime - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onTimeUp]);

    return <p className="fw-bold">Time Remaining: {timeLeft} seconds</p>;
}

export default Timer;
