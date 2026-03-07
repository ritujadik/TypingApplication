import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard.jsx"; // Rename App to Dashboard
import Signup from "./components/signup.jsx";
import Login from "./components/login.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import ForgotPasswordFlow  from "./components/Forgot_Password.jsx";
import OTPVerification from "./components/OTPVerification.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ForgotPasswordFlow from "./components/ForgotPasswordFlow.jsx";

createRoot(document.getElementById("root")).render(
<>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
          <Route path="/otp-verification" element={<OTPVerification />} /> 
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Login />} /> {/* Catch-all */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </>
  
);
