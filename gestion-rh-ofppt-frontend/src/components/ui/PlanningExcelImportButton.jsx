import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { toast } from './Toast';
import api from '../../services/api';

export default function PlanningExcelImportButton({ onImport }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xlsm'].includes(ext)) {
      toast.error('Veuillez utiliser un fichier .xlsx ou .xlsm');
      return;
    }
    setFile(f);
    setLoading(true);

    try {
      const exceljs = await import('exceljs');
      const workbook = new exceljs.default.Workbook();
      const buffer = await f.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const getVal = (cell) => {
        if (!cell || cell.value === undefined || cell.value === null) return '';
        if (typeof cell.value === 'string') return cell.value.trim();
        if (cell.value.richText) return cell.value.richText.map(t => t.text || '').join('').trim();
        if (cell.value.result !== undefined) return String(cell.value.result).trim();
        if (cell.value.text !== undefined) return String(cell.value.text).trim();
        return String(cell.value).trim();
      };

      let allRows = [];
      let globalHeaders = [];
      
      workbook.worksheets.forEach((worksheet) => {
        let headers = [];
        let headerRowNumber = -1;
        let sheetRows = [];
        let lastSeenMatricule = '';
        let lastSeenNom = '';

        worksheet.eachRow((row, rowNumber) => {
          const rowValues = [];
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            rowValues[colNumber] = getVal(cell);
          });

          // 1. Update "Sticky" Info (Last seen name/matricule)
          rowValues.forEach((val, col) => {
            if (!val) return;
            const lowVal = val.toLowerCase();
            // Look for "Mle: B123" or similar
            if (lowVal.includes('mle') || lowVal.includes('matr')) {
              const cleaned = val.replace(/.*[:\-\s]/, '').trim();
              if (cleaned.length > 2) lastSeenMatricule = cleaned;
            }
            // Look for names (usually long uppercase strings next to "Formateur")
            if (lowVal.includes('formateur')) {
               // The name might be in the next cell
               const nextVal = rowValues[col+1] || '';
               if (nextVal.length > 3) lastSeenNom = nextVal;
            }
          });

          // 2. Find Header Row (Trigger)
          if (headerRowNumber === -1) {
            let containsDay = false;
            rowValues.forEach((val, colNumber) => {
              const lowVal = val.toLowerCase();
              if (['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'اثنين', 'ثلاثاء'].some(k => lowVal.includes(k))) {
                headers[colNumber] = val;
              }
              if (['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'اثنين', 'ثلاثاء'].some(d => lowVal.includes(d))) {
                containsDay = true;
              }
            });
            
            if (containsDay) {
              headerRowNumber = rowNumber;
              globalHeaders = headers;
            }
            return;
          }

          // 3. Process Data
          const rowData = { 
            matricule: lastSeenMatricule, 
            nom_prenom: lastSeenNom 
          };
          let creneaux = {};
          let hasCreneauData = false;
          
          rowValues.forEach((val, colNumber) => {
            if (!headers[colNumber]) return;
            const header = String(headers[colNumber]).toLowerCase().trim();
            if (!val) return;

            // Day detection
            if (['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim', 'اثنين', 'ثلاثاء', 'اربعاء', 'خميس', 'جمعة', 'سبت'].some(day => header.includes(day))) {
              creneaux[headers[colNumber]] = val;
              hasCreneauData = true;
            } else if (header.includes('matr') || header === 'mle') {
              rowData.matricule = val;
              lastSeenMatricule = val;
            } else if (header.includes('nom') || header.includes('prénom')) {
              rowData.nom_prenom = val;
              lastSeenNom = val;
            }
          });

          // Only push if there's actually a session in this row
          if (hasCreneauData && (rowData.matricule || rowData.nom_prenom)) {
            rowData.creneaux = creneaux;
            sheetRows.push(rowData);
          }
        });

        if (sheetRows.length > 0) {
          allRows = [...allRows, ...sheetRows];
        }
      });

      if (allRows.length === 0) {
        toast.warn("Aucune donnée n'a pu être extraite. Vérifiez le format du fichier.");
      }
      
      setResult({ rows: allRows, headers: globalHeaders });
    } catch (err) {
      toast.error(`Erreur de lecture: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result || !result.rows || result.rows.length === 0) return;
    if (onImport) onImport(result.rows, result.headers);
    setIsOpen(false);
    setFile(null);
    setResult(null);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
        <FileSpreadsheet size={16} />
        Importer Emploi/Planning
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Importer Emploi du Temps / Planning" size="md">
        <div 
          onClick={() => !file && inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xlsm" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          
          {file ? (
             <div className="flex flex-col items-center gap-3">
               <FileSpreadsheet size={32} className="text-emerald-500" />
               <p className="font-medium text-slate-700">{file.name}</p>
               <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }} className="text-red-500 text-sm hover:underline">Retirer le fichier</button>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-slate-400" />
              <p className="text-slate-600">Cliquez ou glissez un fichier .xlsm</p>
            </div>
          )}
        </div>

        {loading && <p className="mt-4 text-center text-sm text-slate-500">Traitement en cours...</p>}
        
        {result && !loading && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <p className="text-sm text-emerald-700">{result.length} lignes valides détectées prêtes à l'import.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={!result || loading || result.length === 0}>Confirmer l'import</Button>
        </div>
      </Modal>
    </>
  );
}
