import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NavBar from "./components/navBar/navBar";
import Footer from "./components/footer/Footer";
import AccountPage from "./pages/AccountPage";
import AccountEdit from "./pages/AccountEdit";
import Profil from "./pages/Profil";

function App() {
  return (
    <div className="h-screen bg-white text-black flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex-1 overflow-hidden pt-16">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account/:id" element={<AccountPage />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/edit-account/:id" element={<AccountEdit />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
