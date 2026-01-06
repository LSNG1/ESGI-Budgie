import { useParams } from "react-router-dom";
import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import MovementForm from "../components/accounts/MovementForm";
import MovementList from "../components/accounts/MovementList";
import Forecast from "../components/forecast/Forecast";
import Transaction from "../components/transaction/Transaction";

export default function AccountPage() {
  const { id } = useParams();

  const [account, setAccount] = useState([]);
  const [movements, setMovements] = useState([]);

  const fetchAccount = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/accounts/${id}`);
      setAccount(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du compte :", error);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/account/movements/${account.id}`);
      console.log("Movements API Response:", response.data);
      setMovements(response.data.movements || []);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchAccount();
  }, [id]);

  useEffect(() => {
    if (account?.id) fetchMovements();
  }, [account]);

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold">Compte: {account.name}</h1>
      <div className="flex flex-row w-11/12 justify-between gap-4">
        <div className="h-full w-1/3">
          <MovementForm accountId={id} onSuccess={fetchMovements} />
        </div>
        <div className="h-full w-2/3">
          <MovementList movements={movements} accountId={id} />
        </div>
      </div>
      <div className="flex flex-row h-500 gap-4 w-11/12 justify-between">
        <div className="h-full w-1/3">
          <Transaction accountId={id} />
        </div>
        <div className="h-full w-2/3">
          <Forecast accountId={id} />
        </div>
      </div>
    </div>
  );
}