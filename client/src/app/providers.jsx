import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { BrowserRouter } from 'react-router-dom';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { setAccessToken, clearTokens } from '../lib/auth';
import { ToastProvider } from '../components/ui/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const res = await api.get('/auth/me');
    // Server: { success: true, data: user }
    return res.data.data;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Server: { success: true, data: { accessToken, token } }
        const res = await api.post('/auth/refresh');
        const token = res.data.data?.accessToken || res.data.data?.token;
        if (token) setAccessToken(token);
        const userData = await fetchMe();
        setUser(userData);
      } catch (error) {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
      clearTokens();
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [fetchMe]);

  const login = useCallback(async (credentials) => {
    // Server: { success: true, data: { user, accessToken, token } }
    const res = await api.post('/auth/login', credentials);
    const token = res.data.data?.accessToken || res.data.data?.token;
    if (token) setAccessToken(token);
    const userData = await fetchMe();
    setUser(userData);
    return userData;
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await fetchMe();
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

export const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
