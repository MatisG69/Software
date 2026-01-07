import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';

// Pages publiques
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Pages candidats
import { CandidateDashboard } from './pages/candidate/Dashboard';
import { CandidateJobs } from './pages/candidate/Jobs';
import { JobDetail } from './pages/candidate/JobDetail';
import { CandidateApplications } from './pages/candidate/Applications';
import { CandidateMessages } from './pages/candidate/Messages';
import { CandidateNotifications } from './pages/candidate/Notifications';
import { CandidateProfile } from './pages/candidate/Profile';
import { Verification } from './pages/candidate/Verification';
import { DecisionDNATest } from './pages/candidate/DecisionDNATest';

// Pages entreprises
import { CompanyDashboard } from './pages/company/Dashboard';
import { CompanyJobs } from './pages/company/Jobs';
import { CompanyJobForm } from './pages/company/JobForm';
import { CompanyApplications } from './pages/company/Applications';
import { CompanyMessages } from './pages/company/Messages';
import { CompanyProfile } from './pages/company/Profile';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Précharger les ressources essentielles
    const preloadResources = async () => {
      // Simuler un temps de chargement minimum pour l'animation
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    preloadResources();
  }, []);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes candidats */}
          <Route
            path="/candidate/verification"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Verification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/messages"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/notifications"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/decision-dna/:id"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DecisionDNATest />
              </ProtectedRoute>
            }
          />

          {/* Routes entreprises */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyJobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyJobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/applications"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/messages"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
