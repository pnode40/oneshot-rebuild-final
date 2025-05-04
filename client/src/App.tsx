import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import ProfileInfoForm from './components/ProfileInfoForm';
import ProfilePreview from './components/ProfilePreview';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import './App.css';

// Define the shape of the profile data
export interface ProfileData {
  fullName: string;
  email: string;
  highSchool: string;
  position: string;
  gradYear: string;
  cityState: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  fortyYardDash: string;
  benchPress: string;
}

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-40">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login...");
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Public route component that redirects authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-40">Loading...</div>;
  }
  
  if (isAuthenticated) {
    console.log("User already authenticated, redirecting to home...");
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// 404 Not Found component
const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">The page you are looking for doesn't exist.</p>
      <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
    </div>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    highSchool: '',
    position: '',
    gradYear: '',
    cityState: '',
    heightFt: '',
    heightIn: '',
    weight: '',
    fortyYardDash: '',
    benchPress: '',
  });

  const handleProfileChange = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const handleAuthSuccess = () => {
    console.log("Authentication success callback triggered, redirecting to home page...");
    navigate('/');
  };

  return (
    <Layout>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login onSuccess={handleAuthSuccess} />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register onSuccess={handleAuthSuccess} />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <ProfileInfoForm
                    profileData={profileData}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="md:w-1/2">
                  <ProfilePreview profileData={profileData} />
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Redirect /home to / */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
