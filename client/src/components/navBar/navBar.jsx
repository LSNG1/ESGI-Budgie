import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (!user) return null;
    if (user.firstname) return user.firstname;
    return user.email || "Utilisateur";
  };

  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("ROLE_ADMIN");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0353a4] text-white shadow-lg rounded-b-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="text-2xl font-bold hover:opacity-80 transition">
            Budgie
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/board" className="hover:opacity-80 transition font-medium">
              Board
            </Link>
            <Link to="/expenses" className="hover:opacity-80 transition font-medium">
              Dépenses
            </Link>
            <Link to="/revenues" className="hover:opacity-80 transition font-medium">
              Revenus
            </Link>
            <Link to="/shared" className="hover:opacity-80 transition font-medium">
              Partages
            </Link>
            <Link to="/abonnement" className="hover:opacity-80 transition font-medium">
              Abonnement
            </Link>
            <Link to="/aide" className="hover:opacity-80 transition font-medium">
              Aide
            </Link>
            {isAdmin && (
              <Link to="/admin" className="hover:opacity-80 transition font-medium">
                Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profil" className="hover:opacity-80 transition font-medium">
                  <span className="font-medium">{getUserDisplayName()}</span>
                </Link>
                <button onClick={handleLogout} className="hover:opacity-80 transition font-medium">
                  Se déconnecter
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hover:opacity-80 transition font-medium">
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
