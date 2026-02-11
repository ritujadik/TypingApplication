// components/ResultPage.jsx
import React from "react";
import "../ResultPage.css"; // Optional: Separate CSS file

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
    totalCharacters = 0,
    correctCharacters = 0,
    timeTaken = 0,
    errors = 0,
    date = new Date().toLocaleString(),
  } = results;

  const getPerformanceLevel = () => {
    if (wpm >= 40 && accuracy >= 98) return "Excellent! 🎉";
    if (wpm >= 30 && accuracy >= 95) return "Good! 👍";
    if (wpm >= 20 && accuracy >= 90) return "Average";
    if (wpm >= 10) return "Needs Improvement";
    return "Beginner Level";
  };

  const getTimeTakenFormatted = () => {
    const totalSeconds = timeTaken;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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

  // Calculate score out of 100
  const calculateScore = () => {
    const speedScore = (Math.min(wpm, 60) / 60) * 40; // 40% weight for speed
    const accuracyScore = (accuracy / 100) * 60; // 60% weight for accuracy
    return Math.round(speedScore + accuracyScore);
  };

  return (
    <div className="result-page">
      {/* Header Section */}
      <div className="result-header">
        <div className="result-title">
          <h1>📊 Typing Test Results</h1>
          <p className="test-details">
            {testType === "exam" ? "Exam Simulation" : "Practice Test"} •
            {selectedTime === "free" ? " Free Practice" : ` ${selectedTime}`} •
            {selectedPassage} words • Mock {selectedMock}
          </p>
        </div>
        <div className="result-date">
          <span className="date-icon">📅</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Main Score Cards */}
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
                strokeDashoffset="0"
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
                ></div>
              </div>
              <span className="stat-target">Target: 30+ WPM</span>
            </div>
          </div>

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
                ></div>
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
          <div className="analytic-item">
            <div className="analytic-icon">📝</div>
            <div className="analytic-content">
              <span className="analytic-label">Words Typed</span>
              <span className="analytic-value">
                {typedWords} <span className="analytic-divider">/</span>{" "}
                {totalWords}
              </span>
              <span className="analytic-percentage">
                {totalWords > 0
                  ? Math.round((typedWords / totalWords) * 100)
                  : 0}
                % completed
              </span>
            </div>
          </div>

          <div className="analytic-item">
            <div className="analytic-icon">⏱️</div>
            <div className="analytic-content">
              <span className="analytic-label">Time Taken</span>
              <span className="analytic-value">{getTimeTakenFormatted()}</span>
              <span className="analytic-percentage">
                Average:{" "}
                {timeTaken > 0 ? Math.round(typedWords / (timeTaken / 60)) : 0}{" "}
                WPM
              </span>
            </div>
          </div>

          <div className="analytic-item">
            <div className="analytic-icon">✅</div>
            <div className="analytic-content">
              <span className="analytic-label">Correct Characters</span>
              <span className="analytic-value">
                {correctCharacters} <span className="analytic-divider">/</span>{" "}
                {totalCharacters}
              </span>
              <span className="analytic-percentage">
                {totalCharacters > 0
                  ? Math.round((correctCharacters / totalCharacters) * 100)
                  : 0}
                % correct
              </span>
            </div>
          </div>

          <div className="analytic-item">
            <div className="analytic-icon">❌</div>
            <div className="analytic-content">
              <span className="analytic-label">Errors</span>
              <span className="analytic-value">{errors}</span>
              <span className="analytic-percentage">
                Error Rate:{" "}
                {typedWords > 0 ? (errors / typedWords).toFixed(2) : 0} per word
              </span>
            </div>
          </div>

          <div className="analytic-item">
            <div className="analytic-icon">🔤</div>
            <div className="analytic-content">
              <span className="analytic-label">Font Used</span>
              <span className="analytic-value">{currentFont}</span>
              <span className="analytic-percentage">
                {currentLanguage === "hindi" ? "Hindi" : "English"} Typing
              </span>
            </div>
          </div>

          <div className="analytic-item">
            <div className="analytic-icon">📊</div>
            <div className="analytic-content">
              <span className="analytic-label">Consistency</span>
              <span className="analytic-value">
                {accuracy >= 95 ? "High" : accuracy >= 85 ? "Medium" : "Low"}
              </span>
              <span className="analytic-percentage">
                Based on accuracy distribution
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Tips */}
      <div className="improvement-tips">
        <h3>💡 Tips for Improvement</h3>
        <div className="tips-container">
          {wpm < 30 && (
            <div className="tip-card">
              <div className="tip-icon">⚡</div>
              <div className="tip-content">
                <h4>Increase Speed</h4>
                <p>
                  Practice daily for 15-20 minutes. Try online typing games to
                  make practice fun.
                </p>
              </div>
            </div>
          )}

          {accuracy < 95 && (
            <div className="tip-card">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <h4>Improve Accuracy</h4>
                <p>
                  Type slowly and focus on hitting the correct keys. Speed will
                  come naturally.
                </p>
              </div>
            </div>
          )}

          {errors > 10 && (
            <div className="tip-card">
              <div className="tip-icon">🔄</div>
              <div className="tip-content">
                <h4>Reduce Errors</h4>
                <p>
                  Use the backspace key less. Try to type correctly on the first
                  attempt.
                </p>
              </div>
            </div>
          )}

          <div className="tip-card">
            <div className="tip-icon">🏆</div>
            <div className="tip-content">
              <h4>Exam Tips</h4>
              <p>
                Government exams require minimum 30 WPM with 95% accuracy. Keep
                practicing!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button className="action-btn primary-action" onClick={onPracticeAgain}>
          <span className="btn-icon">🔄</span>
          <span className="btn-text">Practice Again</span>
        </button>

        <button className="action-btn secondary-action" onClick={onSaveResults}>
          <span className="btn-icon">💾</span>
          <span className="btn-text">Save Results</span>
        </button>

        <button
          className="action-btn outline-action"
          onClick={() => window.print()}
        >
          <span className="btn-icon">🖨️</span>
          <span className="btn-text">Print Results</span>
        </button>

        <button
          className="action-btn outline-action"
          onClick={() => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: "Typing Test Results",
                text: `I scored ${wpm} WPM with ${accuracy}% accuracy on the typing test!`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(
                `Typing Test Results:\nSpeed: ${wpm} WPM\nAccuracy: ${accuracy}%\nDate: ${date}`
              );
              alert("Results copied to clipboard!");
            }
          }}
        >
          <span className="btn-icon">📤</span>
          <span className="btn-text">Share Results</span>
        </button>
      </div>

      {/* Footer Note */}
      <div className="result-footer">
        <p className="footer-note">
          <strong>Note:</strong> Most government typing tests require minimum 30
          WPM with 95% accuracy. Regular practice is key to success!
        </p>
        <div className="footer-links">
          <span>Need help? </span>
          <a href="#tips">View typing tips</a>
          <span> • </span>
          <a href="#practice">More practice tests</a>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
