import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState, User } from '../store';
import { verifyToken, logout, setUser } from '../store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  handleAuthCallback: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(verifyToken());
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const handleAuthCallback = (token: string) => {
    localStorage.setItem('authToken', token);
    dispatch(verifyToken());
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    handleAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
