import React, { useState } from "react";

const faqData = [
  {
    question: "Comment créer un compte ?",
    answer: "Cliquez sur le bouton '+ Nouveau compte' en haut de la page et remplissez le formulaire."
  },
  {
    question: "Comment consulter mes transactions ?",
    answer: "Toutes vos transactions apparaissent dans la section 'Dernières transactions' de votre tableau de bord."
  },
  {
    question: "Puis-je modifier mes informations personnelles ?",
    answer: "Oui, rendez-vous dans votre profil et cliquez sur 'Modifier mes informations'."
  },
  {
    question: "Comment contacter le support ?",
    answer: "Vous pouvez envoyer un email à support@budgie.com ou utiliser le formulaire de contact."
  }
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Aide & FAQ</h1>
      <p className="text-center text-gray-600">
        Vous trouverez ici les réponses aux questions les plus fréquentes.
      </p>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">{item.question}</h2>
              <span className="text-gray-500">{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && (
              <p className="mt-2 text-gray-600 text-sm">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Help;
