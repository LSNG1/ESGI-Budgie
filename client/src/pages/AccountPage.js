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
  const [currentBalance, setCurrentBalance] = useState(null);
  const [balanceError, setBalanceError] = useState(null);

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
      const response = await axios.get(`http://localhost:8000/api/movements`, {
        params: {
          account: `/api/accounts/${account.id}`
        }
      });
      console.log("Movements API Response:", response.data);
      const members = response.data["hydra:member"] || response.data.member || [];
      setMovements(members);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentBalance = async (accountId) => {
    const targetDate = new Date().toISOString().split("T")[0];
    try {
      const response = await axios.get(
        `http://localhost:8000/api/accounts/${accountId}/forecast`,
        {
          params: {
            targetDate: targetDate,
          },
        }
      );
      setCurrentBalance(response.data?.balance ?? null);
      setBalanceError(null);
    } catch (error) {
      console.error("Erreur lors de la r\u00e9cup\u00e9ration du solde :", error);
      setBalanceError("Impossible de charger le solde.");
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [id]);

  useEffect(() => {
    if (account?.id) fetchMovements();
  }, [account]);

  useEffect(() => {
    if (account?.id) fetchCurrentBalance(account.id);
  }, [account?.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start overflow-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Compte: {account.name}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Solde actuel:{" "}
          {currentBalance !== null
            ? formatCurrency(currentBalance)
            : balanceError
            ? "N/A"
            : "..."}
        </p>
      </div>
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
