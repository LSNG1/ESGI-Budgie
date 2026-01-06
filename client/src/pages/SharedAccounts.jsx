import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { parseIriId } from "../utils/movements";
import { useToast } from "../context/ToastContext";

export default function SharedAccounts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSharedAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userAccountsResponse, accountsResponse] = await Promise.all([
        axios.get("http://localhost:8000/api/user_accounts"),
        axios.get("http://localhost:8000/api/accounts"),
      ]);

      const userAccounts =
        userAccountsResponse.data["hydra:member"] || userAccountsResponse.data.member || [];
      const accounts = accountsResponse.data["hydra:member"] || accountsResponse.data.member || [];

      const roleByAccountId = {};
      userAccounts.forEach((ua) => {
        const accountId = parseIriId(ua.account);
        if (accountId) {
          roleByAccountId[accountId] = ua.role;
        }
      });

      const shared = accounts.filter((account) => roleByAccountId[account.id] === "viewer");
      setSharedAccounts(shared);
    } catch (err) {
      console.error("Erreur lors du chargement des comptes partagés :", err);
      setError("Impossible de charger les comptes partagés.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    if (!user?.email) return;
    try {
      const response = await axios.get("http://localhost:8000/api/account_invites", {
        params: {
          status: "pending",
        },
      });
      const items = response.data["hydra:member"] || response.data.member || [];
      const pending = items.filter(
        (invite) => invite.email?.toLowerCase() === user.email.toLowerCase()
      );
      setInvites(pending);
    } catch (err) {
      console.error("Erreur lors du chargement des invitations :", err);
    }
  };

  useEffect(() => {
    fetchSharedAccounts();
    fetchInvites();
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    const inviteId = params.get("invite");
    if (!inviteId) return;

    const acceptFromLink = async () => {
      try {
        await axios.post(`http://localhost:8000/api/account_invites/${inviteId}/accept`);
        addToast("Invitation acceptée.", "success");
        navigate("/shared", { replace: true });
        fetchInvites();
        fetchSharedAccounts();
      } catch (err) {
        console.error("Erreur lors de l'acceptation :", err);
        addToast("Impossible d'accepter l'invitation.", "error");
        navigate("/shared", { replace: true });
      }
    };

    acceptFromLink();
  }, [location.search, addToast, navigate, user]);

  const acceptInvite = async (inviteId) => {
    try {
      await axios.post(`http://localhost:8000/api/account_invites/${inviteId}/accept`);
      addToast("Invitation acceptée.", "success");
      fetchInvites();
      fetchSharedAccounts();
    } catch (err) {
      console.error("Erreur lors de l'acceptation :", err);
      setError("Impossible d'accepter l'invitation.");
    }
  };

  const declineInvite = async (inviteId) => {
    try {
      await axios.post(`http://localhost:8000/api/account_invites/${inviteId}/decline`);
      addToast("Invitation refusée.", "info");
      fetchInvites();
    } catch (err) {
      console.error("Erreur lors du refus :", err);
      setError("Impossible de refuser l'invitation.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Partages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pour inviter quelqu'un, ouvrez un compte et cliquez sur Partager.
          </p>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {loading && <p className="text-gray-500">Chargement...</p>}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Invitations en attente</h2>
          {invites.length === 0 ? (
            <p className="text-gray-500">Aucune invitation en attente.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Compte: {parseIriId(invite.account) ? `#${parseIriId(invite.account)}` : "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptInvite(invite.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => declineInvite(invite.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Comptes partagés avec moi</h2>
          {sharedAccounts.length === 0 ? (
            <p className="text-gray-500">Aucun compte partagé.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.description}</p>
                  <button
                    onClick={() => navigate(`/account/${account.id}`)}
                    className="mt-3 bg-[#0353a4] hover:bg-[#0a9396] text-white py-1 px-3 rounded-lg"
                  >
                    Voir le compte
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
