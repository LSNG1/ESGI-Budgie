import { useEffect, useState } from "react";
import axios from "axios";

export default function GlobalForecast() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchForecast();
  }, [targetDate]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/forecast", {
        params: {
          targetDate: targetDate,
        },
      });
      setForecastData(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des prévisions globales :", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.hydra?.description ||
          "Erreur lors de la récupération des prévisions globales"
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

  const accounts = forecastData?.accounts || [];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Prévisions globales</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Date cible :
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0353a4] focus:ring-1 focus:ring-[#0353a4] outline-none"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des prévisions...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {forecastData && !loading && (
        <>
          <div className="mb-6 p-4 bg-gradient-to-r from-[#0353a4] to-[#0a9396] rounded-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Solde prévu au</p>
                <p className="text-lg font-semibold">
                  {new Date(forecastData.targetDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Solde total</p>
                <p
                  className={`text-3xl font-bold ${
                    forecastData.totalBalance >= 0 ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {formatCurrency(forecastData.totalBalance)}
                </p>
              </div>
            </div>
          </div>

          {accounts.length === 0 ? (
            <p className="text-gray-500">Aucun compte à afficher.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Compte
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Solde
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {account.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {account.type || "-"}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-semibold ${
                          account.balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(account.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
