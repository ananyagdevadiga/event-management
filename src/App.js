import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import CreateEditEvent from './pages/CreateEditEvent';
import AdminRegistrations from './pages/AdminRegistrations';
import MyRegistrations from './pages/MyRegistrations';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const RedirectByRole = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading EventSphere...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/"
        element={user ? <RedirectByRole /> : <Login />}
      />

      {/* Role-based redirect */}
      <Route
        path="/redirect"
        element={
          <ProtectedRoute>
            <RedirectByRole />
          </ProtectedRoute>
        }
      />

      {/* User routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute requiredRole="user">
            <MyRegistrations />
          </ProtectedRoute>
        }
      />

      {/* Shared route: event details (both user and admin) */}
      <Route
        path="/event/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create"
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateEditEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit/:id"
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateEditEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/registrations"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminRegistrations />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
