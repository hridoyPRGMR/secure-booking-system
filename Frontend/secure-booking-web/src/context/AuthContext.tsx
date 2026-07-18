import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { User } from '../types/User';
import axiosClient from '../api/apiClient';
import { ApiValidationError, AuthResponse } from '../types/Auth';

interface LoginResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
      const { accessToken, id, firstName, lastName, email: userEmail } = response.data;

      const profile: User = { id, firstName, lastName, email: userEmail };
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      
      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiValidationError>;
        return {
          success: false,
          message: axiosError.response?.data?.detail || 'An unexpected error occurred.',
          errors: axiosError.response?.data?.errors
        };
      }
      return { success: false, message: 'Connection error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};