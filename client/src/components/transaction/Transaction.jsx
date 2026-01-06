import { useState, useEffect } from "react";
import axios from "axios";
import { generateOccurrences, parseIriId } from "../../utils/movements";

export default function Transaction({ accountId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (accountId) {
      fetchTransactions();
    }
  }, [accountId]);

  const fetchTransactions = async () => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    try {
      const [movementsResponse, exceptionsResponse] = await Promise.all([
        axios.get("/api/movements", {
          params: {
            account: `/api/accounts/${accountId}`,
          },
        }),
        axios.get("/api/movement_exceptions"),
      ]);

      const movements =
        movementsResponse.data.member || movementsResponse.data["hydra:member"] || [];
      const exceptionItems =
        exceptionsResponse.data.member || exceptionsResponse.data["hydra:member"] || [];
      const exceptionsByMovement = {};

      exceptionItems.forEach((exception) => {
        const movementId = parseIriId(exception.movement);
        if (!movementId) return;
        if (!exceptionsByMovement[movementId]) {
          exceptionsByMovement[movementId] = [];
        }
        exceptionsByMovement[movementId].push(exception);
      });

      if (!Array.isArray(movements)) {
        console.error("La réponse n'est pas un tableau:", movements);
        setError("Format de réponse inattendu");
        return;
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const allTransactions = [];
      movements.forEach((movement) => {
        const movementAccountId = parseIriId(movement.account);
        if (movementAccountId && movementAccountId === accountId.toString()) {
          const exceptions = exceptionsByMovement[movement.id] || [];
          const occurrences = generateOccurrences(movement, exceptions, today);
          allTransactions.push(...occurrences);
        }
      });

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions :", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.hydra?.description ||
          "Erreur lors de la récupération des transactions"
      );
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
      month: "long",
      year: "numeric",
    });
  };

  if (!accountId) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <p className="text-gray-500">Aucun compte sélectionné</p>
      </div>
    );
  }

  const transactionsByMonth = {};
  transactions.forEach((transaction) => {
    const monthKey = transaction.date.substring(0, 7);
    if (!transactionsByMonth[monthKey]) {
      transactionsByMonth[monthKey] = [];
    }
    transactionsByMonth[monthKey].push(transaction);
  });

  const monthlyTotals = {};
  Object.keys(transactionsByMonth).forEach((monthKey) => {
    const monthTransactions = transactionsByMonth[monthKey];
    monthlyTotals[monthKey] = {
      incomes: monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  });

  return (
    <div className="bg-white h-full rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2lg font-bold text-gray-800">Historique des transactions</h2>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-[#0353a4] hover:bg-[#0a9396] text-white rounded-lg font-semibold transition"
        >
          Actualiser
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des transactions...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!loading && transactions.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune transaction trouvée</p>
        </div>
      )}

      {transactions.length > 0 && !loading && (
        <div className="max-h-[500px] overflow-y-auto space-y-6">
          {Object.keys(transactionsByMonth)
            .sort()
            .reverse()
            .map((monthKey) => {
              const monthTransactions = transactionsByMonth[monthKey];
              const totals = monthlyTotals[monthKey];
              const [year, month] = monthKey.split("-");
              const monthDate = new Date(year, month - 1);

              return (
                <div key={monthKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {monthDate.toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <span
                          className={`font-semibold ${
                            totals.incomes - totals.expenses >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Solde: {formatCurrency(totals.incomes - totals.expenses)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthTransactions
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((transaction, index) => (
                            <tr
                              key={transaction.id}
                              className={`border-b border-gray-100 hover:bg-gray-50 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-800">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">
                                    {transaction.name}
                                  </span>
                                  {transaction.isRecurring && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                      Récurrent
                                    </span>
                                  )}
                                  {transaction.description && (
                                    <span className="text-gray-500 text-xs">
                                      - {transaction.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td
                                className={`px-4 py-3 text-sm text-right font-semibold ${
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
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
