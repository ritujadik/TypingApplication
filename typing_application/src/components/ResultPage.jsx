// components/ResultPage.jsx
import React from "react";
import "../ResultPage.css";

const ResultPage = ({
  results,
  currentFont,
  currentLanguage,
  onPracticeAgain,
  onSaveResults,
  testType,
  selectedTime,
  selectedPassage,
  selectedMock,
}) => {

  const {
    wpm = 0,
    accuracy = 0,
    totalWords = 0,
    typedWords = 0,
    correctWords = 0,
    totalIncorrect = 0,
    timeTaken = 0,
    date = new Date().toLocaleString(),
  } = results;

  // Safe incorrect words calculation
  const incorrectWords =
    totalIncorrect || Math.max(typedWords - correctWords, 0);

  const getPerformanceLevel = () => {
    if (wpm >= 40 && accuracy >= 98) return "Excellent! 🎉";
    if (wpm >= 30 && accuracy >= 95) return "Good! 👍";
    if (wpm >= 20 && accuracy >= 90) return "Average";
    if (wpm >= 10) return "Needs Improvement";
    return "Beginner Level";
  };

  const getAccuracyColor = () => {
    if (accuracy >= 95) return "#10b981";
    if (accuracy >= 85) return "#f59e0b";
    return "#ef4444";
  };

  const getWPMColor = () => {
    if (wpm >= 30) return "#10b981";
    if (wpm >= 20) return "#f59e0b";
    return "#ef4444";
  };

  const calculateScore = () => {
    const speedScore = (Math.min(wpm, 60) / 60) * 40;
    const accuracyScore = (accuracy / 100) * 60;
    return Math.round(speedScore + accuracyScore);
  };

  return (
    <div className="result-page">

      {/* Header */}
      <div className="result-header">
        <div className="result-title">
          <h1>📊 Typing Test Results</h1>
          <p className="test-details">
            {testType === "exam" ? "Exam Simulation" : "Practice Test"} •
            {selectedTime === "free" ? " Free Practice" : ` ${selectedTime}`} •
            {totalWords} words • Mock {selectedMock}
          </p>
        </div>

        <div className="result-date">
          <span className="date-icon">📅</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Score Cards */}
      <div className="score-cards-container">

        <div className="main-score-card">
          <div className="score-circle">

            <svg className="score-circle-svg" width="200" height="200">

              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />

              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#4f46e5"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${calculateScore() * 5.65} 565`}
                transform="rotate(-90 100 100)"
              />

            </svg>

            <div className="score-circle-content">
              <span className="overall-score">{calculateScore()}</span>
              <span className="overall-label">Overall Score</span>
            </div>

          </div>
        </div>

        <div className="primary-stats">

          {/* WPM */}
          <div className="stat-box" style={{ borderColor: getWPMColor() }}>
            <div className="stat-icon">⚡</div>

            <div className="stat-content">

              <span className="stat-value" style={{ color: getWPMColor() }}>
                {wpm}
              </span>

              <span className="stat-label">Words Per Minute</span>

              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{
                    width: `${Math.min((wpm / 60) * 100, 100)}%`,
                    backgroundColor: getWPMColor(),
                  }}
                />
              </div>

              <span className="stat-target">Target: 30+ WPM</span>

            </div>
          </div>

          {/* Accuracy */}
          <div className="stat-box" style={{ borderColor: getAccuracyColor() }}>
            <div className="stat-icon">🎯</div>

            <div className="stat-content">

              <span
                className="stat-value"
                style={{ color: getAccuracyColor() }}
              >
                {accuracy}%
              </span>

              <span className="stat-label">Accuracy</span>

              <div className="stat-progress">
                <div
                  className="stat-progress-bar"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: getAccuracyColor(),
                  }}
                />
              </div>

              <span className="stat-target">Target: 95%+</span>

            </div>
          </div>

        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h3>Performance Summary</h3>

        <div className="performance-level">
          <span className="level-badge">{getPerformanceLevel()}</span>

          <p className="level-description">
            {wpm >= 30
              ? "Great job! You're ready for most government exams."
              : "Keep practicing regularly to improve your speed and accuracy."}
          </p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="detailed-analytics">

        <h3>Detailed Analytics</h3>

        <div className="analytics-grid">

          {/* Words Typed */}
          <div className="analytic-item">

            <div className="analytic-icon">📝</div>

            <div className="analytic-content">

              <span className="analytic-label">Words Typed</span>

              <span className="analytic-value">
                {typedWords} / {totalWords}
              </span>

              <span className="analytic-percentage">
                {totalWords > 0
                  ? Math.round((typedWords / totalWords) * 100)
                  : 0}
                % completed
              </span>

            </div>
          </div>

          {/* Correct Words */}
          <div className="analytic-item">

            <div className="analytic-icon">✅</div>

            <div className="analytic-content">

              <span className="analytic-label">Correct Words</span>

              <span className="analytic-value">
                {correctWords} / {typedWords}
              </span>

              <span className="analytic-percentage">
                {typedWords > 0
                  ? Math.round((correctWords / typedWords) * 100)
                  : 0}
                % correct
              </span>

            </div>
          </div>

          {/* Incorrect Words */}
          <div className="analytic-item">

            <div className="analytic-icon">❌</div>

            <div className="analytic-content">

              <span className="analytic-label">Incorrect Words</span>

              <span className="analytic-value">{incorrectWords}</span>

              <span className="analytic-percentage">
                Error Rate:
                {typedWords > 0
                  ? ((incorrectWords / typedWords) * 100).toFixed(1)
                  : 0}
                %
              </span>

            </div>
          </div>

        </div>
      </div>

      {/* Word Breakdown */}
      <div className="word-accuracy-breakdown">

        <h3>Word Accuracy Breakdown</h3>

        <div className="breakdown-container">

          <div className="breakdown-item">
            <div className="breakdown-label">Total Words Typed:</div>
            <div className="breakdown-value">{typedWords}</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-label">Correct Words:</div>
            <div className="breakdown-value correct">{correctWords}</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-label">Incorrect Words:</div>
            <div className="breakdown-value incorrect">{incorrectWords}</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-label">Accuracy:</div>
            <div className="breakdown-value">{accuracy}%</div>
          </div>

        </div>

        {/* Accuracy bar */}
        <div className="accuracy-bar-container">

          <div
            className="accuracy-bar-correct"
            style={{ width: `${(correctWords / (typedWords || 1)) * 100}%` }}
          >
            {correctWords} correct
          </div>

          <div
            className="accuracy-bar-incorrect"
            style={{ width: `${(incorrectWords / (typedWords || 1)) * 100}%` }}
          >
            {incorrectWords} incorrect
          </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="result-actions">

        <button className="action-btn primary-action" onClick={onPracticeAgain}>
          🔄 Practice Again
        </button>

        <button className="action-btn secondary-action" onClick={onSaveResults}>
          💾 Save Results
        </button>

        <button
          className="action-btn outline-action"
          onClick={() => window.print()}
        >
          🖨️ Print Results
        </button>

      </div>

    </div>
  );
};

export default ResultPage;