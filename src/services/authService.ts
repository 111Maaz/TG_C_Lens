
import { User } from '@/auth/contexts/AuthContext';

// Define response types for consistent API handling
export interface AuthResponse {
  user: User | null;
  error?: string;
}

// Use this base URL for all API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const authService = {
  // Login user with email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call to Supabase
      // This is a mock implementation
      if (email === 'demo@example.com' && password === 'password') {
        const user: User = {
          id: '1',
          email,
          name: 'Demo User',
          role: 'user',
        };
        return { user };
      }
      return { user: null, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: 'Authentication failed' };
    }
  },

  // Register a new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call to Supabase
      // Mock implementation
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'user',
      };
      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: 'Registration failed' };
    }
  },

  // Log out the current user
  async logout(): Promise<{ error?: string }> {
    try {
      // TODO: Replace with actual API call to Supabase
      return {};
    } catch (error) {
      console.error('Logout error:', error);
      return { error: 'Logout failed' };
    }
  },

  // Reset user password
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      // TODO: Replace with actual API call to Supabase
      return {};
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'Password reset failed' };
    }
  },

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>): Promise<AuthResponse> {
    try {
      // TODO: Replace with actual API call to Supabase
      return { user: { ...data, id: userId } as User };
    } catch (error) {
      console.error('Profile update error:', error);
      return { user: null, error: 'Profile update failed' };
    }
  }
};

export default authService;
