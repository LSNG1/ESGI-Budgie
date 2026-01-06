import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AccountList({ className = "" }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({});
  const [balanceError, setBalanceError] = useState(null);
  const [balanceDate] = useState(() => new Date().toISOString().split("T")[0]);

  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/accounts");
      const members = response.data["hydra:member"] || response.data.member || [];
      setAccounts(members);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les comptes.");
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/forecast", {
        params: {
          targetDate: balanceDate,
        },
      });
      const items = response.data?.accounts || [];
      const nextBalances = {};
      items.forEach((item) => {
        nextBalances[item.id] = item.balance;
      });
      setBalances(nextBalances);
      setBalanceError(null);
    } catch (err) {
      console.error(err);
      setBalanceError("Impossible de charger les soldes.");
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBalances();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Chargement des comptes...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className={`w-full ${className}`}>
      {accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
          Aucun compte pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex min-h-[180px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="space-y-1">
                <h2 className="truncate text-base font-semibold text-gray-900" title={account.name}>
                  {account.name}
                </h2>
                <p className="text-xs text-gray-500">Type: {account.type || "N/A"}</p>
                <p className="text-sm text-gray-700">
                  Solde:{" "}
                  <span className="font-semibold text-gray-900">
                    {balances[account.id] !== undefined
                      ? new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(balances[account.id])
                      : balanceError
                      ? "N/A"
                      : "-"}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/account/${account.id}`)}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => navigate(`/edit-account/${account.id}`)}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700"
                  >
                    Gérer
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/account/${account.id}?share=1`)}
                  className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-blue-700 hover:bg-blue-100"
                >
                  Partager
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
