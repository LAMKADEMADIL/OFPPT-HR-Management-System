import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Building2, User, Users, GraduationCap } from 'lucide-react';
import { etablissementService, personnelService, specialiteService } from '../../services/crudServices';

export default function FilterBar({ data = [], filters, onFilterChange, onReset }) {
  const [dbData, setDbData] = useState({
    etablissements: [],
    personnels: [],
    specialites: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [etabs, pers, specs] = await Promise.all([
          etablissementService.getAll(),
          personnelService.getAll({ per_page: 1000 }), // Fetch more to avoid missing data
          specialiteService.getAll()
        ]);
        
        setDbData({
          etablissements: Array.isArray(etabs) ? etabs : (etabs.data || []),
          personnels: Array.isArray(pers) ? pers : (pers.data || []),
          specialites: Array.isArray(specs) ? specs : (specs.data || [])
        });
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchData();
  }, []);

  // Extraction dynamique des options
  const options = useMemo(() => {
    // 1. Etablissements from DB
    const etabs = dbData.etablissements;

    // 2. Formateurs from DB (nom + prenom)
    // Filter by selected etablissement if applicable
    let filteredPersonnels = dbData.personnels.filter(p => p.type_personnel === 'formateur');
    if (filters.etablissement) {
      // Find idEtab by name if filters.etablissement is a name, or vice versa.
      // Usually filters.etablissement would be the name for display consistency.
      const selectedEtab = etabs.find(e => e.nom === filters.etablissement);
      if (selectedEtab) {
        filteredPersonnels = filteredPersonnels.filter(p => p.idEtab === selectedEtab.idEtab);
      }
    }

    const formateurs = filteredPersonnels.map(p => ({
      id: p.idPersonnel,
      displayName: `${(p.nom || '').toUpperCase()} ${(p.prenom || '')}`
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));

    // 3. Grades (Unique from personnels)
    const grades = [...new Set(dbData.personnels.map(p => p.grade).filter(Boolean))].sort();

    // 4. Specialties from DB
    const specialites = dbData.specialites.map(s => s.nom_specialite || s.nom).filter(Boolean).sort();

    // 5. Groupes from Excel Data
    const groupes = [...new Set(data.map(item => item.groupe || item._raw?.groupe).filter(Boolean))].sort();

    return {
      etablissements: [...new Set(etabs.map(e => (e.nom || '').trim()).filter(Boolean))].sort(),
      // Deduplicate formateurs by displayName to avoid key collisions in dropdown
      formateurs: Array.from(new Map(formateurs.filter(f => f.displayName.trim()).map(f => [f.displayName, f])).values()),
      grades: [...new Set(dbData.personnels.map(p => (p.grade || '').trim()).filter(Boolean))].sort(),
      specialites: [...new Set(dbData.specialites.map(s => (s.nom_specialite || s.nom || '').trim()).filter(Boolean))].sort(),
      groupes: [...new Set(data.map(item => (item.groupe || item._raw?.groupe || '').trim()).filter(Boolean))].sort()
    };
  }, [dbData, filters.etablissement, data]);

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="card p-4 mb-5 shadow-sm bg-white rounded-2xl border border-slate-100">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 flex-shrink-0 mb-2">
          <Filter size={16} className="text-primary-500" />
          Filtres Avancés
        </div>

        {/* Établissement */}
        <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 sm:flex-none">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <Building2 size={12} /> Établissement
          </label>
          <select
            name="etablissement"
            value={filters.etablissement || ''}
            onChange={(e) => onFilterChange('etablissement', e.target.value)}
            className="input-field text-sm py-2 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all"
          >
            <option key="all-etabs" value="">Tous les établissements</option>
            {options.etablissements.map((opt, idx) => (
              <option key={`etab-${opt}-${idx}`} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Formateur */}
        <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 sm:flex-none">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <User size={12} /> Formateur
          </label>
          <select
            name="formateur"
            value={filters.formateur || ''}
            onChange={(e) => onFilterChange('formateur', e.target.value)}
            className="input-field text-sm py-2 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all"
          >
            <option key="all-formateurs" value="">Tous les formateurs</option>
            {options.formateurs.map((opt) => (
              <option key={`formateur-${opt.id || opt.displayName}`} value={opt.displayName}>
                {opt.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Groupe */}
        <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-none">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <Users size={12} /> Groupe
          </label>
          <select
            name="groupe"
            value={filters.groupe || ''}
            onChange={(e) => onFilterChange('groupe', e.target.value)}
            className="input-field text-sm py-2 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all"
          >
            <option key="all-groupes" value="">Tous les groupes</option>
            {options.groupes.map((opt, idx) => (
              <option key={`groupe-${opt}-${idx}`} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-none">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <GraduationCap size={12} /> Grade
          </label>
          <select
            name="grade"
            value={filters.grade || ''}
            onChange={(e) => onFilterChange('grade', e.target.value)}
            className="input-field text-sm py-2 px-3 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all"
          >
            <option key="all-grades" value="">Tous les grades</option>
            {options.grades.map((opt, idx) => (
              <option key={`grade-${opt}-${idx}`} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto mb-1">
          {hasFilters && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              Réinitialiser
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            {data.length} séances
          </span>
        </div>
      </div>
    </div>
  );
}
