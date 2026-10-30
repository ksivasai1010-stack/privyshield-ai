import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('privyshield_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify session
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('privyshield_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid, reverting to guest/demo mode');
        localStorage.removeItem('privyshield_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('privyshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.fullName || res.data.user.email}!`);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to authenticate.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      if (res.data.success) {
        localStorage.setItem('privyshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Account created successfully!');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Instant demo login for hackathon judges
  const quickDemoLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email: 'demo@privyshield.ai',
        password: 'Demo@123'
      });
      if (res.data.success) {
        localStorage.setItem('privyshield_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Signed in as Hackathon Demo Analyst!');
        return { success: true };
      }
    } catch (err) {
      // If demo user wasn't registered in fresh db, simulate demo user
      const demoUser = {
        id: 'demo-user-uuid-101',
        email: 'demo@privyshield.ai',
        fullName: 'Security Analyst (Demo)',
        preferredAi: 'both'
      };
      setUser(demoUser);
      toast.success('Live Demo Mode Activated!');
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('privyshield_token');
    setToken(null);
    setUser(null);
    toast.success('Signed out securely.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
