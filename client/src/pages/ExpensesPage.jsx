import { useEffect, useState } from "react";
import axios from "axios";
import MovementList from "../components/accounts/MovementList";
import MovementForm from "../components/accounts/MovementForm";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchExpenses = async (nextSearch = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = { type: "expense" };
      if (nextSearch.trim()) {
        params.name = nextSearch;
        params.description = nextSearch;
      }
      const response = await axios.get("/api/movements", { params });
      const items = response.data["hydra:member"] || response.data.member || [];
      setExpenses(items);
    } catch (err) {
      console.error("Erreur lors du chargement des dépenses :", err);
      setError("Impossible de charger les dépenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchExpenses(search);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const handleSuccess = () => {
    setIsOpen(false);
    fetchExpenses(search);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <h1 className="text-2xl font-bold">Dépenses</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Nouvelle dépense
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

        {!loading && !error && <MovementList movements={expenses} />}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              aria-label="Fermer"
            >
              x
            </button>
            <MovementForm
              onSuccess={handleSuccess}
              defaultType="expense"
              lockType
            />
          </div>
        </div>
      )}
    </div>
  );
}
