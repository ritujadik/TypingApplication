import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import
import "./ForgotPasswordFlow.css";

// const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "https://typingapplication-1.onrender.com/api"

const ResetPassword = ({ emailOrMobile, onPasswordReset }) => {
  const navigate = useNavigate(); // Initialize navigate
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [resetComplete, setResetComplete] = useState(false); // New state for completion

  const validatePassword = (password) => {
    if (password.length < 6) {
      setPasswordStrength("weak");
      return "Password must be at least 6 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordStrength("medium");
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      setPasswordStrength("medium");
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      setPasswordStrength("medium");
      return "Password must contain at least one number";
    }
    setPasswordStrength("strong");
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");

    if (name === "newPassword") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const isEmail = emailOrMobile.includes("@");
      const payload = {
        [isEmail ? "email" : "mobile"]: emailOrMobile,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      };

      console.log("Resetting password with payload:", payload);
      const response = await axios.post(`${API_BASE_URL}/reset-password`, payload);
      
      if (response.status === 200) {
        setSuccess(response.data.message || "Password reset successfully!");
        setResetComplete(true); // Mark as complete
        
        // Optional: Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/login"); // Redirect to login page
        }, 3000);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      
      const errorMsg = err.response?.data?.error || "";
      if (errorMsg.includes("already used") || errorMsg.includes("previous password")) {
        setError("This password has been used before. Please choose a different password.");
      } else {
        setError(errorMsg || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to login
  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="reset-password-container">
      <h2>{resetComplete ? "Password Reset Complete!" : "Reset Password"}</h2>
      
      {!resetComplete ? (
        // Show reset form
        <>
          <p className="subtitle">Create a new password for your account</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className={passwordStrength ? `password-${passwordStrength}` : ""}
                disabled={loading}
              />
              {formData.newPassword && (
                <div className="password-strength">
                  Password Strength: <span className={passwordStrength}>{passwordStrength}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={
                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                    ? "error" 
                    : ""
                }
                disabled={loading}
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <div className="error-message small">Passwords do not match</div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button 
              type="submit" 
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="primary-button"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          {/* Back button during reset process */}
          <button 
            onClick={goToLogin} 
            className="secondary-button"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            Back to Login
          </button>
        </>
      ) : (
        // Show success message with login button
        <div className="success-container">
          <div className="success-icon">✓</div>
          <p className="success-message-large">
            Your password has been successfully reset!
          </p>
          <p className="subtitle">
            You can now login with your new password.
          </p>
          
          <button 
            onClick={goToLogin} 
            className="primary-button"
            style={{ marginTop: "20px" }}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;