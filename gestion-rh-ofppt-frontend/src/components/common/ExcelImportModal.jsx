import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { importExcel, downloadTemplate } from '../../services/ExcelService';

export default function ExcelImportModal({ isOpen, onClose, schemaType, onImport, entityLabel }) {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // { rows, errors, warnings }
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const acceptedExtensions = ['xlsx', 'xlsm', 'csv'];
  const acceptedTypes = acceptedExtensions.map((ext) => `.${ext}`).join(',');

  const reset = () => { setFile(null); setResult(null); };

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!acceptedExtensions.includes(ext)) {
      setResult({ rows: [], errors: ['Format non supporté. Utilisez .xlsx, .xlsm ou .csv'], warnings: [] });
      return;
    }
    setFile(f);
    setLoading(true);
    const res = await importExcel(f, schemaType);
    setResult(res);
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConfirm = () => {
    if (!result?.rows?.length) return;
    onImport(result.rows);
    reset();
    onClose();
  };

  const hasErrors   = result?.errors?.length > 0;
  const hasWarnings = result?.warnings?.length > 0;
  const hasRows     = result?.rows?.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={`Importer ${entityLabel}`} size="md">
      {/* Template download */}
      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">Téléchargez le modèle Excel pour assurer la compatibilité des colonnes.</p>
        <button onClick={() => downloadTemplate(schemaType)}
          className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline flex-shrink-0 ml-3">
          <Download size={13} /> Modèle
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${dragging ? 'border-primary-400 bg-primary-50' : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'}`}
      >
        <input ref={inputRef} type="file" accept={acceptedTypes} className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet size={24} className="text-emerald-500" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); reset(); }}
              className="ml-2 p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Glissez-déposez votre fichier ici</p>
            <p className="text-xs text-slate-400 mt-1">ou <span className="text-primary-600 font-medium">cliquez pour parcourir</span></p>
            <p className="text-xs text-slate-300 mt-2">.xlsx · .xlsm · .csv</p>
          </>
        )}
      </div>

      {/* Validation results */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          Validation en cours…
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 flex flex-col gap-2">
          {hasErrors && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={15} className="text-red-500" />
                <p className="text-xs font-bold text-red-700">Importation bloquée — erreurs détectées</p>
              </div>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-600 ml-5">• {e}</p>)}
            </div>
          )}

          {hasWarnings && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={15} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-700">Avertissements</p>
              </div>
              {result.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700 ml-5">• {w}</p>)}
            </div>
          )}

          {hasRows && !hasErrors && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <p className="text-xs font-bold text-emerald-700">
                  {result.rows.length} enregistrement{result.rows.length > 1 ? 's' : ''} valide{result.rows.length > 1 ? 's' : ''} prêt{result.rows.length > 1 ? 's' : ''} à importer
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-surface-200">
        <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Annuler</Button>
        <Button onClick={handleConfirm} disabled={!hasRows || hasErrors || loading}>
          Importer {hasRows ? `(${result.rows.length})` : ''}
        </Button>
      </div>
    </Modal>
  );
}
