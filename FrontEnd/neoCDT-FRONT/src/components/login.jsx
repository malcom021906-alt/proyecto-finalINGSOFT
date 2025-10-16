import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";

export default function Login() {

   const navigate = useNavigate();

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

            <p className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>

            <button type="submit" className="btn-login">Sign in</button>

            <p className="signup-text">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
