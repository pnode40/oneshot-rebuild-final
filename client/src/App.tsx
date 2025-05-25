import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileInfoForm from './components/ProfileInfoForm';
import ProfilePreview from './components/ProfilePreview';
import PublicProfilePage from './pages/PublicProfilePage';
import EnhancedProfileTestPage from './pages/EnhancedProfileTestPage';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { TestAuthProvider } from './context/TestAuthContext';
import { ProfileData } from './types'; // Import shared type
import './App.css';

// Create a client
const queryClient = new QueryClient();

// // Define the shape of the profile data - REMOVED, NOW IMPORTED
// export interface ProfileData {
//   fullName: string;
//   email: string;
//   highSchool: string;
//   position: string;
//   gradYear: string;
//   cityState: string;
//   heightFt: string;
//   heightIn: string;
//   weight: string;
//   fortyYardDash: string;
//   benchPress: string;
//   mockUploads?: { [key: string]: { name: string; type: string; url?: string } }; // For Phase 2
// }

const TEST_MODE_PROFILE_DATA_KEY = 'oneShot_testMode_profileData';

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
  // Prioritize URL param to activate, then check localStorage
  const urlTestMode = searchParams.get('test') === 'true';
  const localStorageTestMode = localStorage.getItem('oneshot_test_mode') === 'true';

  useEffect(() => {
    if (urlTestMode) {
      localStorage.setItem('oneshot_test_mode', 'true');
    }
  }, [urlTestMode]);

  const useTestMode = urlTestMode || localStorageTestMode;

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
      testBanner.textContent = '�� Test Mode';
      
      document.body.appendChild(testBanner);
      
      return () => {
        if (document.body.contains(testBanner)) {
            document.body.removeChild(testBanner);
        }
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
  
  const initialDefaultMockData: ProfileData = {
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
    benchPress: '225',
    bio: 'This is a test bio for the mock user. Passionate about the game and always looking to improve.',
    socialMediaLinks: {
      twitter: '@testuser_oneshot',
      instagram: 'testuser_oneshot',
      hudl: 'hudl.com/profile/testuser'
    },
    // profileImageUrl is intentionally undefined for test mode
    // This ensures that after a refresh, it won't override the null/undefined state
    // that indicates no active blob URL is available
    profileImageUrl: undefined,
    bannerImageUrl: 'https://via.placeholder.com/600x200/4B5563/ffffff?Text=OneShot+Banner', // Placeholder banner
    mockUploads: {},
    // Coach Info for Mock Data
    coachName: 'Coach John Doe',
    coachEmail: 'coach.doe@example.com',
    coachPhone: '555-123-4567',
    coachTitle: 'Head Coach'
  };

  const [profileData, setProfileData] = useState<ProfileData>(() => {
    if (testMode) {
      const storedData = localStorage.getItem(TEST_MODE_PROFILE_DATA_KEY);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          return { ...initialDefaultMockData, ...parsedData }; 
        } catch (e) {
          console.error("Failed to parse test mode profile data from localStorage", e);
          return initialDefaultMockData;
        }
      }
      return initialDefaultMockData;
    }
    // Default for non-test mode, ensuring all fields from ProfileData are initialized
    return { 
      fullName: '', email: '', highSchool: '', position: '', gradYear: '', 
      cityState: '', heightFt: '', heightIn: '', weight: '', fortyYardDash: '', benchPress: '', 
      bio: '', socialMediaLinks: {}, profileImageUrl: '', bannerImageUrl: '', mockUploads: {},
      // Initialize coach fields for non-test mode too
      coachName: '', coachEmail: '', coachPhone: '', coachTitle: ''
    };
  });

  const handleProfileChange = (data: Partial<ProfileData>) => {
    setProfileData(prev => {
      const newData = { ...prev, ...data };
      if (testMode) {
        localStorage.setItem(TEST_MODE_PROFILE_DATA_KEY, JSON.stringify(newData));
      }
      return newData;
    });
  };

  const handleAuthSuccess = () => {
    console.log("Authentication success callback triggered, redirecting to home page...");
    // In test mode, profileData should already be loaded from localStorage or defaults
    // If not in test mode, actual user data would come from AuthProvider
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
        
        {/* Enhanced Profile Test Page - Priority #1 Features */}
        <Route path="/enhanced-profile-test" element={<EnhancedProfileTestPage />} />
        
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
