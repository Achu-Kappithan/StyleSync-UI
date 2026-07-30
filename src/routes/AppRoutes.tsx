import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const CheckoutPage = lazy(() => import('../features/billing/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));

const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#081c1c',
      color: '#00c9a7',
      fontFamily: 'Inter, sans-serif',
      fontSize: '0.9rem',
    }}
  >
    <span>Loading StyleSync…</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};
