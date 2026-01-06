import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import MovementForm from "../components/accounts/MovementForm";
import MovementList from "../components/accounts/MovementList";
import AccountShare from "../components/accounts/AccountShare";
import Forecast from "../components/forecast/Forecast";
import Transaction from "../components/transaction/Transaction";

export default function AccountPage() {
  const { id } = useParams();
  const location = useLocation();
  const shareRef = useRef(null);

  const [account, setAccount] = useState([]);
  const [movements, setMovements] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [balanceError, setBalanceError] = useState(null);

  const fetchAccount = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/accounts/${id}`);
      setAccount(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du compte :", error);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/movements`, {
        params: {
          account: `/api/accounts/${account.id}`,
        },
      });
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
            targetDate,
          },
        }
      );
      setCurrentBalance(response.data?.balance ?? null);
      setBalanceError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération du solde :", error);
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("share") === "1" && shareRef.current) {
      shareRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.search]);

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
          <div className="mt-4" ref={shareRef}>
            <AccountShare accountId={id} />
          </div>
        </div>
        <div className="h-full w-2/3">
          <MovementList movements={movements} />
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
