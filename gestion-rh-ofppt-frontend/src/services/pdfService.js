/**
 * pdfService.js
 * Service d'export PDF réutilisable pour toutes les pages OFPPT-RH.
 * Utilise jsPDF + jsPDF-AutoTable.
 *
 * Usage :
 *   import { exportToPDF } from '@/services/pdfService';
 *   exportToPDF({ title: 'Liste du Personnel', columns, rows });
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Palette OFPPT ────────────────────────────────────────────
const COLORS = {
  primary:    [37,  99,  235],   // blue-600
  primaryDark:[30,  64,  175],   // blue-800
  accent:     [16,  185, 129],   // emerald-500
  white:      [255, 255, 255],
  lightGray:  [248, 250, 252],   // slate-50
  midGray:    [100, 116, 139],   // slate-500
  darkGray:   [15,  23,  42],    // slate-900
  rowAlt:     [241, 245, 249],   // slate-100
};

/**
 * Dessine l'en-tête professionnel OFPPT en haut de chaque page.
 * @param {jsPDF} doc
 * @param {string} title
 * @param {string} subtitle
 */
const drawHeader = (doc, title, subtitle = '') => {
  const pageW = doc.internal.pageSize.getWidth();

  // Bande bleue principale
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 28, 'F');

  // Accent vert à gauche
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 5, 28, 'F');

  // Logo / Sigle OFPPT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text('OFPPT', 12, 11);

  // Sous-titre du sigle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Office de la Formation Professionnelle', 12, 16.5);
  doc.text('et de la Promotion du Travail', 12, 20.5);

  // Séparateur vertical
  doc.setDrawColor(...COLORS.white);
  doc.setLineWidth(0.3);
  doc.line(75, 5, 75, 23);

  // Titre du document
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 82, 12);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, 82, 19);
  }

  // Date d'édition (coin droit)
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.text(`Édité le ${dateStr} à ${timeStr}`, pageW - 10, 19, { align: 'right' });
};

/**
 * Dessine le pied de page avec numérotation.
 * @param {jsPDF} doc
 */
const drawFooter = (doc) => {
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const pages  = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    // Ligne de séparation
    doc.setDrawColor(...COLORS.midGray);
    doc.setLineWidth(0.2);
    doc.line(10, pageH - 12, pageW - 10, pageH - 12);

    // Mention légale gauche
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.midGray);
    doc.text('Document confidentiel — OFPPT Gestion RH', 10, pageH - 7);

    // Numéro de page droite
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${pages}`, pageW - 10, pageH - 7, { align: 'right' });
  }
};

/**
 * Exporte une liste de données en PDF.
 *
 * @param {object} options
 * @param {string}   options.title      - Titre principal du document
 * @param {string}   [options.subtitle] - Sous-titre (ex: filtre actif)
 * @param {string[]} options.columns    - En-têtes des colonnes
 * @param {Array[]}  options.rows       - Lignes de données (tableaux)
 * @param {string}   [options.filename] - Nom du fichier généré
 * @param {object}   [options.meta]     - Métadonnées additionnelles (stats, etc.)
 * @param {'portrait'|'landscape'} [options.orientation]
 */
export const exportToPDF = ({
  title,
  subtitle = '',
  columns,
  rows,
  filename,
  meta = {},
  orientation = 'portrait',
}) => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // ── En-tête ───────────────────────────────────────────────
  drawHeader(doc, title, subtitle);

  // ── Bloc méta (statistiques en haut) ─────────────────────
  let startY = 36;

  if (Object.keys(meta).length > 0) {
    const metaEntries = Object.entries(meta);
    const boxW = (pageW - 20) / metaEntries.length;

    metaEntries.forEach(([label, value], i) => {
      const x = 10 + i * boxW;
      doc.setFillColor(...COLORS.lightGray);
      doc.roundedRect(x, startY, boxW - 2, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.primary);
      doc.text(String(value), x + boxW / 2 - 1, startY + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.midGray);
      doc.text(label, x + boxW / 2 - 1, startY + 10, { align: 'center' });
    });
    startY += 18;
  }

  // ── Table principale ──────────────────────────────────────
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      fontSize:  8.5,
      cellPadding: 2.5,
      textColor: COLORS.darkGray,
      font: 'helvetica',
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize:  8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLORS.rowAlt,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
    didDrawPage: () => {
      drawHeader(doc, title, subtitle);
    },
  });

  // ── Pied de page ──────────────────────────────────────────
  drawFooter(doc);

  // ── Enregistrement ────────────────────────────────────────
  const safeName = filename
    || `ofppt_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(safeName);
};

/**
 * Hook React pour l'export PDF.
 * Transforme automatiquement des objets en colonnes/lignes.
 *
 * @param {object[]} data    - Données à exporter
 * @param {object}   config  - { title, subtitle, keys, labels, filename, meta }
 * @returns {{ exportPDF: Function, exporting: boolean }}
 */
export const useExportPDF = (data, config) => {
  const exportPDF = () => {
    const { title, subtitle, keys, labels, filename, meta, orientation } = config;

    const columns = labels || keys;
    const rows = data.map(item => keys.map(k => String(item[k] ?? '—')));

    exportToPDF({ title, subtitle, columns, rows, filename, meta, orientation });
  };

  return { exportPDF };
};
