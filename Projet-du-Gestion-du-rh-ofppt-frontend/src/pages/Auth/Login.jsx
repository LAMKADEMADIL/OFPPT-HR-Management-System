import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import logo from '../../assets/logo.png';
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      {/* Official OFPPT Logo on the far left corner */}
      <div className="absolute top-10 left-10 animate-fadeIn hidden md:block">
        <img src={logo} alt="OFPPT Logo" className="w-24 h-24 object-contain drop-shadow-sm rounded-full overflow-hidden" />
      </div>

      {/* Background decoration with reversed positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Header without logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 font-display">OFPPT Gestion RH</h1>
          <p className="text-slate-500 text-sm mt-1">Connectez-vous à votre espace</p>
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
