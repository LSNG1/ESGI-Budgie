import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RecentTransactions({ limit = 10 }) {
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
      // Récupérer tous les comptes de l'utilisateur
      const accountsResponse = await axios.get(`http://localhost:8000/user-account/${user.id}`);
      const userAccounts = accountsResponse.data.accounts || [];
      const accountIds = userAccounts.map((ua) => ua.account.id.toString());

      if (accountIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Récupérer toutes les transactions
      const movementsResponse = await axios.get("http://localhost:8000/api/movements");
      const movements = movementsResponse.data.member || movementsResponse.data["hydra:member"] || [];

      if (!Array.isArray(movements)) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Traiter les transactions pour générer toutes les occurrences
      const allTransactions = [];

      movements.forEach((movement) => {
        // Extraire l'ID du compte depuis la chaîne "/api/accounts/{id}"
        let movementAccountId = null;
        if (movement.account) {
          if (typeof movement.account === "string") {
            const match = movement.account.match(/\/api\/accounts\/(\d+)/);
            movementAccountId = match ? match[1] : null;
          } else if (movement.account.id) {
            movementAccountId = movement.account.id.toString();
          }
        }

        // Filtrer par les comptes de l'utilisateur
        if (movementAccountId && accountIds.includes(movementAccountId)) {
          const occurrences = generateOccurrences(movement);
          // Ajouter l'ID du compte à chaque occurrence
          occurrences.forEach((occ) => {
            occ.accountId = movementAccountId;
            occ.accountName = userAccounts.find(
              (ua) => ua.account.id.toString() === movementAccountId
            )?.account.name || "Compte";
          });
          allTransactions.push(...occurrences);
        }
      });

      // Trier par date (plus récent en premier) et prendre les N dernières
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions.slice(0, limit));
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions :", err);
      setError("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  // Génère toutes les occurrences d'une transaction jusqu'à aujourd'hui
  const generateOccurrences = (movement) => {
    const occurrences = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(movement.startDate);
    const endDate = movement.endDate ? new Date(movement.endDate) : null;

    if (movement.frequencyType === "once") {
      if (startDate <= today && (!endDate || startDate <= endDate)) {
        occurrences.push({
          id: `${movement.id}-0`,
          name: movement.name,
          description: movement.description,
          type: movement.type,
          amount: parseFloat(movement.amount),
          date: movement.startDate,
          isRecurring: false,
        });
      }
    } else if (movement.frequencyType === "every_n_months") {
      const frequencyN = movement.frequencyN || 1;
      let currentDate = new Date(startDate);
      let occurrenceIndex = 0;

      while (currentDate <= today) {
        if (endDate && currentDate > endDate) {
          break;
        }

        occurrences.push({
          id: `${movement.id}-${occurrenceIndex}`,
          name: movement.name,
          description: movement.description,
          type: movement.type,
          amount: parseFloat(movement.amount),
          date: currentDate.toISOString().split("T")[0],
          isRecurring: true,
        });

        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + frequencyN);
        occurrenceIndex++;
      }
    }

    return occurrences;
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dernières transactions</h2>
        <p className="text-gray-500 text-center py-4">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dernières transactions</h2>
        <p className="text-red-500 text-center py-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 w-full max-w-4xl">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                  Compte
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
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
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {transaction.accountName}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {transaction.name}
                      </span>
                      {transaction.isRecurring && (
                        <span className="px-1.5 py-0.5 bg-blue-100/50 text-blue-700/50 text-xs rounded">
                          Récurrent
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-2 text-sm text-right font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
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

