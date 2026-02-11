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
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!username || !mobile || !email || !password) {
      alert("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (mobile.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const userData = {
      username,
      mobile,
      email,
      password,
    };

    const result = await signup(userData);

    setLoading(false);

    if (result.success) {
      alert("Signup successful! Please login.");
      navigate("/login");
    } else {
      alert(result.message || "Signup failed. Please try again.");
    }
  };

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
              onChange={(e) => {
                const mobileRegex = /^[0-9]*$/;
                if (!mobileRegex.test(e.target.value)) {
                  alert("Please enter only numeric values");
                  return;
                }
                if (e.target.value.length > 10) {
                  setMobile(e.target.value.slice(0, 10));
                  return;
                }
                setMobile(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="off"
              name="user_email"
              onChange={(e) => setEmail(e.target.value)}
            />
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
