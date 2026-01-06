import React from "react";
import Dashboard from "../components/dashboard/Dashboard";
import GlobalForecast from "../components/forecast/GlobalForecast";

export default function Board() {
  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      {/* Dashboard avec métriques et graphique */}
      <div className="w-full max-w-6xl">
        <Dashboard />
      </div>
      <div className="w-full max-w-6xl">
        <GlobalForecast />
      </div>

    </div>
  );
}
