import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Board from "./pages/Board";
import HelpPage from "./pages/HelpPage";
import NavBar from "./components/navBar/navBar";
import Footer from "./components/footer/Footer";
import AccountPage from "./pages/AccountPage";
import AccountEdit from "./pages/AccountEdit";
import Profil from "./pages/Profil";
import ExpensesPage from "./pages/ExpensesPage";
import RevenuesPage from "./pages/RevenuesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SharedAccounts from "./pages/SharedAccounts";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === "/landing-page";

  return (
    <div className="h-screen bg-white text-black flex flex-col overflow-hidden">
      <NavBar />
      <div className={`flex-1 overflow-hidden ${!isLandingPage ? "pt-16" : ""}`}>
        <Routes>
          {/* Route publique : Landing page */}
          <Route
            path="/landing-page"
            element={user ? <Navigate to="/home" replace /> : <LandingPage />}
          />

          {/* Route publique : Auth */}
          <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />

          {/* Routes protegees */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aide"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenues"
            element={
              <ProtectedRoute>
                <RevenuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <ProtectedRoute>
                <SharedAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/abonnement"
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:id"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-account/:id"
            element={
              <ProtectedRoute>
                <AccountEdit />
              </ProtectedRoute>
            }
          />

          {/* Redirection par defaut */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/home" replace /> : <Navigate to="/landing-page" replace />
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
