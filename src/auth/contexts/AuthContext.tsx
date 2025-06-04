
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService from '@/services/authService';

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin' | 'analyst';
  avatar?: string;
}

// Define auth state type
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For demo purposes, check localStorage
        // This will be replaced with Supabase auth.getSession()
        const storedUser = localStorage.getItem('crimeapp_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to restore session',
        });
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login(email, password);
      
      if (response.error || !response.user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Login failed',
        }));
        return;
      }
      
      // Store user in localStorage (will be replaced with Supabase session)
      localStorage.setItem('crimeapp_user', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed',
      }));
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.register(email, password, name);
      
      if (response.error || !response.user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed',
        }));
        return;
      }
      
      // Store user in localStorage (will be replaced with Supabase session)
      localStorage.setItem('crimeapp_user', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed',
      }));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authService.logout();
      
      // Remove user from storage
      localStorage.removeItem('crimeapp_user');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.resetPassword(email);
      
      if (response.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error,
        }));
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Password reset failed',
      }));
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.updateProfile(state.user.id, data);
      
      if (response.error || !response.user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Profile update failed',
        }));
        return;
      }
      
      const updatedUser = { ...state.user, ...response.user };
      localStorage.setItem('crimeapp_user', JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Profile update failed',
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
