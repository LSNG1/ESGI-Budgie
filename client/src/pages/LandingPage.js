import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Bienvenue sur <span className="text-[#0353a4]">Budgie</span>
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8 max-w-2xl mx-auto">
            Gestionnez vos finances en toute simplicité. Suivez vos comptes, prévoyez vos dépenses et prenez le contrôle de votre budget.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-[#0353a4] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-70 transition shadow-lg"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#e9d8a6]/50 backdrop-blur-sm rounded-xl p-6 text-black shadow-[0_0_15px_rgba(0,0,0,0.25)]">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">Multi-comptes</h3>
            <p className="text-black/80">
              Gérez plusieurs comptes bancaires, épargne et investissements en un seul endroit.
            </p>
          </div>

          <div className="bg-[#0353a4]/40 backdrop-blur-sm rounded-xl p-6 text-black shadow-[0_0_15px_rgba(0,0,0,0.30)]">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Prévisions intelligentes</h3>
            <p className="text-black/80">
              Visualisez l'évolution de vos finances avec des prévisions basées sur vos transactions récurrentes.
            </p>
          </div>

          <div className="bg-[#94d2bd]/50 backdrop-blur-sm rounded-xl p-6 text-black shadow-[0_0_15px_rgba(0,0,0,0.25)]">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Transactions récurrentes</h3>
            <p className="text-black/80">
              Enregistrez vos revenus et dépenses récurrents pour un suivi automatique de votre budget.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.10)] p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Découvrez Budgie en action
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">📈 Tableau de bord</h3>
              <p className="text-gray-600 mb-4">
                Visualisez d'un coup d'oeil tous vos comptes avec leurs soldes actuels. Le solde total de tous vos comptes est calculé automatiquement.
              </p>
              <div className="bg-[#0353a4] rounded-lg p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Solde Total</span>
                  <span className="text-2xl font-bold">12 450,00 €</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">📅 Prévisions</h3>
              <p className="text-gray-600 mb-4">
                Consultez les prévisions de vos comptes sur plusieurs mois. Voyez comment vos finances évolueront en fonction de vos transactions récurrentes.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Janvier 2025</span>
                  <span className="font-semibold text-green-600">+2 300,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Février 2025</span>
                  <span className="font-semibold text-green-600">+2 300,00 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-[#0353a4] backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à prendre le contrôle de vos finances ?
          </h2>
          <p className="text-white/90 mb-6 text-lg">
            Rejoignez Budgie dès maintenant et commencez à gérer votre budget efficacement.
          </p>
          <Link
            to="/auth"
            className="inline-block bg-white text-[#0353a4] px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition shadow-lg"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}

