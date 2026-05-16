/**
 * DetailRow — composant partagé pour les pages de détail.
 * À utiliser à la place de `const Row = ...` défini dans le render.
 * @param {{ label: string, value: React.ReactNode }} props
 */
export default function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-800">{value || '—'}</dd>
    </div>
  );
}
