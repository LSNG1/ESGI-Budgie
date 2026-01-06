import React, { useState } from "react";
import AccountList from "../components/accounts/AccountList";
import AccountForm from "../components/accounts/AccountForm";
import RecentTransactions from "../components/transaction/RecentTransactions";
import Dashboard from "../components/dashboard/Dashboard";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  }

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="mt-10 flex flex-row justify-between items-start w-11/12">
        {/* Mini tableau des dernières transactions */}
        <RecentTransactions limit={5} />
        <div>
          <div className="relative flex items-end justify-between px-6">
            <h1 className="text-2xl font-bold">Mes Comptes</h1>
            <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition">
              + Nouveau compte
            </button>
          </div>
          <AccountList key={refreshKey} />
        </div>
      </div>
      {/* Dashboard avec métriques et graphique */}
      <div className="w-11/12">
        <Dashboard />
      </div>


      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <AccountForm onSuccess={handleSuccess} />

          </div>
        </div>
      )}
    </div>
  );
}
