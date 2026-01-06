import { useParams } from "react-router-dom";
import React from "react";
import axios from "axios";
import AccountForm from "../components/accounts/AccountForm";
import { useNavigate } from "react-router-dom";

export default function AccountEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const deleteAccount = async () => {
        const isConfirmed = window.confirm(
            "Êtes-vous sûr de vouloir supprimer ce compte ?\nCette action est irréversible."
        );

        if (!isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8000/api/accounts/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            navigate("/home");
        } catch (error) {
            console.error("Erreur lors de la suppression du compte :", error);
        }
    };

    return (
        <div className="flex-col items-center justify-center">
            <button onClick={deleteAccount} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg mb-4">Supprimer le compte</button>
            <AccountForm accountId={id} />
        </div>
    );
}
