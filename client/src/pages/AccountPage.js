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
q