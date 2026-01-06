import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm({ userId }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",  
    confirmPassword: "",
    oldPassword: "",
    phone: "",
    fiscalNum: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/api/users/${userId}`)
        .then(response => {
          const user = response.data;
          setForm(prev => ({
            ...prev,
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
            phone: user.phone || "",
            fiscalNum: user.fiscalNum || "",
            password: "",
            confirmPassword: "",
            oldPassword: "",
          }));
        })
        .catch(err => console.error("Erreur chargement utilisateur:", err));
    }
  }, [userId]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function validateForm() {
    const newErrors = {};

    if (!form.firstname.trim()) newErrors.firstname = "Le prénom est obligatoire.";
    if (!form.lastname.trim()) newErrors.lastname = "Le nom est obligatoire.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = "Email invalide.";

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) newErrors.phone = "Le téléphone doit contenir exactement 10 chiffres.";

    if (!form.fiscalNum.trim()) newErrors.fiscalNum = "Le numéro fiscal est obligatoire.";

    if (!userId) {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/;
      if (!passwordRegex.test(form.password)) {
        newErrors.password = "Le mot de passe doit faire 10 caractères minimum, avec au moins 1 chiffre et 1 symbole.";
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    } else {
      if (form.password || form.confirmPassword) {
        if (!form.oldPassword) newErrors.oldPassword = "L'ancien mot de passe est requis pour le changement.";
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/;
        if (!passwordRegex.test(form.password)) {
          newErrors.password = "Le nouveau mot de passe doit faire 10 caractères minimum, avec au moins 1 chiffre et 1 symbole.";
        }
        if (form.password !== form.confirmPassword) {
          newErrors.confirmPassword = "Le nouveau mot de passe et la confirmation ne correspondent pas.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError("");
    setErrors({});

    try {
      const formData = {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        phone: form.phone,
        fiscalNum: form.fiscalNum
      };

      if (form.password) {
        formData.password = form.password;
        if (userId) {
          formData.oldPassword = form.oldPassword;
        }
      }

      if (userId) {
        await axios.patch(
          `http://localhost:8000/api/users/${userId}`,
          formData,
          { headers: { 'Content-Type': 'application/merge-patch+json' } }
        );
      } else {
        const response = await axios.post(
          'http://localhost:8000/api/users',
          formData,
          { headers: { 'Content-Type': 'application/ld+json' } }
        );
        if (response.data) {
          login({
            id: response.data.id,
            firstname: response.data.firstname,
            lastname: response.data.lastname,
            email: response.data.email,
            phone: response.data.phone,
            fiscalNum: response.data.fiscalNum,
            verified: response.data.verified
          });
        }
      }

      navigate("/home");
    } catch (error) {
      const data = error?.response?.data;
      const violations = Array.isArray(data?.violations) ? data.violations : [];
      if (violations.length > 0) {
        const fieldErrors = {};
        violations.forEach((violation) => {
          const key = violation.propertyPath || "form";
          if (!fieldErrors[key]) {
            fieldErrors[key] = violation.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        if (fieldErrors.form) {
          setSubmitError(fieldErrors.form);
        }
      } else {
        const message =
          data?.detail ||
          data?.error ||
          data?.["hydra:description"] ||
          "Erreur lors de l'inscription.";
        setSubmitError(message);
      }
      console.error("Erreur lors de l'envoi :", error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm mb-1">Prénom</label>
        <input
          name="firstname"
          value={form.firstname}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Nom</label>
        <input
          name="lastname"
          value={form.lastname}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {userId && (
        <div>
          <label className="block text-sm mb-1">Ancien mot de passe</label>
          <input
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
          />
          {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">{userId ? "Nouveau mot de passe" : "Mot de passe"}</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Téléphone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Numéro fiscal</label>
        <input
          name="fiscalNum"
          value={form.fiscalNum}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
        />
        {errors.fiscalNum && <p className="text-red-500 text-sm mt-1">{errors.fiscalNum}</p>}
      </div>

      {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
      <button className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition">
        {userId ? "Mettre à jour le profil" : "S'inscrire"}
      </button>
    </form>
  );
}
