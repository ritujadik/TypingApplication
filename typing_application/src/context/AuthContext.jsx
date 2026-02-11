import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await axios.get(`${API_BASE_URL}/verify-token`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.data.valid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log("=== LOGIN ATTEMPT START ===");
      console.log("Credentials being sent:", credentials);
      console.log("API URL:", `${API_BASE_URL}/login`);
      console.log("Full request payload:", JSON.stringify(credentials));

      const response = await axios.post(`${API_BASE_URL}/login`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("=== LOGIN SUCCESS ===");
      console.log("Full response:", response);
      console.log("Response data:", response.data);

      if (response.data.token) {
        const { token, user } = response.data;

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update state
        setToken(token);
        setUser(user);

        return { success: true, user, message: response.data.message };
      }

      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error) {
      console.log("=== LOGIN ERROR ===");
      console.error("Error object:", error);
      console.error("Has response?", !!error.response);

      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
        console.error("Error headers:", error.response.headers);

        return {
          success: false,
          message: error.response.data || "Invalid credentials",
          status: error.response.status,
        };
      } else if (error.request) {
        console.error("No response received:", error.request);
        return {
          success: false,
          message: "No response from server. Please check your connection.",
        };
      } else {
        console.error("Request setup error:", error.message);
        return {
          success: false,
          message: "Request failed: " + error.message,
        };
      }
    }
  };
  // Signup function
  // AuthContext.jsx - updated signup function
  const signup = async (userData) => {
    try {
      console.log("🔵 Sending signup request to:", `${API_BASE_URL}/signup`);
      console.log("🔵 Request data:", JSON.stringify(userData, null, 2));

      const response = await axios.post(`${API_BASE_URL}/signup`, userData);

      console.log("✅ Signup successful - Response:", response.data);

      if (response.status === 201 || response.data.success) {
        return {
          success: true,
          message: response.data.message || "Signup successful",
        };
      }

      console.log("⚠️ Signup returned but not successful:", response.data);
      return {
        success: false,
        message: response.data.message || "Signup failed",
      };
    } catch (error) {
      console.error("❌ Signup error details:");
      console.error("Error message:", error.message);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error config:", error.config?.data);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Signup failed. Please check your inputs and try again.",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    const userData = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
