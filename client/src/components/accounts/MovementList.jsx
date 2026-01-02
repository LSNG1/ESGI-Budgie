import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function MovementList({ movements, accountId }) {
    const { user } = useAuth();
    const accountIdPath = `/api/accounts/${accountId}`;
    const userId = `/api/users/${user.id}`;
    const [movementList, setMovementList] = useState([]);
    const [editingMovement, setEditingMovement] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        type: "",
        description: "",
        user: userId,
        account: accountIdPath,
        description: "",
        startDate: null,
        endDate: null,
        frequencyType: "",
        frequencyN: 0
    });




    useEffect(() => {
        setMovementList(movements);
    }, [movements]);


    const deleteMovement = async (movementId) => {
        try {
            await axios.delete(`http://localhost:8000/api/movements/${movementId}`);
            setMovementList(prevList => prevList.filter(m => m.id !== movementId));
        } catch (error) {
            console.error("Erreur lors de la suppression du mouvement :", error);
        }
    };

    // Ouvrir le modal pour modifier
    const openEditModal = (movement) => {
        setEditingMovement(movement);
        setFormData({
            name: movement.name,
            amount: movement.amount,
            type: movement.type,
            description: movement.description,
            frequencyType: movement.frequencyType,
            frequencyN: movement.frequencyN ? parseInt(movement.frequencyN, 10) : 0
        });
    };

    // Fermer le modal
    const closeEditModal = () => {
        setEditingMovement(null);
    };

    // Gérer les changements dans le formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "frequencyN" ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const response = await axios.patch(
                `http://localhost:8000/api/movements/${editingMovement.id}`,
                formData,{
                    headers: {
                        'Content-Type': 'application/merge-patch+json'
                    }
                }
            );

            // Mettre à jour la liste localement
            setMovementList(prevList =>
                prevList.map(m => (m.id === editingMovement.id ? response.data : m))
            );

            closeEditModal();
        } catch (error) {
            console.error("Erreur lors de la modification du mouvement :", error);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Mouvements</h2>
            {movementList.length === 0 ? (
                <p>Aucun mouvement trouvé pour ce compte.</p>
            ) : (
                <ul className="space-y-4">
                    {movementList.map((movement) => (
                        <li key={movement.id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold">{movement.name}</h3>
                            {movement.type === "income" ? (
                                <p className="text-sm text-green-500">Type: Revenu</p>
                            ) : (
                                <p className="text-sm text-red-500">Type: Dépense</p>
                            )}
                            <p className="text-sm text-gray-500">Montant: {movement.amount}</p>
                            <p className="text-sm text-gray-500">Description: {movement.description}</p>

                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => deleteMovement(movement.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                                >
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => openEditModal(movement)}
                                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg"
                                >
                                    Modifier
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editingMovement && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom du mouvement"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            <select
                                name="type"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner le type</option>
                                <option value="income">Revenu</option>
                                <option value="expense">Dépense</option>
                            </select>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Montant"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="frequencyType"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.frequencyType}
                                onChange={handleChange}
                            >
                                <option value="">Sélectionner la fréquence</option>
                                <option value="every_n_months">Chaque mois</option>
                                <option value="once">Une fois</option>
                            </select>
                            <input
                                type="number"
                                name="frequencyN"
                                placeholder="Nombre de fréquences"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.frequencyN}
                                onChange={handleChange}
                            />
                            <select
                                name="type"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner le type</option>
                                <option value="income">Revenu</option>
                                <option value="expense">Dépense</option>
                            </select>
                            <textarea
                                name="description"
                                placeholder="Description"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                            >
                                Enregistrer les modifications
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
