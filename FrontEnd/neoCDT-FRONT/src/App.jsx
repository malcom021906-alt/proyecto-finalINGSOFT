import { Routes, Route } from "react-router-dom";
import HomeScreen from "./components/homescreen";
import Login from "./components/login";


function App() {
  return (
    <Routes>
      
      <Route path="/" element={<HomeScreen />} />,
      
      <Route path="/login" element={<Login />} />

    </Routes>
  );
}

export default App;
