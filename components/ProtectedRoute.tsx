import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo 
}) => {
  const { user } = useAppStore();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If roles are specified and user doesn't have access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const defaultRedirect = user.role === UserRole.ADMIN ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
};

