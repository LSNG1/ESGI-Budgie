import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

export default function MovementForm({
  accountId,
  onSuccess,
  defaultType = "",
  lockType = false,
  variant = "card",
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

  const containerClassName =
    variant === "modal" ? "" : "p-5 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.10)] bg-white";
  const formClassName = variant === "modal" ? "space-y-4" : "space-y-5 max-w-md";

  return (
    <div className={containerClassName}>
      <form onSubmit={handleSubmit} className={formClassName}>
        {!accountId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compte *
            </label>
            <select
              name="account"
              value={formData.account}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
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
            {!accountsError && accounts.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Le mouvement sera rattaché à ce compte.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ex : Loyer, Salaire, Abonnement Netflix"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Détails complémentaires"
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            {lockType ? (
              <input
                type="text"
                value={typeLabel}
                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                disabled
              />
            ) : (
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Sélectionner le type</option>
                <option value="income">Revenu</option>
                <option value="expense">Dépense</option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ex : 250"
              min="0"
              step="0.01"
              inputMode="decimal"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence *</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              name="frequencyType"
              value={formData.frequencyType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
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
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="N"
              min="1"
              disabled={formData.frequencyType !== "every_n_months"}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Ex : 1 = mensuel, 12 = annuel.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour une récurrence sans fin.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#0353a4] text-white hover:bg-cyan-600 py-2 rounded-lg font-semibold transition"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
