import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function AccountForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        description: "",
        taxRate: 0,
        rateOfPay: 0,
        overdraft: 0,
        userId: user.id,
        createdAt: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        const payload = {
            ...formData,
            taxRate: formData.taxRate
                ? (Number(formData.taxRate) / 100)
                : "0",
            rateOfPay: formData.rateOfPay
                ? (Number(formData.rateOfPay) / 100)
                : "0"
        }

        console.log(payload);
        e.preventDefault();
        axios.post("http://localhost:8001/account", payload, {
            headers: {
                'Content-Type': 'application/ld+json'
            }
        })
            .then(response => {
                console.log("Compte créé avec succès :", response.data);
                navigate("/");
            })
            .catch(error => {
                console.error("Erreur lors de la création du compte :", error);
            });
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Créer un nouveau compte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Nom du compte"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                >
                    <option value="">Sélectionner le type de compte</option>
                    <option value="depot">Depot</option>
                    <option value="savings">Épargne</option>
                    <option value="credit">Crédit</option>
                </select>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="taxRate"
                    placeholder="Taux d'imposition (%)"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="rateOfPay"
                    placeholder="Taux de rémunération (%)"
                    value={formData.rateOfPay}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                    type="number"
                    name="overdraft"
                    placeholder="Découvert autorisé"
                    value={formData.overdraft}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                    type="date"
                    name="createdAt"
                    placeholder="Date de création"
                    value={formData.createdAt}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Créer le compte
                </button>
            </form>
        </div>
    )
}