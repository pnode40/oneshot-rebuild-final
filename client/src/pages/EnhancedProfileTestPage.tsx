import React, { useState } from 'react';
import EnhancedProfileEditor from '../components/EnhancedProfileEditor';
import EnhancedProfilePreview from '../components/EnhancedProfilePreview';
import { TestAuthProvider } from '../context/TestAuthContext';
import { FaToggleOn, FaToggleOff, FaMobile, FaDesktop } from 'react-icons/fa';

// Use the interface from ProfileData and extend it
interface EnhancedProfileData {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  customUrlSlug?: string;
  
  // Athletic info
  highSchool: string;
  position: string;
  gradYear?: string;
  gpa?: string;
  
  // Physical stats
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  
  // Performance
  fortyYardDash?: string;
  benchPressMax?: string;
  verticalLeap?: string;
  shuttleRun?: string;
  
  // Content
  bio?: string;
  profileImageUrl?: string;
  
  // Visibility controls
  isHeightVisible?: boolean;
  isWeightVisible?: boolean;
  isGpaVisible?: boolean;
  isTranscriptVisible?: boolean;
  
  // Media uploads
  mockUploads?: { 
    [key: string]: { 
      name: string; 
      type: string; 
      url?: string; 
      previewUrl?: string;
    } 
  };
}

const EnhancedProfileTestPage: React.FC = () => {
  // Sample profile data
  const [profileData, setProfileData] = useState<EnhancedProfileData>({
    fullName: 'Marcus Johnson',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@example.com',
    phoneNumber: '(555) 123-4567',
    dateOfBirth: '2005-08-15',
    city: 'Austin',
    state: 'TX',
    customUrlSlug: 'marcus-johnson-qb',
    
    // Athletic info
    highSchool: 'Central High School',
    position: 'Quarterback',
    gradYear: '2025',
    gpa: '3.8',
    
    // Physical stats
    heightFt: '6',
    heightIn: '2',
    weight: '185',
    
    // Performance
    fortyYardDash: '4.6',
    benchPressMax: '225',
    verticalLeap: '32',
    shuttleRun: '4.2',
    
    // Content
    bio: 'Passionate quarterback with strong leadership skills and a 3-year varsity record. Known for precision passing and quick decision-making under pressure. Team captain for two consecutive years. Committed to academic excellence while pursuing athletic goals.',
    
    // Visibility controls
    isHeightVisible: true,
    isWeightVisible: true,
    isGpaVisible: true,
    isTranscriptVisible: true,
    
    // Mock uploads
    mockUploads: {
      video: {
        name: 'highlight-reel-2024.mp4',
        type: 'video/mp4',
        url: '/mock/videos/highlight-reel-2024.mp4'
      },
      transcript: {
        name: 'academic-transcript.pdf',
        type: 'application/pdf',
        url: '/mock/documents/academic-transcript.pdf'
      }
    }
  });

  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isMobilePreview, setIsMobilePreview] = useState(true);

  const handleProfileChange = (changes: Partial<EnhancedProfileData>) => {
    setProfileData(prev => ({ ...prev, ...changes }));
  };

  const handleSave = (profileId: string) => {
    console.log('Profile saved with ID:', profileId);
    alert('Profile saved successfully! 🎉');
  };

  return (
    <TestAuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enhanced Profile System</h1>
                <p className="text-sm text-gray-600">Priority #1: Complete Athlete Profile Editor</p>
              </div>
              
              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('editor')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'editor' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'split' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                {/* Mobile/Desktop Preview Toggle */}
                <button
                  onClick={() => setIsMobilePreview(!isMobilePreview)}
                  className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  {isMobilePreview ? <FaMobile className="w-4 h-4" /> : <FaDesktop className="w-4 h-4" />}
                  <span className="text-sm">{isMobilePreview ? 'Mobile' : 'Desktop'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Feature Status */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Priority #1 Features Implemented</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Real-time slug availability checking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Enhanced form validation & UX</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Mobile-first responsive design</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Comprehensive athlete profiles schema</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Granular visibility controls</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Enhanced media upload integration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className={`grid gap-8 ${
            viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
          }`}>
            {/* Editor */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Internal Profile Editor</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Live Updates
                  </span>
                </div>
                <EnhancedProfileEditor
                  profileData={profileData}
                  onChange={handleProfileChange}
                  onSave={handleSave}
                />
              </div>
            )}

            {/* Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Public Recruiter View</h2>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Real-time Preview
                    </span>
                    {isMobilePreview ? (
                      <FaMobile className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FaDesktop className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
                
                <div className={`${
                  isMobilePreview 
                    ? 'max-w-md mx-auto' 
                    : 'max-w-2xl mx-auto'
                } ${
                  viewMode === 'preview' ? 'mt-8' : ''
                }`}>
                  <EnhancedProfilePreview
                    profileData={profileData}
                    isPublicView={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Development Notes */}
          <div className="mt-12 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Development Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Technical Implementation:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Debounced slug validation (500ms delay)</li>
                  <li>• Enhanced TypeScript interfaces</li>
                  <li>• Modular component architecture</li>
                  <li>• Mobile-first Tailwind CSS design</li>
                  <li>• Real-time form state management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Next Phase - Public Recruiter View:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• OG image generation for social sharing</li>
                  <li>• Enhanced public profile page routing</li>
                  <li>• Performance optimization & lazy loading</li>
                  <li>• Advanced media validation & processing</li>
                  <li>• Social sharing integration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sample Profile Data */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📊 Sample Profile Data</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Current profile demonstrates all features with realistic athlete data:
            </p>
            <div className="text-xs text-yellow-600 font-mono bg-yellow-100 p-2 rounded overflow-x-auto">
              URL: oneshot.dev/profile/{profileData.customUrlSlug} | 
              Height: {profileData.heightFt}'{profileData.heightIn}" | 
              40-yard: {profileData.fortyYardDash}s | 
              GPA: {profileData.gpa}
            </div>
          </div>
        </div>
      </div>
    </TestAuthProvider>
  );
};

export default EnhancedProfileTestPage; 