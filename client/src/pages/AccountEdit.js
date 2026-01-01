import { useParams } from "react-router-dom";
import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountForm from "../components/accounts/AccountForm";

export default function AccountEdit() {
  const { id } = useParams();
  return (
    <div className="flex-col items-center justify-center">
      <AccountForm accountId={id} />
    </div>
  );
}