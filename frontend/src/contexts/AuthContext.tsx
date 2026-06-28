import React, { createContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updatePoints: (points: number) => void;
  updateName: (name: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('civic_agent_jwt');
      const savedUser = localStorage.getItem('civic_agent_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
          // Perform backend profile fetch to ensure the token remains valid and profiles are synchronized
          const profile = await AuthService.getProfile();
          setUser(profile);
          localStorage.setItem('civic_agent_user', JSON.stringify(profile));
        } catch (e) {
          console.error('Session validation failed. Logging out...', e);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();

    // Bind token expiry listener
    const handleExpiry = () => {
      logout();
    };
    window.addEventListener('auth_session_expired', handleExpiry);
    return () => window.removeEventListener('auth_session_expired', handleExpiry);
  }, []);

  const login = (jwtToken: string, userProfile: UserProfile) => {
    localStorage.setItem('civic_agent_jwt', jwtToken);
    localStorage.setItem('civic_agent_user', JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
  };

  const logout = () => {
    localStorage.removeItem('civic_agent_jwt');
    localStorage.removeItem('civic_agent_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await AuthService.getProfile();
      setUser(profile);
      localStorage.setItem('civic_agent_user', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  const updatePoints = async (points: number) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, points: prev.points + points };
      localStorage.setItem('civic_agent_user', JSON.stringify(next));
      return next;
    });
    try {
      await AuthService.updateProfile({ pointsDelta: points });
    } catch (e) {
      console.error('Failed to sync points with backend', e);
    }
  };

  const updateName = async (name: string) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, name };
      localStorage.setItem('civic_agent_user', JSON.stringify(next));
      return next;
    });
    try {
      await AuthService.updateProfile({ name });
    } catch (e) {
      console.error('Failed to sync name with backend', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        refreshProfile,
        updatePoints,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
