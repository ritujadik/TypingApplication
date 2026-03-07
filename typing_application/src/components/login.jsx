import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";
import ForgotPassword from "./Forgot_Password";
import OTPVerification from "./OTPVerification";
import ResetPassword from "./ResetPassword";


const Login = () => {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const[mobileError, setMobileError] = useState("");
  const[step, setStep] = useState(1); // login, forgotPassword, otpVerification, resetPassword
  const[emailOrMobile, setEmailOrMobile] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();



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
    setEmail(value);
    if (mobile.trim() !== "") {
      setEmailError("")
      return;
    }
    if (value.trim() === "") {
      setEmailError("");
      return;
    } 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
    setEmailError("Please enter a valid email address");
  } else {
    setEmailError("");
  }
};




  const handleLogin = async () => {
    if (!password || (!email && !mobile)) {
      alert("Email or mobile and password are required");
      return;
    }

    setLoading(true);

    const credentials = { password };
    if (mobile) credentials.mobile = mobile;
    if (email) credentials.email = email;

    const result = await login(credentials);

    setLoading(false);

    if (result.success) {
      alert("Login successful!");
      navigate("/dashboard");
    } else {
      alert(result.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login to Typing Master</h2>
        <p className="auth-subtitle">Practice typing for government exams</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Mobile Number</label>
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
          <div className="or-divider">
            <span>OR</span>
          </div>
          <div className="form-group">
            <label>Email Address</label>
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
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                if (e.target.value.length < 6) {
                  // Minimum length validation
                }
                setPassword(e.target.value);
              }}
            />
          </div>

          <button
            className="auth-button primary-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-links">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
