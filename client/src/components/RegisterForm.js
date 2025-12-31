import { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    fiscal_num: "",
    verified: false,
  });

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(form.password, salt);
    form.password = hashedPassword;
    console.log(form);
    axios.post('http://localhost:8000/api/users', form,
        {   
            headers: {
                'Content-Type': 'application/ld+json'
            }
        })
        .then(response => {
            console.log("Utilisateur créé avec succès :", response.data);
            navigate("/home");
        })
        .catch(error => {
            console.error("Erreur lors de la création de l'utilisateur :", error);
        });

    console.log("Données envoyées :", form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input name="firstname" label="Prénom" value={form.firstname} onChange={handleChange} />
      <Input name="lastname" label="Nom" value={form.lastname} onChange={handleChange} />
      <Input name="email" type="email" label="Email" value={form.email} onChange={handleChange} />
      <Input name="password" type="password" label="Mot de passe" value={form.password} onChange={handleChange} />
      <Input name="phone" label="Téléphone" value={form.phone} onChange={handleChange} />
      <Input name="fiscal_num" label="Numéro fiscal" value={form.fiscal_num} onChange={handleChange} />

      <button className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition">
        Créer le compte
      </button>
    </form>
  );
}

function Input({ label, name, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
      />
    </div>
  );
}
