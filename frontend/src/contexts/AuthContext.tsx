import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    console.log('AuthContext: Starting checkAuth');
    const token = localStorage.getItem('accessToken');
    console.log('AuthContext: Token found:', !!token);
    
    if (token) {
      try {
        console.log('AuthContext: Validating token with /users/me/');
        const response = await api.get('/users/me/');
        console.log('AuthContext: Token valid, user data:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('AuthContext: Token invalid, clearing storage');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } else {
      console.log('AuthContext: No token found');
    }
    
    console.log('AuthContext: Setting loading to false');
    setLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/users/login/', { username, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting registration with data:', userData);
      const response = await api.post('/users/register/', userData);
      console.log('AuthContext: Registration response:', response.data);
      
      const { access, refresh, user: newUser } = response.data;
      
      console.log('AuthContext: Setting tokens and user data');
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(newUser);
      setIsAuthenticated(true);
      
      console.log('AuthContext: Registration successful, user authenticated');
      return true;
    } catch (error: any) {
      console.error('AuthContext: Registration failed:', error);
      if (error.response?.data) {
        console.error('AuthContext: Error details:', error.response.data);
      }
      return false;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};