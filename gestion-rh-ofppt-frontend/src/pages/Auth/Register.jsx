import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Le nom est obligatoire.';
    if (!form.email) e.email = 'L\'email est obligatoire.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide.';
    if (!form.password) e.password = 'Le mot de passe est obligatoire.';
    else if (form.password.length < 6) e.password = 'Minimum 6 caractères.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({
        username: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword
      });
      navigate('/dashboard');
    } catch {
      // Error is surfaced via AuthContext.error state
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-900/50 mb-4">
            <span className="text-white font-bold text-2xl font-display">O</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Créer un compte</h1>
          <p className="text-slate-400 text-sm mt-1">Rejoignez le système OFPPT RH</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/40">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nom complet" name="name" placeholder="Prénom Nom" value={form.name} onChange={handleChange} error={errors.name} required />
            <Input label="Adresse email" name="email" type="email" placeholder="vous@ofppt.ma" value={form.email} onChange={handleChange} error={errors.email} required />
            <Input label="Mot de passe" name="password" type="password" placeholder="Min. 6 caractères" value={form.password} onChange={handleChange} error={errors.password} required />
            <Input label="Confirmer le mot de passe" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
            <Button type="submit" loading={loading} className="w-full justify-center mt-2">
              <UserPlus size={16} />
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/auth/login" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
