import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

export default function Register() {

  const navigate = useNavigate()

  return (
    <div className="register-container">
      {/* Sección izquierda */}
      <div className="register-left">
        <div className="circle"></div>
        <h1>NEO CDT</h1>
      </div>

      {/* Sección derecha */}
      <div className="register-right">
        <div className="register-box">
          <h2>Create Account</h2>

          <form>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              required
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              required
            />

            <button type="submit" className="register-btn" onClick={() => navigate("/login")}>
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
