import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    axios.post("/api/login", form,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(async () => {
            const me = await axios.get("/api/me");
            if (me.data) {
              login(me.data);
            }
            navigate("/home");
        })
        .catch(error => {
            const data = error?.response?.data;
            const message =
              data?.detail ||
              data?.error ||
              data?.["hydra:description"] ||
              "Erreur lors de la connexion.";
            setErrorMessage(message);
            console.error("Erreur lors du login :", error);
        });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <Input label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} />

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <button className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition">
        Se connecter
      </button>
    </form>
  );
}

function Input({ label, name, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        {...{ name, type, value, onChange, required: true }}
      />
    </div>
  );
}
