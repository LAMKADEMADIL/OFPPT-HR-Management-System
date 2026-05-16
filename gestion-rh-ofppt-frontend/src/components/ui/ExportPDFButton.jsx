import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { exportToPDF } from '../../services/pdfService';

/**
 * ExportPDFButton — Bouton réutilisable d'export PDF.
 *
 * Props :
 *   title       {string}   - Titre du document PDF
 *   subtitle    {string}   - Sous-titre optionnel
 *   columns     {string[]} - En-têtes des colonnes
 *   rows        {Array[]}  - Lignes de données (chaque ligne = tableau de strings)
 *   data        {object[]} - Alternative : objets + keys pour auto-génération des rows
 *   keys        {string[]} - Clés à extraire de data (si data fourni)
 *   labels      {string[]} - Labels des colonnes (si data fourni)
 *   filename    {string}   - Nom du fichier généré
 *   meta        {object}   - Stats affichées en haut ({ label: value })
 *   orientation {string}   - 'portrait' | 'landscape'
 *   variant     {string}   - 'primary' | 'secondary'
 */
export default function ExportPDFButton({
  title,
  subtitle,
  columns,
  rows,
  data,
  keys,
  labels,
  filename,
  meta,
  orientation,
  variant = 'secondary',
  children,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Auto-build rows from data+keys if rows not provided
      const finalColumns = columns || labels || keys;
      const finalRows    = rows || (data && keys
        ? data.map(item => keys.map(k => String(item[k] ?? '—')))
        : []);

      // Small async delay so React re-renders the spinner
      await new Promise(r => setTimeout(r, 50));

      exportToPDF({ title, subtitle, columns: finalColumns, rows: finalRows, filename, meta, orientation });
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`${baseClass} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <FileDown size={15} />
      }
      {children || 'Exporter PDF'}
    </button>
  );
}
