import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    axios.post('http://localhost:8001/api/login', form,
        {   
            headers: {
                'Content-Type': 'application/ld+json'
            }
        })
        .then(response => {
            console.log("Login réussi :", response.data);
            // Sauvegarder l'utilisateur dans le contexte
            if (response.data.user) {
              login(response.data.user);
            }
            navigate("/home");
        })
        .catch(error => {
            console.error("Erreur lors du login :", error);
        });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <Input label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} />

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
