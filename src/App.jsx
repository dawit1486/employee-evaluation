import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import EvaluatorDashboard from './pages/EvaluatorDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import EvaluationForm from './pages/EvaluationForm';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      evaluator: '/evaluator-dashboard',
      employee: '/employee-dashboard',
      hr: '/hr-dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  const getDashboardRoute = (userRole) => {
    const dashboardMap = {
      evaluator: '/evaluator-dashboard',
      employee: '/employee-dashboard',
      hr: '/hr-dashboard'
    };
    return dashboardMap[userRole] || '/login';
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getDashboardRoute(user.role)} replace /> : <LoginPage />}
      />

      <Route
        path="/evaluator-dashboard"
        element={
          <ProtectedRoute allowedRoles={['evaluator']}>
            <EvaluatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr-dashboard"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/evaluation/:id"
        element={
          <ProtectedRoute>
            <EvaluationForm />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}