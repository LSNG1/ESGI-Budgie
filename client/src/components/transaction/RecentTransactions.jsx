import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { generateOccurrences, parseIriId } from "../../utils/movements";

export default function RecentTransactions({ limit = 10, className = "" }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchAllTransactions();
    }
  }, [user]);

  const fetchAllTransactions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [accountsResponse, movementsResponse, exceptionsResponse] = await Promise.all([
        axios.get("/api/accounts"),
        axios.get("/api/movements"),
        axios.get("/api/movement_exceptions"),
      ]);

      const accounts = accountsResponse.data["hydra:member"] || accountsResponse.data.member || [];
      const accountIds = accounts.map((account) => account.id.toString());

      if (accountIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const movements =
        movementsResponse.data.member || movementsResponse.data["hydra:member"] || [];
      const exceptionItems =
        exceptionsResponse.data.member || exceptionsResponse.data["hydra:member"] || [];

      if (!Array.isArray(movements)) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const exceptionsByMovement = {};
      exceptionItems.forEach((exception) => {
        const movementId = parseIriId(exception.movement);
        if (!movementId) return;
        if (!exceptionsByMovement[movementId]) {
          exceptionsByMovement[movementId] = [];
        }
        exceptionsByMovement[movementId].push(exception);
      });

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const allTransactions = [];
      movements.forEach((movement) => {
        const movementAccountId = parseIriId(movement.account)?.toString();
        if (movementAccountId && accountIds.includes(movementAccountId)) {
          const occurrences = generateOccurrences(
            movement,
            exceptionsByMovement[movement.id] || [],
            today
          );
          occurrences.forEach((occ) => {
            occ.accountId = movementAccountId;
            occ.accountName =
              accounts.find((account) => account.id.toString() === movementAccountId)?.name ||
              "Compte";
          });
          allTransactions.push(...occurrences);
        }
      });

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions.slice(0, limit));
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions :", err);
      setError("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cardClassName = `bg-white rounded-lg shadow-md border border-gray-200 ${className}`;

  if (loading) {
    return (
      <div className={`${cardClassName} p-6`}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dernières transactions</h2>
        <p className="text-gray-500 text-center py-4">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClassName} p-6`}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dernières transactions</h2>
        <p className="text-red-500 text-center py-4">{error}</p>
      </div>
    );
  }

  return (
    <div className={`${cardClassName} p-4 w-full flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Dernières transactions</h2>
        <button
          onClick={fetchAllTransactions}
          className="text-sm bg-green-600 hover:bg-green-500 rounded-xl p-2 text-white"
        >
          Actualiser
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucune transaction récente</p>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-1/3">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-1/3">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 w-1/6">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                  onClick={() => navigate(`/account/${transaction.accountId}`)}
                >
                  <td className="px-4 py-2 text-sm text-gray-800/60">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {transaction.name}
                      </span>
                      {transaction.isRecurring && (
                        <span className="px-1.5 py-0.5 bg-blue-100/50 text-blue-700/50 text-xs rounded">
                          {transaction.accountName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-2 text-sm text-right font-semibold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
