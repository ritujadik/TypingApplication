import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

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
              onChange={(e) => {
                const mobileRegex = /^[0-9]*$/;
                if (!mobileRegex.test(e.target.value)) {
                  alert("Please enter only numeric values for mobile number");
                  return;
                }
                if (e.target.value.length > 10) {
                  alert("Mobile number should be 10 digits long");
                  setMobile("");
                  return;
                }
                setMobile(e.target.value);
              }}
            />
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
              onChange={(e) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(e.target.value)) {
                  alert("Please enter a valid email address");
                  return;
                }
                setEmail(e.target.value);
              }}
            />
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
