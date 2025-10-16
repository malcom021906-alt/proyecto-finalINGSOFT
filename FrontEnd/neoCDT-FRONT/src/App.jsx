import { Routes, Route } from "react-router-dom";
import HomeScreen from "./components/homescreen";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotPassword";


function App() {
  return (
    <Routes>
      
      <Route path="/" element={<HomeScreen />} />,
      
      <Route path="/login" element={<Login />} />,

       <Route path="/register" element={<Register />} />

       <Route path="/forgot-password" element={<ForgotPassword />} />


    </Routes>
  );
}

export default App;
