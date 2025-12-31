import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-3 pb-3 border-t border-black/10 text-black/30 text-center text-xs">
        {/* Copyright */}
        <p>&copy; {currentYear} Budgie. Tous droits réservés.</p>
    </footer>
  );
}
