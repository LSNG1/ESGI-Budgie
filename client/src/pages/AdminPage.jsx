import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { parseIriId } from "../utils/movements";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("ROLE_ADMIN");

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, subscriptionsResponse] = await Promise.all([
        axios.get("http://localhost:8000/api/users"),
        axios.get("http://localhost:8000/api/subscriptions"),
      ]);
      const userItems = usersResponse.data["hydra:member"] || usersResponse.data.member || [];
      const subscriptionItems =
        subscriptionsResponse.data["hydra:member"] || subscriptionsResponse.data.member || [];
      setUsers(userItems);
      setSubscriptions(subscriptionItems);
    } catch (err) {
      console.error("Erreur lors du chargement admin :", err);
      setError("Impossible de charger les données admin.");
    } finally {
      setLoading(false);
    }
  };

  const subscriptionNameFor = (subscriptionValue) => {
    const id = parseIriId(subscriptionValue);
    const plan = subscriptions.find((item) => item.id === id);
    return plan?.name || "N/A";
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-gray-600">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-5xl space-y-4">
        <h1 className="text-3xl font-bold">Administration</h1>

        {loading && <p className="text-gray-500">Chargement...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Rôles
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Abonnement
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {[u.firstname, u.lastname].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {(u.roles || []).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {subscriptionNameFor(u.subscription)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
