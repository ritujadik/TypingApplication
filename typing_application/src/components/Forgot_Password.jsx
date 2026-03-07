import React, { useState, useEffect } from "react"; // Add useEffect
import axios from "axios";
import "./ForgotPasswordFlow.css";

const API_BASE_URL = "http://localhost:5000/api";

const ForgotPassword = ({ onOTPSent }) => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Debug: Check props immediately when component mounts
  useEffect(() => {
    console.log("🔍 ForgotPassword component mounted");
    console.log("🔍 Props received:", { onOTPSent });
    
    if (typeof onOTPSent !== 'function') {
      console.error("❌ onOTPSent is not a function! Check parent component.");
    } else {
      console.log("✅ onOTPSent is a valid function");
    }
  }, [onOTPSent]);

  const validateInput = () => {
    if (!emailOrMobile.trim()) {
      setError("Please enter email or mobile number");
      return false;
    }
    
    if (emailOrMobile.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrMobile)) {
        setError("Please enter a valid email address");
        return false;
      }
    } else {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(emailOrMobile)) {
        setError("Please enter a valid 10-digit mobile number");
        return false;
      }
    }
    
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateInput()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const isEmail = emailOrMobile.includes("@");
      const payload = isEmail 
        ? { email: emailOrMobile }
        : { mobile: emailOrMobile };

      console.log("📤 Sending OTP with payload:", payload);
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, payload);
      
      if (response.status === 200) {
        setSuccess(response.data.message || "OTP sent successfully!");
        
        // IMPORTANT: Check if onOTPSent exists and is a function
        if (onOTPSent && typeof onOTPSent === 'function') {
          console.log("✅ Calling onOTPSent with:", emailOrMobile);
          // Call it after a short delay to show success message
          setTimeout(() => {
            onOTPSent(emailOrMobile);
          }, 1500);
        } else {
          console.error("❌ Cannot call onOTPSent - not a function:", onOTPSent);
          setError("Internal error: Please refresh and try again");
        }
      }
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p className="subtitle">Enter your registered email or mobile number</p>
      
      <div className="input-group">
        <input
          type="text"
          placeholder="Email or Mobile Number"
          value={emailOrMobile}
          onChange={(e) => {
            setEmailOrMobile(e.target.value);
            setError("");
            setSuccess("");
          }}
          className={error ? "error" : success ? "success" : ""}
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button 
        onClick={handleSendOTP} 
        disabled={loading || !emailOrMobile.trim()}
        className="primary-button"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>

      <button 
        onClick={() => window.history.back()} 
        className="secondary-button"
        disabled={loading}
      >
        Back to Login
      </button>

      {/* Debug info - remove in production */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        Prop type: {typeof onOTPSent === 'function' ? '✅ Function' : '❌ Not a function'}
      </div>
    </div>
  );
};

export default ForgotPassword;