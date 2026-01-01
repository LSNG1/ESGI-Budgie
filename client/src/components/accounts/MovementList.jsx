import { useState, useEffect, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MovementList({ accountId }) {
    const [movements, setMovements] = useState([]);
    const navigate = useNavigate();
    let account = `/api/accounts/${accountId}`;

    const fetchMovements = async () => {
        try {
            const response = await axios.get(`http://localhost:8001/account/movements/${accountId}`);
            console.log("Movements API Response:", response.data);
            setMovements(response.data.movements || []);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchMovements();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Mouvements</h2>
            {movements.length === 0 ? (
                <p>Aucun mouvement trouvé pour ce compte.</p>
            ) : (
                <ul className="space-y-4">
                    {movements.map((movement) => (
                        <li key={movement.id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold">{movement.name}</h3>
                            {movement.type === "income" ? (
                                <p className="text-sm text-green-500">Type: Revenu</p>
                            ) : (
                                <p className="text-sm text-red-500">Type: Dépense</p>
                            )}

                            <p className="text-sm text-gray-500">Montant: {movement.amount}</p>
                            <p className="text-sm text-gray-500">Description: {movement.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 