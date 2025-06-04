
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'analyst';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <Skeleton className="h-12 w-full max-w-sm mb-4" />
        <Skeleton className="h-32 w-full mb-2" />
        <Skeleton className="h-4 w-full max-w-md mb-2" />
        <Skeleton className="h-4 w-full max-w-md mb-2" />
        <Skeleton className="h-12 w-full max-w-sm" />
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check for required role if specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute;
