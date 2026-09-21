import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('eventpass_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('eventpass_admin_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const me = await api.getAdminMe();
      setUser(me);
      localStorage.setItem('eventpass_admin_user', JSON.stringify(me));
    } catch {
      const saved = localStorage.getItem('eventpass_admin_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          api.adminLogout();
          setUser(null);
        }
      } else {
        api.adminLogout();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.adminLogin(email, pass);
    setUser(res.user);
  };

  const logout = () => {
    api.adminLogout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isStaff,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
