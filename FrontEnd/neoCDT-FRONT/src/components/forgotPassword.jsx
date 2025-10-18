import React from "react";
import { Link } from "react-router-dom";
import "../css/forgotPassword.css";

export default function ForgotPassword() {
  return (
    <div className="forgot-container">
      {/* Left panel */}
      <div className="forgot-left">
        <div className="circle"></div>
        <h1>NEO CDT</h1>
      </div>

      {/* Right panel */}
      <div className="forgot-right">
        <div className="forgot-box">
          <h2>Reset Password</h2>
          <p className="subtitle">
            Enter your email and we'll send you a recovery link.
          </p>

          <form>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />

            <button type="submit" className="forgot-btn">
              Send recovery link
            </button>
          </form>

          <p className="redirect">
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
