import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Check, CheckCheck, Trash2,
  CalendarDays, CalendarX, Users, Clock, Info,
} from 'lucide-react';
import { notificationStore } from '../../services/notificationStore';

// ── Type config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  info:    { color: 'bg-blue-100 text-blue-600',    dot: 'bg-blue-500',    icon: Info },
  success: { color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500', icon: Check },
  warning: { color: 'bg-amber-100 text-amber-600',  dot: 'bg-amber-500',   icon: Bell },
  danger:  { color: 'bg-red-100 text-red-600',      dot: 'bg-red-500',     icon: X },
};

const LINK_ICONS = {
  '/conges':         CalendarDays,
  '/absences':       CalendarX,
  '/personnels':     Users,
  '/emploi-du-temps':Clock,
};

function NotifItem({ notif, onRead, onRemove }) {
  const navigate = useNavigate();
  const cfg      = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon     = LINK_ICONS[notif.link] || Info;

// Pure date formatter — no Date.now() to stay compiler-safe
const formatNotifDate = (iso) => {
  const date = new Date(iso);
  const day  = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${day} à ${time}`;
};

  const handleClick = () => {
    onRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-surface-100 last:border-0
        ${notif.read ? 'bg-white hover:bg-surface-50' : 'bg-primary-50/30 hover:bg-primary-50/60'}`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
        <Icon size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-tight ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>
            {notif.title}
          </p>
          {!notif.read && <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">{formatNotifDate(notif.createdAt)}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(notif.id); }}
        className="p-1 rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function NotificationPanel() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef();

  // Subscribe to store
  useEffect(() => {
    return notificationStore.subscribe(setNotifications);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-surface-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center
            bg-red-500 text-white text-[9px] font-bold rounded-full px-1 animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 bg-surface-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unread} non lue{unread !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={() => notificationStore.markAllRead()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => notificationStore.clear()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Tout supprimer"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {notifications.map((n) => (
                  <div key={n.id} className="group">
                    <NotifItem
                      notif={n}
                      onRead={(id) => notificationStore.markRead(id)}
                      onRemove={(id) => notificationStore.remove(id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-surface-200 bg-surface-50 text-center">
              <p className="text-xs text-slate-400">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} au total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
