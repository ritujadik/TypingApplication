import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();


const validateMobile = (value) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    setMobile(value);

    if (!mobileRegex.test(value)) {
      setMobileError("Please enter a valid 10-digit mobile number!!!");
    }else{
      setMobileError("");
    }
  }

   const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmail(value);
    if (!emailRegex.test(value)) {
    setEmailError("Please enter a valid email address");
  } else {
    setEmailError("");
  }
};

  const handleSignup = async () => {
    if (!username || !mobile || !email || !password) {
      alert("All fields are required");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try{
      const credentials = { username, mobile, email, password };

      const result = await signup(credentials);

      if (result.success) {
        alert("Signup successful! Please login.");
        navigate("/login");
      } else {
        alert(result.message);
      }
    }catch(error) {
      const apiError = error?.response?.data?.message || error?.response?.data?.error ||error.message || "Signup failed. Please try again.";
      
      alert(apiError);  
      console.log("API Error:", apiError);
    }
      setLoading(false);
    }
  const handleReset = () => {
    setUsername("");
    setMobile("");
    setEmail("");
    setPassword("");
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Join thousands practicing for government exams
        </p>

        <div className="auth-form">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onBlur={(e) => validateMobile(e.target.value)}
            />
            {mobileError && <p style={{ color: "red" }}>{mobileError}</p> 
}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateEmail(e.target.value)}
            />
            {emailError && <p style={{ color: "red" }}>{emailError}</p>}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="password-hint">At least 6 characters</small>
          </div>

          <div className="button-group">
            <button
              className="auth-button primary-button"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <button
              className="auth-button secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>

          <div className="auth-links">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
            <p className="terms-text">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="auth-link">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="auth-link">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
