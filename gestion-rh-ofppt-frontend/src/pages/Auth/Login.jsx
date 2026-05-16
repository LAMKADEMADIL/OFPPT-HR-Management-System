import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'L\'email est obligatoire.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide.';
    if (!form.password) e.password = 'Le mot de passe est obligatoire.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked! Form state:", form);

    if (!validate()) {
      console.log("Validation failed!", errors);
      return;
    }

    try {
      console.log("Calling login service with:", form);
      await login(form);

      // Added 500ms delay to let the AuthContext state catch up
      setTimeout(() => {
        console.log("Login successful! Redirecting to dashboard...");
        navigate('/dashboard');
      }, 500);

    } catch (err) {
      console.error("Login failed in component:", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-900/50 mb-4">
            <span className="text-white font-bold text-2xl font-display">O</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">OFPPT Gestion RH</h1>
          <p className="text-slate-400 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/40">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Adresse email"
              name="email"
              type="email"
              placeholder="admin@ofppt.ma"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center mt-1">
              <LogIn size={16} />
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-primary-600 font-semibold hover:underline">S&apos;inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
