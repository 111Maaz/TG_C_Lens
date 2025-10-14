
import { User } from '../contexts/AuthContext';

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Get user role display name
export const getUserRoleDisplay = (user: User): string => {
  if (!user.role) return 'User';
  
  switch (user.role) {
    case 'admin':
      return 'Administrator';
    case 'analyst':
      return 'Crime Analyst';
    default:
      return 'User';
  }
};

// Format error messages for display
export const formatAuthError = (error: string): string => {
  // Map backend error messages to user-friendly messages
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email address',
  };
  
  return errorMap[error] || error || 'An unknown error occurred';
};

// Generate initials from name
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};
