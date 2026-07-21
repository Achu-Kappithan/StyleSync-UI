import React from 'react';
import { Navigate } from 'react-router-dom';

export interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuth = sessionStorage.getItem('ss_auth') === 'true';
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};
