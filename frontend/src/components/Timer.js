import React, { useEffect } from "react";

function Timer({ timeLeft, setTimeLeft, onEnd }) {
  useEffect(() => {
    if (timeLeft === 0) {
      onEnd();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, setTimeLeft, onEnd]);

  return <p>Time Remaining: {timeLeft} seconds</p>;
}

export default Timer;
