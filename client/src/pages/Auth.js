import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h1>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        <div className="text-center mt-6 text-sm">
          {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="ml-2 text-cyan-400 hover:underline"
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </div>

      </div>
    </div>
  );
}
