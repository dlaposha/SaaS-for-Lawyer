import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import FullPageSpinner from '@components/UI/FullPageSpinner';

interface Props {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (requiredRole && user?.role !== requiredRole)
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default PrivateRoute;