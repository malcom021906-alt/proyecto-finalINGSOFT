import { Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./components/homescreen";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotPassword";
import SolicitudesPage from "./pages/SolicitudesPage";

import "./css/global.css";
import "./css/table.css";
import "./css/form.css";
import "./css/modal.css";
import "./css/filterbar.css";


function App() {
  return (
    <Routes>
      
      <Route path="/" element={<HomeScreen />} />,
      
      <Route path="/login" element={<Login />} />,

       <Route path="/register" element={<Register />} />

       <Route path="/forgot-password" element={<ForgotPassword />} />

       <Route path="/solicitudes" element={<SolicitudesPage />} />


    </Routes>
  );
}

export default App;
