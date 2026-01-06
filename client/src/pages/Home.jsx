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
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="mt-10 w-full max-w-6xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
          <div className="w-full xl:flex-1">
            <RecentTransactions limit={5} className="h-full min-h-[420px]" />
          </div>
          <div className="w-full xl:flex-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col h-full min-h-[420px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">Mes comptes</h2>
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  + Nouveau compte
                </button>
              </div>
              <div className="mt-4 flex-1 overflow-auto">
                <AccountList key={refreshKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl">
        <Dashboard />
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              aria-label="Fermer"
            >
              x
            </button>
            <AccountForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
