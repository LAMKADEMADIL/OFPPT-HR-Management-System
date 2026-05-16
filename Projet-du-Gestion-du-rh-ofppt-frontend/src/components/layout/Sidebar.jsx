import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, CalendarX,
  UserCog, LogOut, ChevronLeft, Menu, CalendarRange, FileSpreadsheet, UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';
import { ROLES } from '../../utils/constants'; // Import your Role constants

const NAV_LINKS = [
  { to: '/dashboard',       label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/personnels',      label: 'Personnel',        icon: Users },
  { to: '/conges',          label: 'Congés',           icon: CalendarDays },
  { to: '/absences',        label: 'Absences',         icon: CalendarX },
  { to: '/emploi-du-temps', label: 'Emploi du Temps',  icon: CalendarRange },
  { to: '/emploi-du-temps/import', label: 'Import Planning', icon: FileSpreadsheet },
  { to: '/users',           label: 'Utilisateurs',     icon: UserCog, adminOnly: true }, // Added flag
  { to: '/profile',         label: 'Mon Profil',        icon: UserCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // FILTER LOGIC: Hide admin links if the user is not a Directeur
  const filteredLinks = NAV_LINKS.filter(link => {
    if (link.adminOnly && user?.role !== ROLES.DIRECTEUR_COMPLEXE) {
      return false;
    }
    return true;
  });

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-surface-900 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0`}>
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'} px-4 py-5 border-b border-white/10`}>
        {!collapsed && (
          <>
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-full overflow-hidden flex-shrink-0" />
            <div className="animate-fadeIn">
              <p className="text-white font-semibold text-sm font-display leading-none">OFPPT</p>
              <p className="text-slate-400 text-xs mt-0.5">Gestion RH</p>
            </div>
          </>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {filteredLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl bg-white/5">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {getInitials(user?.nom || user?.name || 'U')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.nom || user?.name || 'Utilisateur'}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
          title={collapsed ? 'Déconnexion' : undefined}>
          <LogOut size={16} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}