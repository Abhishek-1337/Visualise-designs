import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <RoleAccessDenied />;
  }

  return children;
};

const RoleAccessDenied = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md px-8">
      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-9 h-9 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Access Restricted</h2>
      <p className="text-muted-foreground leading-relaxed">
        You don't have permission to access this page. Contact your administrator if you need access.
      </p>
    </div>
  </div>
);

export default ProtectedRoute;
