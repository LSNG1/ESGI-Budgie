import React, { useState } from "react";
import Help from "../components/help/Help";

export default function Board() {
  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      {/* Dashboard avec métriques et graphique */}
      <div className="w-full max-w-6xl">
        <Help />
      </div>

    </div>
  );
}
