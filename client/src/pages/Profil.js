import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import axios from "axios";

export default function Profil() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const deleteAccount = async () => {
        const isConfirmed = window.confirm(
            "Êtes-vous sûr de vouloir supprimer votre profil ?\nCette action est irréversible."
        );

        if (!isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8000/user/${user.id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            navigate("/auth");
        } catch (error) {
            console.error("Erreur lors de la suppression du profil :", error);
        }
    }

    return (
        <div className="h-full flex items-center justify-center overflow-auto">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-white">Mon Profil</h1>
                <div className="font-bold text-center mb-6 text-white">
                    <RegisterForm userId={user.id} />
                </div>
                <button onClick={deleteAccount} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">Supprimer mon profil</button>
            </div>
        </div>
    )
}