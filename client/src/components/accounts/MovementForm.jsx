import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
export default function MovementForm({accountId, onSuccess}) {


  const { user } = useAuth();
  let account = `/api/accounts/${accountId}`;
  const [formData, setFormData] = useState({
    account: account,
    name: "",
    description: "",
    type: "",
    amount: 0,
    frequencyType: "",
    frequencyN: 0,
    startDate: null,
    endDate: null,
    user: `/api/users/${user.id}`, // À remplacer par l'ID de l'utilisateur connecté

});



const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData({
        ...formData,
        [name]: value,
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      frequencyN: formData.frequencyN ? Number(formData.frequencyN) : 0

    };
    console.log(formData);
    console.log(user.id);
    axios.post("http://localhost:8001/api/movements", payload, {
        headers: {
            'Content-Type': 'application/ld+json'
        }
    })
    .then(response => {
        console.log("Mouvement ajouté avec succès :", response.data);
        onSuccess();
        // Réinitialiser le formulaire ou afficher un message de succès si nécessaire
    })
    .catch(error => {
        console.error("Erreur lors de l'ajout du mouvement :", error);
    });
};

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
            required
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
            placeholder="Description"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
          >
            <option value="">Sélectionner le type</option>
            <option value="income">Revenu</option>
            <option value="expense">Dépense</option>
          </select>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
            placeholder="Montant"
          />
          <select
            name="frequencyType"
            value={formData.frequencyType}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
          >
            <option value="">Sélectionner la fréquence</option>
            <option value="every_n_months">Chaque mois</option>
            <option value="once">Une fois</option>
          </select>
          <input
            type="number"
            name="frequencyN"
            value={formData.frequencyN}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
            placeholder="Nombre de fréquences"
          />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
            placeholder="Date de début"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none mt-2"
            placeholder="Date de fin"
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition mt-4"
          >
            Ajouter le mouvement
          </button>
          
        </div>
        </form>
    </div>
  );
}