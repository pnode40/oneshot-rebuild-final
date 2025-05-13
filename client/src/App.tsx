import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileInfoForm from './components/ProfileInfoForm';
import ProfilePreview from './components/ProfilePreview';
import PublicProfilePage from './components/PublicProfilePage';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { TestAuthProvider } from './context/TestAuthContext';
import './App.css';

// Create a client
const queryClient = new QueryClient();

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

// Check if app should run in test mode
const isTestMode = () => {
  // In browser, look for ?test=true in URL
  return typeof window !== 'undefined' && 
    (window.location.search.includes('test=true') || localStorage.getItem('oneshot_test_mode') === 'true');
};

// App container that chooses between real or test authentication
const AppAuthContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const testMode = searchParams.get('test') === 'true';
  
  // Save test mode preference to localStorage
  useEffect(() => {
    if (testMode) {
      localStorage.setItem('oneshot_test_mode', 'true');
    }
  }, [testMode]);

  // Get test mode status from localStorage too
  const useTestMode = testMode || localStorage.getItem('oneshot_test_mode') === 'true';

  // Show test mode indicator
  useEffect(() => {
    if (useTestMode) {
      const testBanner = document.createElement('div');
      testBanner.style.position = 'fixed';
      testBanner.style.bottom = '0';
      testBanner.style.right = '0';
      testBanner.style.background = 'rgba(79, 70, 229, 0.9)';
      testBanner.style.color = 'white';
      testBanner.style.padding = '4px 10px';
      testBanner.style.borderTopLeftRadius = '6px';
      testBanner.style.fontSize = '12px';
      testBanner.style.zIndex = '9999';
      testBanner.textContent = '🧪 Test Mode';
      
      document.body.appendChild(testBanner);
      
      return () => {
        document.body.removeChild(testBanner);
      };
    }
  }, [useTestMode]);

  return useTestMode ? (
    <TestAuthProvider>
      <AppContent testMode={true} />
    </TestAuthProvider>
  ) : (
    <AuthProvider>
      <AppContent testMode={false} />
    </AuthProvider>
  );
};

const AppContent: React.FC<{ testMode: boolean }> = ({ testMode }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: testMode ? 'Test User' : '',
    email: testMode ? 'test@example.com' : '',
    highSchool: testMode ? 'Central High' : '',
    position: testMode ? 'Quarterback' : '',
    gradYear: testMode ? '2025' : '',
    cityState: testMode ? 'Austin, TX' : '',
    heightFt: testMode ? '6' : '',
    heightIn: testMode ? '2' : '',
    weight: testMode ? '185' : '',
    fortyYardDash: testMode ? '4.6' : '',
    benchPress: testMode ? '225' : '',
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
        
        {/* Public profile route */}
        <Route path="/profile/:slug" element={<PublicProfilePage />} />
        
        {/* Original test component route */}
        <Route 
          path="/test-profile" 
          element={
            <TestAuthProvider>
              <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Profile Form Test Page</h1>
                <p className="mb-4 text-gray-600">This page lets you test the ProfileInfoForm component directly, with mock authentication.</p>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <ProfileInfoForm
                      profileData={{
                        fullName: 'Test User',
                        email: 'test@example.com',
                        highSchool: 'Central High',
                        position: 'Quarterback',
                        gradYear: '2025',
                        cityState: 'Austin, TX',
                        heightFt: '6',
                        heightIn: '2',
                        weight: '185',
                        fortyYardDash: '4.6',
                        benchPress: '225'
                      }}
                      onChange={(changes) => console.log('Form changes:', changes)}
                    />
                  </div>
                  <div className="md:w-1/2 bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Developer Notes</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Changes to the form will be logged to the console (F12)</li>
                      <li>This route uses a <code className="bg-gray-100 px-1 rounded">TestAuthProvider</code> for mock authentication</li>
                      <li>Bookmark <code className="bg-gray-100 px-1 rounded">http://localhost:5173/test-profile</code> for quick access</li>
                      <li>Edit this component in <code className="bg-gray-100 px-1 rounded">src/components/ProfileInfoForm.tsx</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </TestAuthProvider>
          } 
        />
        
        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppAuthContainer />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
