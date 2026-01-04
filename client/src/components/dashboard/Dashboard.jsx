import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
          allTransactions.push(...occurrences);
        }
      });

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions :", err);
      setError("Erreur lors du chargement des données");
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
          type: movement.type,
          amount: parseFloat(movement.amount),
          date: movement.startDate,
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
          type: movement.type,
          amount: parseFloat(movement.amount),
          date: currentDate.toISOString().split("T")[0],
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

  // Calculer les totaux annuels
  const currentYear = new Date().getFullYear();
  const yearTransactions = transactions.filter((t) => {
    const transactionYear = new Date(t.date).getFullYear();
    return transactionYear === currentYear;
  });

  const totalRevenue = yearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = yearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalRevenue - totalExpenses;

  // Calculer les totaux mensuels pour le graphique
  const monthlyData = {};
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Initialiser tous les mois à 0
  months.forEach((month, index) => {
    const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;
    monthlyData[monthKey] = {
      month: month,
      revenue: 0,
      expense: 0,
    };
  });

  // Calculer les totaux par mois
  yearTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (monthlyData[monthKey]) {
      if (transaction.type === "income") {
        monthlyData[monthKey].revenue += transaction.amount;
      } else if (transaction.type === "expense") {
        monthlyData[monthKey].expense += transaction.amount;
      }
    }
  });

  // Trouver le maximum pour l'échelle du graphique
  const maxValue = Math.max(
    ...Object.values(monthlyData).map((data) => Math.max(data.revenue, data.expense)),
    1000 // Minimum pour avoir une échelle visible
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">Chargement du dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <p className="text-red-500 text-center py-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord {currentYear}</h2>

      {/* Cartes des métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Carte Profit */}
        <div className="bg-blue-500 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Profit</div>
          <div className="text-3xl font-bold">{formatCurrency(profit)}</div>
        </div>

        {/* Carte Revenue */}
        <div className="bg-green-500 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Revenue</div>
          <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
        </div>

        {/* Carte Dépenses */}
        <div className="bg-red-500 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm font-medium opacity-90 mb-2">Dépense</div>
          <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
        </div>
      </div>

      {/* Graphique en barres */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution mensuelle</h3>
        <div className="relative">
          {/* Axe Y avec échelle */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
            {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
              <div key={value} className="text-right">
                {value}k
              </div>
            ))}
          </div>
          
          {/* Graphique */}
          <div className="ml-12 flex items-end justify-between gap-3 h-64 border-b border-gray-300 pb-8">
            {Object.entries(monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([monthKey, data]) => {
                // Convertir en milliers pour l'affichage
                const revenueHeight = (data.revenue / maxValue) * 100;
                const expenseHeight = (data.expense / maxValue) * 100;

                return (
                  <div key={monthKey} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="flex gap-1.5 items-end h-full w-full justify-center relative">
                      {/* Barre des dépenses (rouge) */}
                      <div
                        className="bg-red-500 w-full rounded-t transition-all hover:opacity-80 relative group"
                        style={{ height: `${expenseHeight}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {formatCurrency(data.expense)}
                        </div>
                      </div>
                      {/* Barre des revenus (vert) */}
                      <div
                        className="bg-green-500 w-full rounded-t transition-all hover:opacity-80 relative group"
                        style={{ height: `${revenueHeight}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {formatCurrency(data.revenue)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{data.month}</div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Légende */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Dépenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Revenus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

