import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import AccountList from "../components/accounts/AccountList";
import AccountForm from "../components/accounts/AccountForm";

export default function Home() {
  return (
    <div className="h-full flex items-center flex-col justify-center overflow-auto">
      <AccountForm />
      <AccountList />
    </div>
  );
}