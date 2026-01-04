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
            const response = await axios.get(`http://localhost:8000/user-account/${user.id}`);
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
        <div className="p-6 max-w-full mx-auto">
          <div className="flex flex-row flex-wrap gap-4 overflow-x-auto md:overflow-x-visible">
            {accounts.map((item) => (
              <div key={item.account.id} className="flex-none bg-white rounded-xl shadow-md w-36 aspect-square overflow-hidden">
                <div className="p-4 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold">{item.account.name}</h2>
                    <p className="text-sm text-gray-500">Type: {item.account.type}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => navigate(`/account/${item.account.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      Voir
                    </button>
                    <button onClick={() => navigate(`/edit-account/${item.account.id}`)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg">
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