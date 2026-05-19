import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ScrollToTop from 'components/ScrollToTop';
import ErrorBoundary from 'components/ErrorBoundary';
import ProtectedRoute from 'components/ProtectedRoute';
import NotFound from 'pages/NotFound';
import AuthCallback from 'pages/AuthCallback';
import ProjectManagement from './pages/project-management';
import HomeDashboard from './pages/home-dashboard';
import TeamWorkspace from './pages/team-workspace';
import Login from './pages/login';
import Register from './pages/register';
import LeadClientFlow from './pages/lead-client-flow';
import ClientProfile from './pages/client-profile';
import CommunicationHub from './pages/communication-hub';
import ClientMessaging from './pages/client-messaging';
import ClientCRM from './pages/client-crm';
import SettingsConfiguration from './pages/settings-configuration';
import TenantSignup from './pages/tenant-signup';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tenant-signup" element={<TenantSignup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
          <Route path="/home-dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
          <Route path="/project-management" element={<ProtectedRoute><ProjectManagement /></ProtectedRoute>} />
          <Route path="/team-workspace" element={<ProtectedRoute><TeamWorkspace /></ProtectedRoute>} />
          <Route path="/lead-client-flow" element={<ProtectedRoute><LeadClientFlow /></ProtectedRoute>} />
          <Route path="/client-profile" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
          <Route path="/communication-hub" element={<ProtectedRoute><CommunicationHub /></ProtectedRoute>} />
          <Route path="/client-messaging" element={<ProtectedRoute><ClientMessaging /></ProtectedRoute>} />
          <Route path="/client-crm" element={<ProtectedRoute><ClientCRM /></ProtectedRoute>} />
          <Route path="/settings-configuration" element={<ProtectedRoute><SettingsConfiguration /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
