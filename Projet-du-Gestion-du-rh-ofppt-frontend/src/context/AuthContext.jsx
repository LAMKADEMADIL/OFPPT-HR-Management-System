import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncUser = () => setUser(authService.getCurrentUser());
    const handleStorage = (event) => {
      if (!event || event.key === null || event.key === 'user') {
        syncUser();
      }
    };

    window.addEventListener('profile-updated', syncUser);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('profile-updated', syncUser);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || 'Email ou mot de passe incorrect.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || 'Erreur lors de l\'inscription.';
      
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0][0];
        msg = firstError;
      }
      
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
