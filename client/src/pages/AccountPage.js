import { useParams } from "react-router-dom";
import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import MovementForm from "../components/accounts/MovementForm";
import MovementList from "../components/accounts/MovementList";

export default function AccountPage() {
  const { id } = useParams();

  const [account, setAccount] = useState([]);

  const fetchAccount = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/api/accounts/${id}`);
      setAccount(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du compte :", error);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [id]);

  return(
    <div className="h-full flex flex-col items-center justify-start overflow-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold">Compte: {account.name}</h1>
      <MovementForm accountId={id} onMovementAdded={fetchAccount} />
      <MovementList accountId={id} />
    </div>
  );
}