import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as authService from '../services/authService.js';
import { useToast } from './ToastContext.jsx';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let active = true;
    authService
      .fetchMe()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Fired by the Axios interceptor when a protected call returns 401
  useEffect(() => {
    const onExpired = () => {
      if (!userRef.current) return;
      setUser(null); // ProtectedRoute then redirects to /login
      toast.error('Your session expired. Please log in again.');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [toast]);

  const login = useCallback(async (credentials) => {
    const u = await authService.loginUser(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (details) => {
    const u = await authService.registerUser(details);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, updateUser: setUser }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}