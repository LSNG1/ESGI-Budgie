import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AccountList() {

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balances, setBalances] = useState({});
    const [balanceError, setBalanceError] = useState(null);
    const [balanceDate] = useState(() => new Date().toISOString().split("T")[0]);

    const navigate = useNavigate();

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/accounts`);
            console.log("API Response:", response.data);
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
            const response = await axios.get(`http://localhost:8000/api/forecast`, {
                params: {
                    targetDate: balanceDate
                }
            });
            const items = response.data?.accounts || [];
            const nextBalances = {};
            items.forEach((item) => {
                nextBalances[item.id] = item.balance;
            });
            setBalances(nextBalances);
        } catch (err) {
            console.error(err);
            setBalanceError("Impossible de charger les soldes.");
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchBalances();
    }, []);



    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="p-6 max-w-full mx-auto">
          <div className="flex flex-row flex-wrap gap-4 overflow-x-auto md:overflow-x-visible">
            {accounts.map((account) => (
              <div key={account.id} className="flex-none bg-white rounded-xl shadow-md w-36 aspect-square overflow-hidden">
                <div className="p-4 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold">{account.name}</h2>
                    <p className="text-sm text-gray-500">Type: {account.type}</p>
                    <p className="text-sm text-gray-500">
                      Solde:{" "}
                      {balances[account.id] !== undefined
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(balances[account.id])
                        : balanceError
                        ? "N/A"
                        : "-"}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => navigate(`/account/${account.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      Voir
                    </button>
                    <button onClick={() => navigate(`/edit-account/${account.id}`)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg">
                      Gérer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}
