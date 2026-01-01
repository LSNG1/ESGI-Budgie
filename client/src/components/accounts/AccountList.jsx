import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
export default function AccountList() {

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(`http://localhost:8001/user-account/${user.id}`);
            console.log("API Response:", response.data);

            setAccounts(response.data.accounts || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les comptes.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);



    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Mes Comptes</h1>

            <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map((item) => (
                    <div
                        key={item.account.id}
                        className="bg-white p-4 rounded-xl shadow"
                    >
                        <h2 className="font-semibold">{item.account.name}</h2>
                        <p className="text-sm text-gray-500">Type: {item.account.type}</p>

                        <div className="mt-4 flex gap-2">
                            <button onClick={() => navigate(`/account/${item.account.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                                Voir
                            </button>

                            <button onClick={() => navigate(`/edit-account/${item.account.id}`)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg">
                                Gérer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}