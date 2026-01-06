import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { parseIriId } from "../utils/movements";

export default function SubscriptionPage() {
  const { user, login } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const currentSubscriptionId = parseIriId(user?.subscription);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/subscriptions");
      const items = response.data["hydra:member"] || response.data.member || [];
      setPlans(items);
    } catch (err) {
      console.error("Erreur lors du chargement des abonnements :", err);
      setError("Impossible de charger les abonnements.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = async (plan) => {
    if (!user) return;
    setError(null);
    setMessage(null);

    try {
      const response = await axios.patch(
        `/api/users/${user.id}`,
        {
          subscription: `/api/subscriptions/${plan.id}`,
        },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
      login(response.data);
      setMessage(`Abonnement "${plan.name}" activé.`);
    } catch (err) {
      console.error("Erreur lors du changement d'abonnement :", err);
      setError("Impossible de mettre à jour l'abonnement.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">Choisir un abonnement</h1>

        {loading && <p className="text-gray-500">Chargement...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-4 shadow-sm ${
                plan.id === currentSubscriptionId ? "border-green-500" : "border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Comptes: {plan.maxAccounts ?? "Illimité"}</li>
                <li>Revenus par compte: {plan.maxIncomes ?? "Illimité"}</li>
                <li>Dépenses par compte: {plan.maxExpenses ?? "Illimité"}</li>
              </ul>
              <button
                onClick={() => handleChoosePlan(plan)}
                className="mt-4 w-full bg-[#0353a4] hover:bg-[#0a9396] text-white py-2 rounded-lg font-semibold"
                disabled={plan.id === currentSubscriptionId}
              >
                {plan.id === currentSubscriptionId ? "Abonnement actuel" : "Choisir"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
