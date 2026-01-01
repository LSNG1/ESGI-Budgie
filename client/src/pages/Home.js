import React, { useState } from "react";
import AccountList from "../components/accounts/AccountList";
import AccountForm from "../components/accounts/AccountForm";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsOpen(false);
    setRefreshKey((prevKey) => prevKey + 1);
  }

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6">

      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        ➕ Nouveau compte
      </button>

      <AccountList key={refreshKey} />

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
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
