export default function Footer() {
  return (
    <footer className="h-10 flex items-center justify-center px-6 border-t border-surface-200 bg-white">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} OFPPT — Système de Gestion des Ressources Humaines
      </p>
    </footer>
  );
}
