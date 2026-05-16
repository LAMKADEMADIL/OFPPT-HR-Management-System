/**
 * ExcelService.js
 * Handles Excel file import/export with header validation.
 * Loads exceljs lazily so the spreadsheet runtime is only downloaded when
 * a user actually imports or exports a file.
 */

// ── Column schemas per entity type ────────────────────────────
export const SCHEMAS = {
  administratif: {
    required: ['matricule', 'prenom', 'nom', 'cin', 'poste', 'service'],
    optional: ['email', 'telephone', 'grade', 'dateNaissance', 'dateEmbauche', 'adresse'],
    labels: {
      matricule: 'Matricule', prenom: 'Prénom', nom: 'Nom', cin: 'CIN',
      poste: 'Poste', service: 'Service', email: 'Email', telephone: 'Téléphone',
      grade: 'Grade', dateNaissance: 'Date de naissance', dateEmbauche: "Date d'embauche", adresse: 'Adresse',
    },
    validators: {
      email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Format email invalide',
      telephone: (v) => !v || /^[0-9+ ]{10,20}$/.test(v) ? null : 'Numéro de téléphone invalide',
      dateNaissance: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Format date invalide (AAAA-MM-JJ)',
      dateEmbauche: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Format date invalide (AAAA-MM-JJ)',
    },
  },
  formateur_permanent: {
    required: ['matricule', 'prenom', 'nom', 'cin', 'specialite', 'grade'],
    optional: ['email', 'telephone', 'departement', 'dateEmbauche', 'heuresParSemaine'],
    labels: {
      matricule: 'Matricule', prenom: 'Prénom', nom: 'Nom', cin: 'CIN',
      specialite: 'Spécialité', grade: 'Grade', email: 'Email', telephone: 'Téléphone',
      departement: 'Département', dateEmbauche: "Date d'embauche", heuresParSemaine: 'Heures/Semaine',
    },
    validators: {
      email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Format email invalide',
      heuresParSemaine: (v) => !v || (!isNaN(v) && Number(v) >= 0) ? null : "Nombre d'heures doit être positif",
      dateEmbauche: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Format date invalide (AAAA-MM-JJ)',
    },
  },
  formateur_vacataire: {
    required: ['matricule', 'prenom', 'nom', 'cin', 'specialite'],
    optional: ['email', 'telephone', 'departement', 'dateEmbauche', 'heuresParSemaine', 'tarifHeure'],
    labels: {
      matricule: 'Matricule', prenom: 'Prénom', nom: 'Nom', cin: 'CIN',
      specialite: 'Spécialité', email: 'Email', telephone: 'Téléphone',
      departement: 'Département', dateEmbauche: "Date d'embauche",
      heuresParSemaine: 'Heures/Semaine', tarifHeure: 'Tarif/Heure (DH)',
    },
    validators: {
      email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Format email invalide',
      heuresParSemaine: (v) => !v || (!isNaN(v) && Number(v) >= 0) ? null : "Nombre d'heures doit être positif",
      tarifHeure: (v) => !v || (!isNaN(v) && Number(v) >= 0) ? null : 'Le tarif horaire doit être positif',
      dateEmbauche: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Format date invalide (AAAA-MM-JJ)',
    },
  },
  conge: {
    required: ['employe', 'typeConge', 'dateDebut', 'dateFin'],
    optional: ['motif', 'statut'],
    labels: { employe: 'Employé', typeConge: 'Type de congé', dateDebut: 'Date début', dateFin: 'Date fin', motif: 'Motif', statut: 'Statut' },
    validators: {
      dateDebut: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Date début invalide (AAAA-MM-JJ)',
      dateFin: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Date fin invalide (AAAA-MM-JJ)',
    },
  },
  absence: {
    required: ['employe', 'dateDebut', 'dateFin', 'type'],
    optional: ['motif'],
    labels: { employe: 'Employé', dateDebut: 'Date début', dateFin: 'Date fin', type: 'Type', motif: 'Motif' },
    validators: {
      dateDebut: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Date début invalide (AAAA-MM-JJ)',
      dateFin: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Date fin invalide (AAAA-MM-JJ)',
    },
  },
  seance: {
    required: ['date', 'heureDebut', 'heureFin', 'module', 'formateur', 'salle', 'groupe'],
    optional: ['type'],
    labels: { date: 'Date (YYYY-MM-DD)', heureDebut: 'Heure début', heureFin: 'Heure fin', module: 'Module', formateur: 'Formateur', salle: 'Salle', groupe: 'Groupe', type: 'Type' },
    validators: {
      date: (v) => !v || !isNaN(Date.parse(v)) ? null : 'Date invalide (AAAA-MM-JJ)',
      heureDebut: (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? null : 'Heure début invalide (HH:mm)',
      heureFin: (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? null : 'Heure fin invalide (HH:mm)',
    },
  },
};

// ── Normalize header string for loose matching ─────────────────
const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

// ── Map Excel header → schema key ─────────────────────────────
const buildHeaderMap = (excelHeaders, schema) => {
  const allKeys = [...schema.required, ...schema.optional];
  const map = {}; // excelHeader → schemaKey

  excelHeaders.forEach(header => {
    const nh = normalize(header);
    const match = allKeys.find(key => {
      const nk = normalize(key);
      const nl = normalize(schema.labels[key] || '');
      return nh === nk || nh === nl || nh.includes(nk) || nk.includes(nh);
    });
    if (match) map[header] = match;
  });

  return map;
};

const SUPPORTED_EXCEL_EXTENSIONS = new Set(['xlsx', 'xlsm']);
const SUPPORTED_TEXT_EXTENSIONS = new Set(['csv']);
let excelJsPromise;

const loadExcelJS = async () => {
  if (!excelJsPromise) {
    excelJsPromise = import('exceljs').then((module) => module.default);
  }
  return excelJsPromise;
};

const normaliseCellValue = (value) => {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    if ('result' in value && value.result != null) return normaliseCellValue(value.result);
    if ('text' in value && typeof value.text === 'string') return value.text;
    if ('hyperlink' in value) return value.text || value.hyperlink || '';
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part?.text || '').join('');
    }
    // À ajouter dans normaliseCellValue
if (typeof value === 'number' && value > 30000 && value < 60000) {
  // Probablement une date Excel, ExcelJS a une méthode interne mais voici un fallback
  return new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString().split('T');
}
  }

  return String(value);
};

const extractExtension = (filename = '') =>
  filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';

const detectCsvDelimiter = (text) => {
  const sample = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);

  if (!sample) return ',';

  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestCount = -1;

  candidates.forEach((delimiter) => {
    let count = 0;
    let inQuotes = false;

    for (let i = 0; i < sample.length; i += 1) {
      const char = sample[i];
      if (char === '"') {
        if (inQuotes && sample[i + 1] === '"') {
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && char === delimiter) {
        count += 1;
      }
    }

    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  });

  return best;
};

const parseCsvText = (text) => {
  const delimiter = detectCsvDelimiter(text);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const readWorkbookRows = async (file) => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const totalColumns = Math.max(
    worksheet.actualColumnCount || 0,
    worksheet.getRow(1).cellCount || 0
  );

  const rows = [];
  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const worksheetRow = worksheet.getRow(rowIndex);
    const rowValues = Array.from({ length: totalColumns }, (_, colIndex) =>
      normaliseCellValue(worksheetRow.getCell(colIndex + 1).value)
    );
    rows.push(rowValues);
  }

  return rows;
};

const readRowsFromFile = async (file) => {
  const extension = extractExtension(file.name);

  if (SUPPORTED_EXCEL_EXTENSIONS.has(extension)) {
    return readWorkbookRows(file);
  }

  if (SUPPORTED_TEXT_EXTENSIONS.has(extension)) {
    return parseCsvText(await file.text());
  }

  throw new Error('Format non supporte. Utilisez .xlsx, .xlsm ou .csv');
};

const downloadBuffer = (buffer, filename, mimeType) => {
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const autosizeColumns = (worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, String(cell.value ?? '').length + 2);
    });
    column.width = Math.min(maxLength, 40);
  });
};

/**
 * Parse an Excel file and return validated rows.
 * @param {File}   file        - The uploaded file
 * @param {string} schemaType  - Key of SCHEMAS
 * @returns {Promise<{ rows: object[], errors: string[], warnings: string[] }>}
 */
export const importExcel = async (file, schemaType) => {
  const schema = SCHEMAS[schemaType];
  if (!schema) {
    return { rows: [], errors: [`Type inconnu : "${schemaType}"`], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  try {
    const raw = await readRowsFromFile(file);

    if (raw.length < 2) {
      return { rows: [], errors: ['Le fichier est vide ou ne contient pas de données.'], warnings: [] };
    }

    const excelHeaders = raw[0].map(String);
    const headerMap = buildHeaderMap(excelHeaders, schema);

    const mappedKeys = Object.values(headerMap);
    const missingRequired = schema.required.filter((k) => !mappedKeys.includes(k));
    if (missingRequired.length > 0) {
      const labels = missingRequired.map((k) => schema.labels[k] || k).join(', ');
      errors.push(`Colonnes obligatoires manquantes : ${labels}`);
    }

    const unmapped = excelHeaders.filter((header) => !headerMap[header] && header !== '');
    if (unmapped.length > 0) {
      warnings.push(`Colonnes ignorées (non reconnues) : ${unmapped.join(', ')}`);
    }

    if (errors.length > 0) {
      return { rows: [], errors, warnings };
    }

    const rows = [];
    for (let rowIndex = 1; rowIndex < raw.length; rowIndex += 1) {
      const excelRow = raw[rowIndex];
      if (excelRow.every((cell) => cell === '' || cell === null)) continue;

      const obj = {};
      excelHeaders.forEach((header, colIdx) => {
        const schemaKey = headerMap[header];
        if (schemaKey) {
          obj[schemaKey] = String(excelRow[colIdx] ?? '').trim();
        }
      });

      const rowMissing = schema.required.filter((key) => !obj[key] || obj[key] === '');
      if (rowMissing.length > 0) {
        warnings.push(`Ligne ${rowIndex + 1} ignorée — champs manquants : ${rowMissing.join(', ')}`);
        continue;
      }

      // Run custom validators if defined in schema
      if (schema.validators) {
        let rowHasErrors = false;
        Object.entries(schema.validators).forEach(([key, validator]) => {
          const error = validator(obj[key]);
          if (error) {
            warnings.push(`Ligne ${rowIndex + 1} ignorée — ${error} (${schema.labels[key] || key})`);
            rowHasErrors = true;
          }
        });
        if (rowHasErrors) continue;
      }

      rows.push(obj);
    }

    return { rows, errors: [], warnings };
  } catch (err) {
    return { rows: [], errors: [`Erreur de lecture du fichier : ${err.message}`], warnings: [] };
  }
};

/**
 * Export data to Excel file.
 * @param {object[]} data   - Array of objects
 * @param {string}   schemaType - Schema key for header labels
 * @param {string}   filename
 */
export const exportExcel = async (data, schemaType, filename = 'export.xlsx') => {
  try {
    const ExcelJS = await loadExcelJS();
    const schema = SCHEMAS[schemaType];
    const allKeys = schema ? [...schema.required, ...schema.optional] : Object.keys(data[0] || {});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Donnees');

    const headers = allKeys.map((key) => schema?.labels?.[key] || key);
    worksheet.addRow(headers);
    data.forEach((item) => {
      worksheet.addRow(allKeys.map((key) => item[key] ?? ''));
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    autosizeColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBuffer(buffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch (error) {
    console.error('Erreur lors de l export Excel :', error);
    throw error;
  }
};

/**
 * Generate a template Excel file for a given schema.
 */
export const downloadTemplate = async (schemaType) => {
  try {
    const ExcelJS = await loadExcelJS();
    const schema = SCHEMAS[schemaType];
    if (!schema) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Modele');
    const allKeys = [...schema.required, ...schema.optional];
    const headers = allKeys.map((key) => schema.labels[key] || key);

    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(1);

    allKeys.forEach((key, index) => {
      const cell = headerRow.getCell(index + 1);
      const isRequired = schema.required.includes(key);
      cell.font = { bold: true, color: { argb: isRequired ? 'FFB91C1C' : 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isRequired ? 'FFFEE2E2' : 'FFE2E8F0' },
      };
    });

    autosizeColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBuffer(buffer, `modele_${schemaType}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch (error) {
    console.error('Erreur lors du telechargement du modele Excel :', error);
    throw error;
  }
};

export default { importExcel, exportExcel, downloadTemplate, SCHEMAS };
