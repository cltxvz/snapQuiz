import React from "react";

function QuizNavigation({ currentQuestion, onNext, onPrev, totalQuestions }) {
  return (
    <div className="mt-3 d-flex justify-content-between w-100">
      {/* Previous Button - Aligned to Left */}
      {currentQuestion > 0 ? (
        <button className="btn btn-secondary" onClick={onPrev}>
          Previous
        </button>
      ) : <div></div>} {/* Keeps spacing consistent */}

      {/* Next/Submit Button - Aligned to Right */}
      {currentQuestion < totalQuestions - 1 ? (
        <button className="btn btn-primary" onClick={onNext}>
          Next
        </button>
      ) : (
        <button className="btn btn-success" onClick={onNext}>
          Submit Quiz
        </button>
      )}
    </div>
  );
}

export default QuizNavigation;
