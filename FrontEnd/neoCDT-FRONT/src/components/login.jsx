import React from "react";
import "../css/login.css";

export default function Login() {
  return (
    <div className="login-container">
      {/* Lado izquierdo con logo */}
      <div className="login-left">
        <div className="logo">
          <div className="logo-circle"></div>
          <h1>NEO CDT</h1>
        </div>
      </div>

      {/* Lado derecho con formulario */}
      <div className="login-right">
        <div className="form-container">
          <h2>Sign in</h2>
          <form>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />

            <label>Password</label>
            <input type="password" placeholder="Enter your password" />

            <a href="#" className="forgot-password">Forgot password?</a>

            <button type="submit" className="btn-login">Sign in</button>

            <p className="signup-text">
              Don't have an account? <a href="#">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
