/* global FormData */
import { useState, useRef, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle, RefreshCw, Search, Users, Clock,
  ChevronDown, ChevronUp, Eye, EyeOff,
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import MainLayout from '../../components/layout/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';

// ── Constants ─────────────────────────────────────────────────
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const ACCEPTED = ['.xlsx', '.xls', '.xlsm', '.csv'];

// ── Helpers ───────────────────────────────────────────────────
const formatColumnLabel = (key) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

const jourFromKey = (key) =>
  JOURS.find((j) => key.toLowerCase().includes(j.toLowerCase()));

// Regroupe les créneaux par jour pour l'affichage calendrier
const groupCreneauxByJour = (creneaux) => {
  const grouped = {};
  JOURS.forEach((j) => { grouped[j] = []; });

  if (!creneaux) return grouped;

  Object.entries(creneaux).forEach(([key, value]) => {
    // On cherche le jour dans la clé (ex: "lundi_m1" -> "Lundi")
    const jourFound = JOURS.find(j => 
      key.toLowerCase().includes(j.toLowerCase())
    );

    if (jourFound && value && String(value).trim() !== '') {
      // Nettoyage de l'étiquette (ex: "lundi_m1" -> "M1")
      const label = key.toLowerCase().replace(jourFound.toLowerCase(), '').replace(/_/g, '').toUpperCase();
      
      grouped[jourFound].push({ 
        creneau: label || formatColumnLabel(key), 
        module: String(value) 
      });
    }
  });
  return grouped;
};
// ── Sub-components ────────────────────────────────────────────
function DropZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      toast.error(`Format non supporté. Utilisez : ${ACCEPTED.join(', ')}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }
    onFile(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !loading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-200 select-none
        ${dragging
          ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
          : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50'
        }
        ${loading ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-emerald-700">Traitement en cours…</p>
          <p className="text-xs text-slate-400">Le serveur lit votre fichier Excel</p>
        </div>
      ) : (
        <>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-emerald-100' : 'bg-white shadow-md'}`}>
            <FileSpreadsheet size={32} className={dragging ? 'text-emerald-500' : 'text-slate-400'} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-700">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ou <span className="text-emerald-600 font-semibold underline underline-offset-2">cliquez pour parcourir</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {ACCEPTED.map((ext) => (
              <span key={ext} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-mono text-slate-500 shadow-sm">
                {ext}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400">Taille maximale : 10 Mo</p>
        </>
      )}
    </div>
  );
}

function FormateurRow({ formateur, expanded, onToggle }) {
  const grouped = groupCreneauxByJour(formateur.creneaux);
  const hasCreneaux = Object.values(grouped).some((arr) => arr.length > 0);

  return (
    <>
      {/* Main row */}
      <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
        <td className="px-4 py-3">
          <span className="font-mono text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
            {formateur.matricule || '—'}
          </span>
        </td>
        <td className="px-4 py-3 font-medium text-slate-800">{formateur.nom_prenom || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-500">{formateur.grade || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-500">{formateur.specialite || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-500">{formateur.departement || '—'}</td>
        <td className="px-4 py-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            {Object.values(grouped).flat().length} créneaux
          </span>
        </td>
        <td className="px-4 py-3">
          {hasCreneaux && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title={expanded ? 'Masquer les créneaux' : 'Voir les créneaux'}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </td>
      </tr>

      {/* Expanded créneaux grid */}
      {expanded && hasCreneaux && (
        <tr className="border-b border-emerald-100 bg-emerald-50/30">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {JOURS.map((jour) => (
                <div key={jour} className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide border-b border-emerald-200 pb-1 mb-1">
                    {jour}
                  </p>
                  {grouped[jour].length === 0 ? (
                    <p className="text-[10px] text-slate-300 italic">Libre</p>
                  ) : (
                    grouped[jour].map((c, i) => (
                      <div key={i} className="bg-white border border-emerald-200 rounded-lg px-2 py-1.5 shadow-sm">
                        <p className="text-[9px] font-semibold text-emerald-600 uppercase">{c.creneau}</p>
                        <p className="text-xs font-medium text-slate-700 leading-tight mt-0.5">{c.module}</p>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────
export default function EmploiImportPage() {
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);   // API response
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch]         = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [showAll, setShowAll]       = useState(false);

  // ── Upload handler ─────────────────────────────────────────
  const handleUpload = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    setResult(null);
    setExpandedRows({});

    const formData = new FormData();
    formData.append('fichier', file);

    const toastId = toast.loading(`Envoi de "${file.name}" au serveur…`);

    try {
      const response = await axiosInstance.post('/import-emploi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progress) => {
          const pct = Math.round((progress.loaded * 100) / progress.total);
          toast.loading(`Upload : ${pct}%…`, { id: toastId });
        },
      });

      const data = response.data;
      setResult(data);

      if (data.success) {
        toast.success(data.message || 'Import réussi !', { id: toastId, duration: 4000 });
      } else {
        toast.error(data.message || 'Erreur lors de l\'import.', { id: toastId });
      }
    } catch (error) {
      toast.dismiss(toastId);
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.fichier?.[0]
        || 'Erreur de connexion au serveur. Vérifiez que Laravel est démarré.';
      toast.error(msg, { duration: 6000 });
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────
  const handleReset = () => {
    setResult(null);
    setSelectedFile(null);
    setSearch('');
    setExpandedRows({});
  };

  // ── Toggle row expansion ───────────────────────────────────
  const toggleRow = (idx) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll  = () => {
    const all = {};
    filtered.forEach((_, i) => { all[i] = true; });
    setExpandedRows(all);
    setShowAll(true);
  };
  const collapseAll = () => { setExpandedRows({}); setShowAll(false); };

  // ── Filter data ────────────────────────────────────────────
  const formateurs = result?.data || [];
  const filtered = formateurs.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (f.nom_prenom    || '').toLowerCase().includes(q) ||
      (f.matricule     || '').toLowerCase().includes(q) ||
      (f.specialite    || '').toLowerCase().includes(q) ||
      (f.departement   || '').toLowerCase().includes(q)
    );
  });

  const hasData = result?.success && formateurs.length > 0;

  return (
    <MainLayout>
      {/* react-hot-toast portal */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <PageHeader
        title="Import Emploi du Temps"
        subtitle="Importez un fichier Excel (.xlsx / .xlsm) généré par votre système OFPPT"
        actions={
          hasData ? (
            <Button variant="secondary" onClick={handleReset}>
              <RefreshCw size={15} /> Nouvel import
            </Button>
          ) : undefined
        }
      />

      {/* ── Upload zone (shown when no data) ────────────────── */}
      {!hasData && (
        <div className="max-w-2xl mx-auto">
          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertTriangle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Pré-requis</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Le serveur Laravel doit être démarré sur{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">http://localhost:8000</code>.
                Le fichier doit contenir les colonnes <strong>Matricule</strong> et{' '}
                <strong>Nom et Prénom</strong>.
              </p>
            </div>
          </div>

          <DropZone onFile={handleUpload} loading={loading} />

          {/* Selected file info */}
          {selectedFile && !loading && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <FileSpreadsheet size={18} className="text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error from API */}
          {result && !result.success && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-red-500" />
                <p className="text-sm font-bold text-red-700">Import échoué</p>
              </div>
              <p className="text-sm text-red-600">{result.message}</p>
              {result.errors && (
                <ul className="mt-2 list-disc list-inside text-xs text-red-500">
                  {Object.values(result.errors).flat().map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              <button onClick={handleReset}
                className="mt-3 text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
                <RefreshCw size={12} /> Réessayer avec un autre fichier
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {hasData && (
        <div className="animate-fadeIn">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">{result.message}</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Fichier : <strong>{selectedFile?.name}</strong>
                {result.creneaux_columns?.length > 0 && (
                  <> · {result.creneaux_columns.length} colonnes de créneaux détectées</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-emerald-100 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Users size={13} /> {formateurs.length} formateur{formateurs.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Filters + actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[220px] max-w-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="search"
                placeholder="Filtrer par nom, matricule…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
            </div>

            <button
              onClick={showAll ? collapseAll : expandAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors"
            >
              {showAll ? <EyeOff size={13} /> : <Eye size={13} />}
              {showAll ? 'Réduire tout' : 'Développer tout'}
            </button>

            <span className="ml-auto text-xs text-slate-400">
              {filtered.length} / {formateurs.length} formateur{formateurs.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Matricule', 'Nom & Prénom', 'Grade', 'Spécialité', 'Département', 'Créneaux', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                        Aucun résultat pour «{search}»
                      </td>
                    </tr>
                  ) : (
                    filtered.map((formateur, idx) => (
                      <FormateurRow
                        key={idx}
                        formateur={formateur}
                        expanded={!!expandedRows[idx]}
                        onToggle={() => toggleRow(idx)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {filtered.length} formateur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
              </p>
              <button onClick={handleReset}
                className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                <Upload size={12} /> Importer un autre fichier
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
