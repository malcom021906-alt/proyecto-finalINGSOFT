import React from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import cardAnimation from "../assets/animations/Online Banking.json" 
import "../css/homescreen.css";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-left">
        <h1>
          Gestiona tu <span>CDT</span> fácilmente
        </h1>
        <p>
          Consulta, crea y administra tus certificados de depósito a término de manera
          segura y rápida desde una sola plataforma.
        </p>
        <button className="home-btn" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </div>

      <div className="home-right">
        <Lottie
          animationData={cardAnimation}
          loop={true}
          autoplay={true}
          style={{ width: 500, height: 500 }}
        />
      </div>
    </div>
  );
}
