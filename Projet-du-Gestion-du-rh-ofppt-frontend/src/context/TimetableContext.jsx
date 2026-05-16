import React, { createContext, useContext, useState, useEffect } from 'react';
import { personnelService, seanceService } from '../services/crudServices';

const TimetableContext = createContext();

export function TimetableProvider({ children }) {
  const [filters, setFilters] = useState({
    etablissement: '',
    formateur: '',
    groupe: '',
    grade: ''
  });

  const [allPersonnels, setAllPersonnels] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load personnels globally for validation and names
    personnelService.getAll({ per_page: 1000 })
      .then(res => setAllPersonnels(Array.isArray(res) ? res : (res.data || [])))
      .catch(err => console.error("Error loading personnels in context:", err));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    seanceService.getAll()
      .then(res => {
        if (!cancelled) setSeances(Array.isArray(res) ? res : (res.data || []));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    const onUpdate = () => setRefreshKey(k => k + 1);
    window.addEventListener('seances-updated', onUpdate);
    return () => window.removeEventListener('seances-updated', onUpdate);
  }, []);

  // Performance: Index personnels for O(1) lookups
  const personnelMap = React.useMemo(() => {
    const map = { matricule: {}, name: {} };
    allPersonnels.forEach(p => {
      if (p.matricule) map.matricule[p.matricule] = p;
      const fullName = `${(p.nom || '').toUpperCase()} ${(p.prenom || '')}`.trim();
      map.name[fullName] = p;
    });
    return map;
  }, [allPersonnels]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({ etablissement: '', formateur: '', groupe: '', grade: '' });
  };

  return (
    <TimetableContext.Provider value={{ 
      filters, 
      setFilters, 
      handleFilterChange, 
      handleReset,
      allPersonnels,
      personnelMap,
      seances,
      setSeances,
      loading,
      refreshKey,
      setRefreshKey
    }}>
      {children}
    </TimetableContext.Provider>
  );
}

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};
