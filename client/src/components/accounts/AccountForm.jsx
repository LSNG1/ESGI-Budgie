import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export default function AccountForm({
  onSuccess,
  accountId,
  variant = "card",
  showTitle = true,
}) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    taxRate: 0,
    rateOfPay: 0,
    overdraft: 0,
    createdAt: "",
  });

  const formTitle = accountId ? "Modifier le compte" : "Créer un nouveau compte";
  const containerClassName =
    variant === "modal"
      ? "space-y-5"
      : "max-w-md mx-auto p-6 bg-white rounded-lg shadow-md";

  useEffect(() => {
    if (!accountId) return;

    axios
      .get(`/api/accounts/${accountId}`)
      .then((res) => {
        const account = res.data;

        setFormData({
          name: account.name || "",
          type: account.type || "",
          description: account.description || "",
          taxRate: account.taxRate ? account.taxRate * 100 : 0,
          rateOfPay: account.rateOfPay ? account.rateOfPay * 100 : 0,
          overdraft: account.overdraft || 0,
          createdAt: account.createdAt?.slice(0, 10) || "",
        });
      })
      .catch((err) => {
        console.error("Erreur chargement compte:", err);
      });
  }, [accountId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    const payload = {
      ...formData,
      taxRate: formData.taxRate ? (Number(formData.taxRate) / 100).toString() : "0",
      rateOfPay: formData.rateOfPay ? (Number(formData.rateOfPay) / 100).toString() : "0",
    };
    if (!payload.createdAt) {
      delete payload.createdAt;
    }
    e.preventDefault();

    if (accountId) {
      axios
        .patch(`/api/accounts/${accountId}`, payload, {
          headers: {
            "Content-Type": "application/merge-patch+json",
          },
        })
        .then((response) => {
          addToast("Compte mis à jour.", "success");
          navigate("/home");
          return response.data;
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour du compte :", error);
          addToast("Impossible de mettre à jour le compte.", "error");
        });
      return;
    }

    axios
      .post("/api/accounts", payload, {
        headers: {
          "Content-Type": "application/ld+json",
        },
      })
      .then((response) => {
        addToast("Compte créé.", "success");
        if (onSuccess) {
          onSuccess();
        }
        return response.data;
      })
      .catch((error) => {
        console.error("Erreur lors de la création du compte :", error);
        addToast("Impossible de créer le compte.", "error");
      });
  };

  return (
    <div className={containerClassName}>
      {showTitle && <h2 className="text-2xl font-bold mb-4">{formTitle}</h2>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du compte
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nom du compte"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de compte
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Sélectionner le type</option>
              <option value="depot">Dépôt</option>
              <option value="savings">Épargne</option>
              <option value="credit">Crédit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de création
            </label>
            <input
              type="date"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux d'imposition (%)
            </label>
            <input
              type="number"
              name="taxRate"
              placeholder="0"
              value={formData.taxRate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              step="0.01"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux de rémunération (%)
            </label>
            <input
              type="number"
              name="rateOfPay"
              placeholder="0"
              value={formData.rateOfPay}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              step="0.01"
              inputMode="decimal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Découvert autorisé
            </label>
            <input
              type="number"
              name="overdraft"
              placeholder="0"
              value={formData.overdraft}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              step="0.01"
              inputMode="decimal"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {accountId ? "Mettre à jour le compte" : "Créer le compte"}
        </button>
      </form>
    </div>
  );
}
