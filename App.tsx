import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { Users } from './pages/Users';
import { Auth } from './pages/Auth';
import { Finance } from './pages/Finance';
import { Profile } from './pages/Profile';
import { UserRole } from './types';
import { apiClient } from './api/client';
import { userService } from './api/services';

function AppRoutes() {
  const { user, loadUserData } = useAppStore();

  // Check for existing token on mount
  useEffect(() => {
    const token = apiClient.getToken();
    if (token && !user) {
      // Try to load user data if token exists
      loadUserData().catch(() => {
        // If token is invalid, clear it
        apiClient.setToken(null);
      });
    }
  }, [user, loadUserData]);

  return (
    <Routes>
      {/* Auth Route */}
      <Route 
        path="/auth" 
        element={!user ? <Auth /> : <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/client/dashboard'} replace />} 
      />

      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/client/dashboard'} replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="project/:id" element={<ProjectDetails />} />
                <Route path="users" element={<Users />} />
                <Route path="finance" element={<Finance />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="new-project" element={<NewProject />} />
                <Route path="project/:id" element={<ProjectDetails />} />
                <Route path="finance" element={<Finance />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to auth */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
