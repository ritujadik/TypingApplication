import React, { useState } from "react";
// Make sure these import paths are EXACTLY correct
import ForgotPassword from "./Forgot_Password"; // Check the case and spelling
import OTPVerification from "./OTPVerification";
import ResetPassword from "./ResetPassword";
import "./ForgotPasswordFlow.css";

const ForgotPasswordFlow = () => {
  const [step, setStep] = useState(1);
  const [emailOrMobile, setEmailOrMobile] = useState("");

  // Define the function that will be passed as prop
  const handleOTPSent = (value) => {
    console.log("✅ handleOTPSent called with:", value);
    setEmailOrMobile(value);
    setStep(2);
  };

  const handleOTPVerified = () => {
    console.log("✅ handleOTPVerified called");
    setStep(3);
  };

  const handlePasswordReset = () => {
    console.log("✅ handlePasswordReset called");
    alert("Password reset successfully!");
  };

  // Debug: Log the current step
  console.log("Current step:", step, "emailOrMobile:", emailOrMobile);

  return (
    <div className="forgot-password-flow">
      <div className="auth-card">
        {step === 1 && (
          <ForgotPassword 
            onOTPSent={handleOTPSent}  // This MUST match the prop name in Forgot_Password
          />
        )}
        {step === 2 && (
          <OTPVerification
            emailOrMobile={emailOrMobile}
            onVerified={handleOTPVerified}
          />
        )}
        {step === 3 && (
          <ResetPassword
            emailOrMobile={emailOrMobile}
            onPasswordReset={handlePasswordReset}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordFlow;