import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NavBar from "./components/navBar/navBar.jsx";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <NavBar />
      <div className="pt-16 flex-1">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
