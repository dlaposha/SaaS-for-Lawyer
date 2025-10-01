// src/router/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CasesPage from '../pages/Cases/CasesPage';
import CaseDetailPage from '../pages/Cases/CaseDetailPage';
import ClientsPage from '../pages/Clients/ClientsPage';
import ClientDetailPage from '../pages/Clients/ClientDetailPage';
import TasksPage from '../pages/Tasks/TasksPage';
import KanbanPage from '../pages/Tasks/KanbanPage';
import CalendarPage from '../pages/Calendar/CalendarPage';
import InvoicesPage from '../pages/Invoices/InvoicesPage';
import TimeTrackerPage from '../pages/TimeTracker/TimeTrackerPage';
import ReportsPage from '../pages/Reports/ReportsPage';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Private routes with layout */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/cases" element={
        <PrivateRoute>
          <MainLayout>
            <CasesPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/cases/:id" element={
        <PrivateRoute>
          <MainLayout>
            <CaseDetailPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/clients" element={
        <PrivateRoute>
          <MainLayout>
            <ClientsPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/clients/:id" element={
        <PrivateRoute>
          <MainLayout>
            <ClientDetailPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/tasks" element={
        <PrivateRoute>
          <MainLayout>
            <TasksPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/kanban" element={
        <PrivateRoute>
          <MainLayout>
            <KanbanPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/calendar" element={
        <PrivateRoute>
          <MainLayout>
            <CalendarPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/invoices" element={
        <PrivateRoute>
          <MainLayout>
            <InvoicesPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/time-tracker" element={
        <PrivateRoute>
          <MainLayout>
            <TimeTrackerPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/reports" element={
        <PrivateRoute>
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        </PrivateRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;