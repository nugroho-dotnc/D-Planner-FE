import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/app/authService';
import authStore from '../store/authStore';

// ─── Auth Context ─────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(() => authStore.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authStore.isAuthenticated());
  const [loading,         setLoading]         = useState(false);
  const navigate = useNavigate();

  // Sync state when localStorage changes (multi-tab)
  useEffect(() => {
    const sync = () => {
      setUser(authStore.getUser());
      setIsAuthenticated(authStore.isAuthenticated());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return result;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const result = await authService.register(name, email, password, confirmPassword);
      setUser(result.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return result;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default useAuth;
