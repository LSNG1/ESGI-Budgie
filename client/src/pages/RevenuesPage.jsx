import { useEffect, useState } from "react";
import axios from "axios";
import MovementList from "../components/accounts/MovementList";
import MovementForm from "../components/accounts/MovementForm";

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchRevenues = async (nextSearch = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = { type: "income" };
      if (nextSearch.trim()) {
        params.q = nextSearch;
      }
      const response = await axios.get("/api/movements", { params });
      const items = response.data["hydra:member"] || response.data.member || [];
      setRevenues(items);
    } catch (err) {
      console.error("Erreur lors du chargement des revenus :", err);
      setError("Impossible de charger les revenus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchRevenues(search);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const handleSuccess = () => {
    setIsOpen(false);
    fetchRevenues(search);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <h1 className="text-2xl font-bold">Revenus</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Nouveau revenu
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou description"
          className="w-full p-2 border border-gray-300 rounded"
        />

        {loading && <p className="text-gray-500">Chargement...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && <MovementList movements={revenues} />}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
              aria-label="Fermer"
            >
              x
            </button>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Nouveau revenu</h2>
              <p className="text-sm text-gray-500">
                Ajoutez un revenu ponctuel ou récurrent (salaire, prime, etc.).
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900 mb-4">
              Astuce : laissez la date de fin vide pour un revenu récurrent sans
              limite.
            </div>
            <MovementForm onSuccess={handleSuccess} defaultType="income" lockType variant="modal" />
          </div>
        </div>
      )}
    </div>
  );
}
