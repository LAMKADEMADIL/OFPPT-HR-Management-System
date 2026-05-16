/* global FileReader, CustomEvent */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Save, User, Shield, KeyRound, Eye, EyeOff, Check, AlertTriangle,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';

// ── Storage keys ──────────────────────────────────────────────
const PROFILE_KEY = 'ofppt_user_profile';
const AVATAR_KEY  = 'ofppt_user_avatar';

// ── Avatar helpers ────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-primary-600',   'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500',     'bg-rose-500',    'bg-cyan-500',
];

/**
 * Calcule les initiales (2 lettres max) à partir d'un nom complet.
 * "Hassan Alaoui" → "HA"
 */
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
};

// ── Avatar component ──────────────────────────────────────────
export function UserAvatar({ name = '', size = 'md', className = '' }) {
  const [avatarSrc, setAvatarSrc] = useState(
    () => localStorage.getItem(AVATAR_KEY)
  );

  useEffect(() => {
    // Listen for avatar updates from ProfilePage
    const onUpdate = () => {
      const latest = localStorage.getItem(AVATAR_KEY);
      setAvatarSrc(latest || null);
    };
    window.addEventListener('avatar-updated', onUpdate);
    return () => window.removeEventListener('avatar-updated', onUpdate);
  }, []);

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' };
  const sizeClass = sizes[size] || sizes.md;
  const initials  = getInitials(name);
  const colorCls  = getAvatarColor(name);

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${colorCls} rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow font-bold text-white font-display ${className}`}>
      {initials || <User size={14} />}
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl ${color}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();
  const fileRef                = useRef();
  const [avatarSrc, setAvatarSrc] = useState(
    () => localStorage.getItem(AVATAR_KEY)
  );
  const [saving, setSaving]    = useState(false);
  const [showPwd, setShowPwd]  = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // ── Profile form ──────────────────────────────────────────
  const defaultProfile = {
    nom:       user?.name?.split(' ').slice(-1)[0]  || user?.nom    || '',
    prenom:    user?.name?.split(' ')[0]             || user?.prenom || '',
    email:     user?.email    || '',
    telephone: user?.telephone || '',
    poste:     user?.poste     || user?.role || '',
    service:   user?.service   || '',
    departement: user?.departement || '',
    etablissement: user?.etablissement || 'ISTA Hay Riad',
    bio:       user?.bio || '',
  };

  const [profile, setProfile] = useState(() => {
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') };
    } catch {
      return defaultProfile;
    }
  });

  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});

  // Load saved avatar


  const fullName = `${profile.prenom} ${profile.nom}`.trim() || user?.name || 'Utilisateur';

  // ── Avatar upload ─────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAvatarSrc(base64);
      localStorage.setItem(AVATAR_KEY, base64);
      window.dispatchEvent(new CustomEvent('avatar-updated'));
      toast.success('Photo de profil mise à jour.');
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarSrc(null);
    localStorage.removeItem(AVATAR_KEY);
    window.dispatchEvent(new CustomEvent('avatar-updated'));
    toast.info('Photo de profil supprimée.');
  };

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 400)); // simulate async
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Update user name in storage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...storedUser,
      name:  fullName,
      email: profile.email,
    }));
    window.dispatchEvent(new CustomEvent('profile-updated'));
    toast.success('Profil enregistré avec succès.');
    setSaving(false);
  };

  // ── Change password ───────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwd.current)          errs.current = 'Obligatoire.';
    if (!pwd.newPwd)           errs.newPwd  = 'Obligatoire.';
    else if (pwd.newPwd.length < 6) errs.newPwd = 'Minimum 6 caractères.';
    if (pwd.newPwd !== pwd.confirm) errs.confirm = 'Les mots de passe ne correspondent pas.';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    setPwdSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setPwd({ current: '', newPwd: '', confirm: '' });
    setPwdErrors({});
    setPwdSaving(false);
    toast.success('Mot de passe mis à jour avec succès.');
  };

  const TABS = [
    { key: 'info',     label: 'Informations',   icon: User },
    { key: 'security', label: 'Sécurité',        icon: Shield },
  ];

  return (
    <MainLayout>
      <PageHeader title="Mon Profil" subtitle="Gérez vos informations personnelles et préférences" />

      <div className="max-w-4xl mx-auto">
        {/* ── Profile hero card ──────────────────────────────── */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar + name */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${getAvatarColor(fullName)} text-white text-3xl font-bold font-display`}>
                      {getInitials(fullName)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                  title="Changer la photo"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name + role */}
              <div className="flex-1 mt-4 sm:mt-0">
                <h2 className="text-xl font-bold text-slate-800 font-display">{fullName}</h2>
                <p className="text-sm text-slate-500">{profile.poste || user?.role || 'Utilisateur'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{profile.email || user?.email}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {avatarSrc && (
                  <button onClick={removeAvatar} className="text-xs text-red-500 hover:underline px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                    Supprimer photo
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <StatPill label="Rôle"          value={user?.role || 'Admin'}  color="bg-primary-50 text-primary-700" />
              <StatPill label="Établissement"  value={profile.etablissement || 'ISTA'} color="bg-emerald-50 text-emerald-700" />
              <StatPill label="Service"        value={profile.service || '—'} color="bg-violet-50 text-violet-700" />
            </div>
          </div>
        </Card>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className="flex gap-1 mb-4 p-1 bg-surface-100 rounded-xl w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all
                ${activeTab === key ? 'bg-white text-primary-700 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Info tab ──────────────────────────────────────── */}
        {activeTab === 'info' && (
          <Card title="Informations personnelles">
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Prénom" name="prenom" value={profile.prenom}
                  onChange={e => setProfile(p => ({ ...p, prenom: e.target.value }))} required />
                <Input label="Nom"    name="nom"    value={profile.nom}
                  onChange={e => setProfile(p => ({ ...p, nom: e.target.value }))}    required />
                <Input label="Email"  name="email"  type="email" value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}  required />
                <Input label="Téléphone" name="telephone" value={profile.telephone}
                  onChange={e => setProfile(p => ({ ...p, telephone: e.target.value }))} />
                <Input label="Poste / Fonction" name="poste" value={profile.poste}
                  onChange={e => setProfile(p => ({ ...p, poste: e.target.value }))} />
                <Input label="Service" name="service" value={profile.service}
                  onChange={e => setProfile(p => ({ ...p, service: e.target.value }))} />
                <Input label="Département" name="departement" value={profile.departement}
                  onChange={e => setProfile(p => ({ ...p, departement: e.target.value }))} />
                <Input label="Établissement" name="etablissement" value={profile.etablissement}
                  onChange={e => setProfile(p => ({ ...p, etablissement: e.target.value }))} />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Bio / Notes</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Quelques mots sur vous…"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-200">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> Données stockées localement (localStorage)
                </p>
                <Button type="submit" loading={saving}>
                  <Save size={15} /> Enregistrer
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ── Security tab ──────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-5">
            {/* Change password */}
            <Card title={<div className="flex items-center gap-2"><KeyRound size={16} className="text-primary-500" /> Changer le mot de passe</div>}>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <div className="relative">
                  <Input label="Mot de passe actuel" name="current" type={showPwd ? 'text' : 'password'}
                    value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                    error={pwdErrors.current} required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Input label="Nouveau mot de passe" name="newPwd" type="password"
                  value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                  error={pwdErrors.newPwd} hint="Minimum 6 caractères" required />
                <Input label="Confirmer le mot de passe" name="confirm" type="password"
                  value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                  error={pwdErrors.confirm} required />

                <div className="flex justify-end pt-2 border-t border-surface-200">
                  <Button type="submit" loading={pwdSaving}>
                    <Check size={15} /> Mettre à jour
                  </Button>
                </div>
              </form>
            </Card>

            {/* Session info */}
            <Card title={<div className="flex items-center gap-2"><Shield size={16} className="text-primary-500" /> Session active</div>}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Compte</p>
                  <p className="font-medium text-slate-700">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Rôle</p>
                  <p className="font-medium text-slate-700">{user?.role || 'Administrateur'}</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-surface-200">
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold hover:underline">
                  Se déconnecter de cette session
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
