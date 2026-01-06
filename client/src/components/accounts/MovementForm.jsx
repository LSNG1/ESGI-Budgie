import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

export default function MovementForm({
  accountId,
  onSuccess,
  defaultType = "",
  lockType = false,
}) {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [formData, setFormData] = useState({
    account: "",
    name: "",
    description: "",
    type: defaultType || "",
    amount: "",
    frequencyType: "",
    frequencyN: 1,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!accountId) return;
    setFormData((prev) => ({
      ...prev,
      account: `/api/accounts/${accountId}`,
    }));
  }, [accountId]);

  useEffect(() => {
    if (!defaultType) return;
    setFormData((prev) => ({
      ...prev,
      type: defaultType,
    }));
  }, [defaultType]);

  useEffect(() => {
    if (accountId) return;
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/api/accounts");
        const members = response.data["hydra:member"] || response.data.member || [];
        setAccounts(members);
        setAccountsError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des comptes :", err);
        setAccountsError("Impossible de charger les comptes.");
      }
    };
    fetchAccounts();
  }, [accountId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.account) {
      addToast("Veuillez sélectionner un compte.", "error");
      return;
    }

    const payload = {
      ...formData,
      amount: formData.amount ? Number(formData.amount).toString() : "0",
      frequencyN:
        formData.frequencyType === "every_n_months" ? Number(formData.frequencyN || 1) : null,
      endDate: formData.endDate || null,
    };

    try {
      await axios.post("/api/movements", payload, {
        headers: {
          "Content-Type": "application/ld+json",
        },
      });
      if (payload.type === "expense") {
        addToast("Dépense ajoutée.", "success");
      } else if (payload.type === "income") {
        addToast("Revenu ajouté.", "success");
      } else {
        addToast("Mouvement ajouté.", "success");
      }
      if (onSuccess) {
        onSuccess();
      }
      setFormData((prev) => ({
        ...prev,
        name: "",
        description: "",
        amount: "",
        frequencyType: "",
        frequencyN: 1,
        startDate: "",
        endDate: "",
        type: defaultType || prev.type,
      }));
    } catch (error) {
      console.error("Erreur lors de l'ajout du mouvement :", error);
      addToast("Impossible d'ajouter le mouvement.", "error");
    }
  };

  const typeLabel =
    formData.type === "income" ? "Revenu" : formData.type === "expense" ? "Dépense" : "";
  const submitLabel =
    lockType && formData.type === "expense"
      ? "Ajouter la dépense"
    : lockType && formData.type === "income"
      ? "Ajouter le revenu"
      : "Ajouter le mouvement";
  const emptyAccountMessage =
    defaultType === "expense"
      ? "Aucun compte disponible pour ajouter une dépense."
      : defaultType === "income"
      ? "Aucun compte disponible pour ajouter un revenu."
      : "Aucun compte disponible pour ajouter un mouvement.";

  return (
    <div className="p-5 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.10)] bg-white">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          {!accountId && (
            <>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                className="w-full p-2 border-b border-slate-700 outline-none"
                required
              >
                <option value="">Sélectionner un compte</option>
                {accounts.map((account) => (
                  <option key={account.id} value={`/api/accounts/${account.id}`}>
                    {account.name}
                  </option>
                ))}
              </select>
              {accountsError && <p className="text-sm text-red-500 mt-1">{accountsError}</p>}
              {!accountsError && accounts.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">{emptyAccountMessage}</p>
              )}
            </>
          )}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border-b border-slate-700 outline-none"
            placeholder="Nom"
            required
          />
          {lockType ? (
            <input
              type="text"
              value={typeLabel}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2 bg-gray-50"
              disabled
            />
          ) : (
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2"
              required
            >
              <option value="">Sélectionner le type</option>
              <option value="income">Revenu</option>
              <option value="expense">Dépense</option>
            </select>
          )}
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border-b border-slate-700 outline-none mt-2"
            placeholder="Montant"
            required
          />
          <div className="flex flex-row gap-2">
            <select
              name="frequencyType"
              value={formData.frequencyType}
              onChange={handleChange}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2"
              required
            >
              <option value="">Sélectionner la fréquence</option>
              <option value="every_n_months">Tous les N mois</option>
              <option value="once">Ponctuel</option>
            </select>
            <input
              type="number"
              name="frequencyN"
              value={formData.frequencyN}
              onChange={handleChange}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2"
              placeholder="N"
              disabled={formData.frequencyType !== "every_n_months"}
            />
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2"
              required
            />
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border-b border-slate-700 outline-none mt-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0353a4] text-white hover:bg-cyan-600 py-2 rounded-lg font-semibold transition mt-4"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
