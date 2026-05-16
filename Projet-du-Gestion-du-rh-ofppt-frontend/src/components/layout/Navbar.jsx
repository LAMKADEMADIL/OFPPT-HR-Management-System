import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationPanel from '../common/NotificationPanel';
import { UserAvatar } from '../../pages/Profile/ProfilePage';

const PAGE_TITLES = {
  '/dashboard':             'Tableau de bord',
  '/personnels':            'Gestion du Personnel',
  '/conges':                'Congés',
  '/absences':              'Absences',
  '/emploi-du-temps':       'Emploi du Temps',
  '/emploi-du-temps/import':'Import Planning Excel',
  '/users':                 'Utilisateurs',
  '/profile':               'Mon Profil',
};

export default function Navbar() {
  const { user }    = useAuth();
  const { pathname} = useLocation();
  const navigate    = useNavigate();

  const base  = '/' + pathname.split('/')[1];
  const title = PAGE_TITLES[pathname] || PAGE_TITLES[base] || 'OFPPT RH';
  const name  = user?.name || user?.nom || 'Utilisateur';

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 font-display">{title}</h1>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-surface-100 rounded-xl px-3 py-2 text-sm text-slate-400 w-56">
          <Search size={14} /><span>Rechercher…</span>
        </div>

        {/* Notifications */}
        <NotificationPanel />

        {/* Avatar → Profile */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          title="Mon profil"
        >
          <UserAvatar name={name} size="md" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-700 leading-none">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role || 'Administrateur'}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
