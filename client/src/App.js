import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NavBar from "./components/navBar/navBar";
import Footer from "./components/footer/Footer";
import AccountPage from "./pages/AccountPage";

function App() {
  return (
    <div className="h-screen bg-white text-black flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex-1 overflow-hidden pt-16">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account/:id" element={<AccountPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
