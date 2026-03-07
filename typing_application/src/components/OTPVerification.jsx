import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ForgotPasswordFlow.css";

// const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "https://typingapplication-1.onrender.com/api"

const OTPVerification = ({ emailOrMobile, onVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Debug props
  React.useEffect(() => {
    console.log("OTPVerification received props:", { emailOrMobile, onVerified });
  }, [emailOrMobile, onVerified]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEmail = emailOrMobile.includes("@");
      const payload = {
        [isEmail ? "email" : "mobile"]: emailOrMobile,
        otp: otpString,
        type: "reset_password"
      };

      console.log("Verifying OTP with payload:", payload);
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, payload);
      
      if (response.status === 200) {
        alert("OTP verified successfully!");
        if (typeof onVerified === 'function') {
          onVerified();
        } else {
          console.error("onVerified is not a function:", onVerified);
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Invalid or expired OTP. Please try again."
      );
      
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);

    try {
      const isEmail = emailOrMobile.includes("@");
      const payload = isEmail 
        ? { email: emailOrMobile }
        : { mobile: emailOrMobile };

      await axios.post(`${API_BASE_URL}/forgot-password`, payload);
      setTimer(300);
      setCanResend(false);
      alert("OTP resent successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <h2>Verify OTP</h2>
      <p className="subtitle">
        Enter the 6-digit OTP sent to <strong>{emailOrMobile}</strong>
      </p>

      <div className="otp-input-group">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
            disabled={loading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="timer">
        Time remaining: <span className={timer < 60 ? "timer-warning" : ""}>
          {formatTime(timer)}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        onClick={handleVerifyOTP} 
        disabled={loading || otp.join("").length !== 6}
        className="primary-button"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="resend-section">
        <span>Didn't receive OTP? </span>
        <button 
          onClick={handleResendOTP} 
          disabled={loading || !canResend}
          className="resend-button"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;