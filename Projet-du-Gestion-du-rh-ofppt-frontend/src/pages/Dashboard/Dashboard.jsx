import React, { useState, useEffect } from 'react';
import { Building2, GraduationCap, Clock, ChevronDown, Plus, Users, Briefcase, CalendarDays, CalendarX, BarChart3, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// --- Composants Internes ---

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
      <Icon size={26} className="text-white" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      {loading ? (
        <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1" />
      ) : (
        <p className="text-3xl font-bold text-slate-800">{value ?? 0}</p>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    personnels: 0, formateurs: 0, administratifs: 0, conges: 0, absences: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      const data = response.data?.data;

      if (data) {
        setStats({
          personnels: data.personnels_total,
          formateurs: data.personnels_by_type?.formateur,
          administratifs: data.personnels_by_type?.administratif,
          conges: data.conges_pending,
          absences: data.absences_total,
        });
      }
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique
  const chartData = [
    { name: 'Formateurs', value: stats.formateurs, color: '#8b5cf6' },
    { name: 'Administratifs', value: stats.administratifs, color: '#10b981' },
    { name: 'Congés', value: stats.conges, color: '#f59e0b' },
    { name: 'Absences', value: stats.absences, color: '#ef4444' },
  ];

  return (
    <MainLayout>
      {/* Header avec Date */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Bonjour, {user?.nom || 'Collaborateur'}
          </h1>
          <p className="text-slate-500 mt-1">Voici l'état actuel du complexe aujourd'hui.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-slate-700">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-1 text-green-500 text-xs font-medium justify-end">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Serveur Connecté
          </div>
        </div>
      </div>

      {/* Grid de Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard label="Total Effectif" value={stats.personnels} icon={Users} color="bg-blue-600" loading={loading} />
        <StatCard label="Formateurs" value={stats.formateurs} icon={GraduationCap} color="bg-violet-500" loading={loading} />
        <StatCard label="Administratifs" value={stats.administratifs} icon={Briefcase} color="bg-emerald-500" loading={loading} />
        <StatCard label="En Congé" value={stats.conges} icon={CalendarDays} color="bg-amber-500" loading={loading} />
        <StatCard label="Absences" value={stats.absences} icon={CalendarX} color="bg-red-500" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique de Répartition */}
        <Card className="lg:col-span-2 p-6" title={
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-600" />
            <span>Répartition du Personnel & Activités</span>
          </div>
        }>
          <div className="h-[300px] w-full min-h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Actions Rapides Verticales */}
        <div className="flex flex-col gap-6">
          <Card title="Actions Rapides">
            <div className="space-y-3 mt-2">
              <QuickActionBtn label="Ajouter Personnel" icon={<Users size={18}/>} to="/personnels" color="text-blue-600 bg-blue-50" />
              <QuickActionBtn label="Valider Congés" icon={<CalendarDays size={18}/>} to="/conges" color="text-amber-600 bg-amber-50" />
              <QuickActionBtn label="Saisir Absences" icon={<CalendarX size={18}/>} to="/absences" color="text-red-600 bg-red-50" />
              <QuickActionBtn label="Gérer Planning" icon={<BarChart3 size={18}/>} to="/emploi-du-temps" color="text-violet-600 bg-violet-50" />
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

// Sous-composant pour les boutons d'action
const QuickActionBtn = ({ label, icon, to, color }) => (
  <Link to={to} className={`flex items-center justify-between p-4 rounded-xl ${color} hover:opacity-80 transition-all font-medium text-sm group`}>
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </Link>
);