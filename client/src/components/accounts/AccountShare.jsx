import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

export default function AccountShare({ accountId }) {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [invites, setInvites] = useState([]);

  const accountIri = accountId ? `/api/accounts/${accountId}` : null;

  const fetchInvites = async () => {
    if (!accountIri) return;
    try {
      const response = await axios.get("http://localhost:8000/api/account_invites", {
        params: {
          account: accountIri,
        },
      });
      const items = response.data["hydra:member"] || response.data.member || [];
      setInvites(items);
    } catch (err) {
      console.error("Erreur lors du chargement des invitations :", err);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [accountIri]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountIri) return;

    try {
      const payload = {
        account: accountIri,
        email,
        expiresAt: expiresAt || null,
      };
      const response = await axios.post("http://localhost:8000/api/account_invites", payload, {
        headers: {
          "Content-Type": "application/ld+json",
        },
      });
      addToast(`Invitation envoyée à ${response.data.email}.`, "success");
      setEmail("");
      setExpiresAt("");
      fetchInvites();
    } catch (err) {
      console.error("Erreur lors de la création de l'invitation :", err);
      addToast("Impossible de créer l'invitation.", "error");
    }
  };

  const handleDelete = async (inviteId) => {
    try {
      await axios.delete(`http://localhost:8000/api/account_invites/${inviteId}`);
      addToast("Invitation révoquée.", "success");
      fetchInvites();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'invitation :", err);
      addToast("Impossible de supprimer l'invitation.", "error");
    }
  };

  const copyInviteLink = async (inviteId) => {
    const url = `${window.location.origin}/shared?invite=${inviteId}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast("Lien d'invitation copié.", "success");
    } catch (err) {
      console.error("Erreur lors de la copie du lien :", err);
      addToast("Impossible de copier le lien.", "error");
    }
  };

  const statusLabels = {
    pending: "En attente",
    accepted: "Acceptée",
    declined: "Refusée",
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h3 className="text-lg font-semibold">Partager ce compte</h3>
      <p className="text-sm text-gray-500 mt-1">
        Invitez une personne par email. Elle retrouvera l'invitation dans l'onglet
        Partages et aura un accès en lecture seule.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-4 mt-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse email du destinataire"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-[#0353a4] hover:bg-[#0a9396] text-white py-2 rounded-lg font-semibold"
        >
          Envoyer l'invitation
        </button>
      </form>

      {invites.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune invitation créée.</p>
      ) : (
        <ul className="space-y-2">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-gray-500">
                  Statut: {statusLabels[invite.status] || invite.status}
                  {invite.expiresAt ? ` | Expire le ${invite.expiresAt}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyInviteLink(invite.id)}
                  className="bg-slate-600 hover:bg-slate-700 text-white py-1 px-3 rounded-lg"
                >
                  Copier le lien
                </button>
                {invite.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(invite.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                  >
                  Révoquer
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
