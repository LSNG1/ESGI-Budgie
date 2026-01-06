import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

export default function MovementList({ movements }) {
  const { addToast } = useToast();
  const [movementList, setMovementList] = useState([]);
  const [editingMovement, setEditingMovement] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "",
    description: "",
    startDate: "",
    endDate: "",
    frequencyType: "",
    frequencyN: 1,
  });

  const [exceptionMovement, setExceptionMovement] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [exceptionForm, setExceptionForm] = useState({
    name: "",
    description: "",
    amount: "",
    frequencyType: "once",
    frequencyN: 1,
    startDate: "",
    endDate: "",
  });
  const [exceptionError, setExceptionError] = useState(null);

  useEffect(() => {
    setMovementList(Array.isArray(movements) ? movements : []);
  }, [movements]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const deleteMovement = async (movementId) => {
    try {
      await axios.delete(`/api/movements/${movementId}`);
      setMovementList((prevList) => prevList.filter((m) => m.id !== movementId));
      addToast("Mouvement supprimé.", "success");
    } catch (error) {
      console.error("Erreur lors de la suppression du mouvement :", error);
      addToast("Impossible de supprimer le mouvement.", "error");
    }
  };

  const openEditModal = (movement) => {
    setEditingMovement(movement);
    setFormData({
      name: movement.name || "",
      amount: movement.amount || "",
      type: movement.type || "",
      description: movement.description || "",
      frequencyType: movement.frequencyType || "",
      frequencyN: movement.frequencyN ? parseInt(movement.frequencyN, 10) : 1,
      startDate: movement.startDate ? movement.startDate.slice(0, 10) : "",
      endDate: movement.endDate ? movement.endDate.slice(0, 10) : "",
    });
  };

  const closeEditModal = () => {
    setEditingMovement(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "frequencyN" ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        frequencyN: formData.frequencyType === "every_n_months" ? formData.frequencyN : null,
        endDate: formData.endDate || null,
      };

      const response = await axios.patch(
        `/api/movements/${editingMovement.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/merge-patch+json",
          },
        }
      );

      setMovementList((prevList) =>
        prevList.map((m) => (m.id === editingMovement.id ? response.data : m))
      );
      addToast("Mouvement modifié.", "success");
      closeEditModal();
    } catch (error) {
      console.error("Erreur lors de la modification du mouvement :", error);
      addToast("Impossible de modifier le mouvement.", "error");
    }
  };

  const fetchExceptions = async (movementId) => {
    try {
      const response = await axios.get("/api/movement_exceptions", {
        params: {
          movement: `/api/movements/${movementId}`,
        },
      });
      const items = response.data["hydra:member"] || response.data.member || [];
      setExceptions(items);
    } catch (error) {
      console.error("Erreur lors du chargement des exceptions :", error);
      setExceptionError("Impossible de charger les exceptions.");
    }
  };

  const openExceptionsModal = (movement) => {
    setExceptionMovement(movement);
    setExceptionError(null);
    setExceptionForm({
      name: "",
      description: "",
      amount: "",
      frequencyType: "once",
      frequencyN: 1,
      startDate: "",
      endDate: "",
    });
    fetchExceptions(movement.id);
  };

  const closeExceptionsModal = () => {
    setExceptionMovement(null);
    setExceptions([]);
  };

  const handleExceptionChange = (e) => {
    const { name, value } = e.target;
    setExceptionForm((prev) => ({
      ...prev,
      [name]: name === "frequencyN" ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleExceptionSubmit = async (e) => {
    e.preventDefault();
    if (!exceptionMovement) return;
    setExceptionError(null);

    try {
      const payload = {
        movement: `/api/movements/${exceptionMovement.id}`,
        name: exceptionForm.name,
        description: exceptionForm.description || null,
        amount: exceptionForm.amount,
        frequencyType: exceptionForm.frequencyType,
        frequencyN:
          exceptionForm.frequencyType === "every_n_months" ? exceptionForm.frequencyN : null,
        startDate: exceptionForm.startDate,
        endDate: exceptionForm.endDate || null,
      };

      await axios.post("/api/movement_exceptions", payload, {
        headers: {
          "Content-Type": "application/ld+json",
        },
      });

      await fetchExceptions(exceptionMovement.id);
      setExceptionForm({
        name: "",
        description: "",
        amount: "",
        frequencyType: "once",
        frequencyN: 1,
        startDate: "",
        endDate: "",
      });
      addToast("Exception ajoutée.", "success");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'exception :", error);
      setExceptionError("Impossible d'ajouter l'exception.");
      addToast("Impossible d'ajouter l'exception.", "error");
    }
  };

  const deleteException = async (exceptionId) => {
    if (!exceptionMovement) return;
    try {
      await axios.delete(`/api/movement_exceptions/${exceptionId}`);
      await fetchExceptions(exceptionMovement.id);
      addToast("Exception supprimée.", "success");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'exception :", error);
      setExceptionError("Impossible de supprimer l'exception.");
      addToast("Impossible de supprimer l'exception.", "error");
    }
  };

  return (
    <div>
      {movementList.length === 0 ? (
        <p>Aucun mouvement trouvé.</p>
      ) : (
        <ul className="space-y-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.10)] max-h-[350px] overflow-y-auto p-6 bg-white">
          {movementList.map((movement) => (
            <li
              key={movement.id}
              className="bg-white hover:bg-gray-100 flex flex-row justify-between p-2 border-b border-gray-200"
            >
              <div className="flex flex-row gap-5 items-center">
                <h3 className="font-semibold">{movement.name}</h3>
                <p
                  className={`text-sm ${
                    movement.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {movement.type === "income" ? "Revenu" : "Dépense"}
                </p>
                <p className="text-sm text-black">Montant: {formatCurrency(movement.amount)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => deleteMovement(movement.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => openEditModal(movement)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg"
                >
                  Modifier
                </button>
                <button
                  onClick={() => openExceptionsModal(movement)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg"
                >
                  Exceptions
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              aria-label="Fermer"
            >
              x
            </button>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nom du mouvement"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.description}
                onChange={handleChange}
              />
              <select
                name="type"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner le type</option>
                <option value="income">Revenu</option>
                <option value="expense">Dépense</option>
              </select>
              <input
                type="number"
                name="amount"
                placeholder="Montant"
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <div className="flex gap-2">
                <select
                  name="frequencyType"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.frequencyType}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner la fréquence</option>
                  <option value="every_n_months">Tous les N mois</option>
                  <option value="once">Ponctuel</option>
                </select>
                <input
                  type="number"
                  name="frequencyN"
                  placeholder="N"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.frequencyN}
                  onChange={handleChange}
                  disabled={formData.frequencyType !== "every_n_months"}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <input
                  type="date"
                  name="endDate"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {exceptionMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">
            <button
              onClick={closeExceptionsModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              aria-label="Fermer"
            >
              x
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Exceptions pour {exceptionMovement.name}
            </h3>

            {exceptionError && (
              <p className="text-red-500 text-sm mb-3">{exceptionError}</p>
            )}

            <form onSubmit={handleExceptionSubmit} className="grid grid-cols-2 gap-3 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                className="col-span-2 w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.name}
                onChange={handleExceptionChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                className="col-span-2 w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.description}
                onChange={handleExceptionChange}
              />
              <input
                type="number"
                name="amount"
                placeholder="Montant"
                className="w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.amount}
                onChange={handleExceptionChange}
                required
              />
              <select
                name="frequencyType"
                className="w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.frequencyType}
                onChange={handleExceptionChange}
              >
                <option value="once">Ponctuel</option>
                <option value="every_n_months">Tous les N mois</option>
              </select>
              <input
                type="number"
                name="frequencyN"
                placeholder="N"
                className="w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.frequencyN}
                onChange={handleExceptionChange}
                disabled={exceptionForm.frequencyType !== "every_n_months"}
              />
              <input
                type="date"
                name="startDate"
                className="w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.startDate}
                onChange={handleExceptionChange}
                required
              />
              <input
                type="date"
                name="endDate"
                className="w-full p-2 border border-gray-300 rounded"
                value={exceptionForm.endDate}
                onChange={handleExceptionChange}
              />
              <button
                type="submit"
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Ajouter l'exception
              </button>
            </form>

            {exceptions.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune exception enregistrée.</p>
            ) : (
              <ul className="space-y-2">
                {exceptions.map((exception) => (
                  <li
                    key={exception.id}
                    className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{exception.name}</p>
                      <p className="text-sm text-gray-500">
                        {exception.description || "-"}
                      </p>
                      <p className="text-sm">
                        Montant: {formatCurrency(exception.amount)} | Début:{" "}
                        {exception.startDate}
                        {exception.endDate ? ` | Fin: ${exception.endDate}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteException(exception.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
