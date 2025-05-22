import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { saveProfile, uploadFile } from '../services/api';
import { ProfileData } from '../types';
import { FaPencilAlt, FaLock, FaCamera, FaVideo, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';

// Define the profile type returned from the API
interface Profile extends ProfileData {
  id: number;
  createdAt: string;
}

interface Props {
  profileData: ProfileData;
  onChange: (data: Partial<ProfileData>) => void;
}

// Input field label with pencil icon
const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
    <span>{children}</span>
    <FaPencilAlt className="h-3 w-3 text-gray-400" />
  </label>
);

// Read-only field label with lock icon
const ReadOnlyLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
    <span>{children}</span>
    <FaLock className="h-3 w-3 text-gray-400" />
  </label>
);

const ProfileInfoForm: React.FC<Props> = ({ profileData, onChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { user } = useAuth();
  const currentPhotoObjectUrlRef = useRef<string | null>(null);
  const currentVideoObjectUrlRef = useRef<string | null>(null);

  const isTestModeActive = () => localStorage.getItem('oneshot_test_mode') === 'true';

  useEffect(() => {
    // Cleanup function for when the component unmounts
    return () => {
      if (currentPhotoObjectUrlRef.current) {
        URL.revokeObjectURL(currentPhotoObjectUrlRef.current);
        currentPhotoObjectUrlRef.current = null;
      }
      if (currentVideoObjectUrlRef.current) {
        URL.revokeObjectURL(currentVideoObjectUrlRef.current);
        currentVideoObjectUrlRef.current = null;
      }
    };
  }, []);

  // Pre-populate form with user data - adjusted from previous version to match one from earlier successful state
  useEffect(() => {
    if (!isTestModeActive() && user) {
      if (!profileData.fullName && user.firstName) {
        const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
        if (fullName) {
          onChange({ fullName });
          setDebugInfo(`NORMAL MODE: Pre-filled name from user account: ${fullName}`);
        }
      }
      if (!profileData.email && user.email) {
        onChange({ email: user.email });
      }
    }
  }, [user, onChange, profileData.fullName, profileData.email]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.') as [keyof ProfileData, string];
      onChange({
        [outerKey]: {
          ...(profileData[outerKey] as any), // Type assertion might be needed
          [innerKey]: value,
        },
      });
    } else {
      onChange({ [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredStringFields: (keyof ProfileData)[] = ['fullName', 'email', 'highSchool', 'position'];
    requiredStringFields.forEach((field) => {
      const value = profileData[field];
      if (typeof value === 'string') {
        if (!value.trim()) {
          newErrors[field as string] = `${field.toString()} is required`;
        }
      } else if (value === undefined || value === null) {
        newErrors[field as string] = `${field.toString()} is required`;
      }
    });
    if (profileData.email && typeof profileData.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    const numberFields: (keyof ProfileData)[] = ['heightFt', 'heightIn', 'weight', 'fortyYardDash', 'benchPress', 'gradYear'];
    numberFields.forEach((field) => {
      const value = profileData[field];
      if (value !== undefined && value !== null && value !== '' && typeof value === 'string' && isNaN(Number(value))) {
        newErrors[field as string] = 'Must be a valid number';
      } else if (typeof value === 'number' && isNaN(value)) {
        newErrors[field as string] = 'Must be a valid number';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testApiConnection = async () => {
    try {
      setDebugInfo('Testing API connection...');
      const response = await fetch('http://localhost:3001/api/debug/health');
      const data = await response.json();
      setDebugInfo(`Server connection OK: ${JSON.stringify(data)}`);
      console.log('Server health check:', data);
    } catch (error) {
      setDebugInfo(`Server connection FAILED: ${error}`);
      console.error('Server connection test failed:', error);
    }
  };

  const testDbConnection = async () => {
    try {
      setDebugInfo('Testing database connection...');
      const response = await fetch('http://localhost:3001/api/debug/db');
      const data = await response.json();
      setDebugInfo(`Database connection OK: ${data.profiles} profiles found`);
      console.log('Database check:', data);
    } catch (error) {
      setDebugInfo(`Database connection FAILED: ${error}`);
      console.error('Database connection test failed:', error);
    }
  };

  // Profile Photo Handler (taken from a previously working version for consistency)
  const handleProfilePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingPhoto(true);
      setDebugInfo(`Uploading profile photo: ${file.name}...`);

      if (currentPhotoObjectUrlRef.current) {
        URL.revokeObjectURL(currentPhotoObjectUrlRef.current);
      }
      const tempPreviewUrl = URL.createObjectURL(file); // This is for immediate preview
      currentPhotoObjectUrlRef.current = tempPreviewUrl;

      try {
        const { response, data: responseData } = await uploadFile(file, 'profilePhoto');
        if (response.ok && responseData.success) {
          setDebugInfo(`Profile photo mock processed. Preview URL: ${tempPreviewUrl}, Stored mock path: ${responseData.data.url}`);
          
          onChange({
            profileImageUrl: tempPreviewUrl, // Use blob for live preview
            mockUploads: {
              ...(profileData.mockUploads || {}),
              profilePhoto: { 
                name: file.name, 
                type: file.type, 
                url: responseData.data.url, // Store mock path from API response
              }
            }
          });
          alert('Profile photo uploaded successfully (mocked)!');
        } else {
          const errorMessage = responseData?.message || response.statusText || 'Upload failed';
          setDebugInfo(`Error uploading photo: ${errorMessage}`);
          alert(`Failed to upload photo: ${errorMessage}`);
          // Clear the live preview if upload fails
          onChange({ profileImageUrl: undefined }); 
          if (currentPhotoObjectUrlRef.current) {
            URL.revokeObjectURL(currentPhotoObjectUrlRef.current);
            currentPhotoObjectUrlRef.current = null;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setDebugInfo(`Exception during photo upload: ${errorMessage}`);
        alert('An error occurred during photo upload.');
        // Clear the live preview on exception
        onChange({ profileImageUrl: undefined }); 
        if (currentPhotoObjectUrlRef.current) {
          URL.revokeObjectURL(currentPhotoObjectUrlRef.current);
          currentPhotoObjectUrlRef.current = null;
        }
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleGenericFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    fileType: string, 
    setUploadingState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingState(true);
      setDebugInfo(`Uploading ${fileType}: ${file.name}...`);

      let tempPreviewUrl: string | undefined = undefined;
      const currentUploads = profileData.mockUploads || {};
      const existingFileData = currentUploads[fileType] || {};

      if (fileType === 'videoMain') {
        if (currentVideoObjectUrlRef.current) {
          URL.revokeObjectURL(currentVideoObjectUrlRef.current);
        }
        tempPreviewUrl = URL.createObjectURL(file);
        currentVideoObjectUrlRef.current = tempPreviewUrl;
        onChange({
          mockUploads: {
            ...currentUploads,
            [fileType]: {
              ...existingFileData,
              name: file.name,
              type: file.type,
              previewUrl: tempPreviewUrl,
            },
          },
        });
      }

      try {
        const { response, data: responseData } = await uploadFile(file, fileType);
        if (response.ok && responseData.success) {
          setDebugInfo(`${fileType} uploaded to mock URL: ${responseData.data.url}`);
          onChange({
            mockUploads: {
              ...currentUploads,
              [fileType]: {
                ...existingFileData,
                name: file.name,
                type: file.type,
                previewUrl: fileType === 'videoMain' ? tempPreviewUrl : undefined, // Keep if video
                url: responseData.data.url, // Persistent mock URL
              },
            },
          });
          alert(`${fileType.replace('PDF', '').replace('Main', '')} uploaded successfully (mocked)!`);
        } else {
          const errorMessage = responseData?.message || response.statusText || 'Upload failed';
          setDebugInfo(`Error uploading ${fileType}: ${errorMessage}`);
          alert(`Failed to upload ${fileType.replace('PDF', '').replace('Main', '')}: ${errorMessage}`);
          if (fileType === 'videoMain' && currentVideoObjectUrlRef.current) {
            URL.revokeObjectURL(currentVideoObjectUrlRef.current);
            currentVideoObjectUrlRef.current = null;
            onChange({
              mockUploads: { ...currentUploads, [fileType]: { ...existingFileData, previewUrl: undefined } }
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setDebugInfo(`Exception during ${fileType} upload: ${errorMessage}`);
        alert(`An error occurred during ${fileType.replace('PDF', '').replace('Main', '')} upload.`);
        if (fileType === 'videoMain' && currentVideoObjectUrlRef.current) {
          URL.revokeObjectURL(currentVideoObjectUrlRef.current);
          currentVideoObjectUrlRef.current = null;
          onChange({
            mockUploads: { ...currentUploads, [fileType]: { ...existingFileData, previewUrl: undefined } }
          });
        }
      } finally {
        setUploadingState(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setDebugInfo('Form validation failed. Please check errors.');
      return;
    }
    setIsSubmitting(true);
    setDebugInfo('Submitting profile data...');
    try {
      const { response, data } = await saveProfile(profileData);
      if (response.ok && data.success) {
        setSavedProfile(data.data as Profile);
        setDebugInfo('Profile saved successfully!');
        alert('Profile saved successfully!');
        // Optionally clear form or navigate away
      } else {
        setDebugInfo(`Error saving profile: ${data.message || 'Unknown error'}`);
        alert(`Error saving profile: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDebugInfo(`Exception saving profile: ${message}`);
      alert('An error occurred while saving the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to create input fields
  const renderInputField = (name: string, label: string, type: string = 'text', placeholder?: string, isReadOnly: boolean = false) => {
    const keys = name.split('.');
    let fieldValue: any = profileData;
    for (const key of keys) {
      fieldValue = fieldValue ? fieldValue[key] : undefined;
    }
    fieldValue = fieldValue || '';

    return (
      <div className="mb-4">
        {isReadOnly ? <ReadOnlyLabel>{label}</ReadOnlyLabel> : <InputLabel>{label}</InputLabel>}
        <input
          type={type}
          name={name}
          id={name}
          value={fieldValue}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
      </div>
    );
  };

  const renderTextareaField = (name: keyof ProfileData, label: string, placeholder?: string) => (
    <div className="mb-4">
      <InputLabel>{label}</InputLabel>
      <textarea
        name={name}
        id={name}
        value={(profileData[name] as string) || ''} // Cast to string for textarea
        onChange={handleChange} // Use the updated handleChange for textareas too
        placeholder={placeholder}
        rows={4}
        className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Athlete Profile Information</h2>

      {/* Personal Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInputField('fullName', 'Full Name', 'text', 'Enter full name')}
        {renderInputField('email', 'Email', 'email', 'Enter email address', true)}
      </div>
      <p className="text-xs text-gray-500 -mt-2 mb-4">Email address is linked to your account and cannot be changed here.</p>

      {/* Athletic Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInputField('highSchool', 'High School', 'text', 'e.g., Central High')}
        {renderInputField('position', 'Position', 'text', 'e.g., Quarterback')}
        {renderInputField('gradYear', 'Graduation Year', 'text', 'e.g., 2025')}
        {renderInputField('cityState', 'City, State', 'text', 'e.g., Austin, TX')}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {renderInputField('heightFt', 'Height (ft)', 'text', 'e.g., 6')}
        {renderInputField('heightIn', 'Height (in)', 'text', 'e.g., 2')}
        {renderInputField('weight', 'Weight (lbs)', 'text', 'e.g., 185')}
        {renderInputField('fortyYardDash', '40-Yard Dash', 'text', 'e.g., 4.6')}
      </div>
      {renderInputField('benchPress', 'Bench Press (lbs)', 'text', 'e.g., 225')}

      {/* Bio and Social Media Section */}
      {renderTextareaField('bio', 'Bio / Personal Statement', 'Tell us about yourself, your goals, etc.')}
      
      <h3 className="text-lg font-medium text-gray-700 pt-4 border-t border-gray-200 mt-6">Social Media Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderInputField('socialMediaLinks.twitter', 'Twitter Handle', 'text', 'e.g., @username')}
        {renderInputField('socialMediaLinks.instagram', 'Instagram Handle', 'text', 'e.g., username')}
        {renderInputField('socialMediaLinks.hudl', 'Hudl Profile URL', 'text', 'e.g., hudl.com/profile/yourid')}
      </div>

      {/* Coach Information Section */}
      <h3 className="text-lg font-medium text-gray-700 pt-4 border-t border-gray-200 mt-6">Coach Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInputField('coachName', 'Coach Full Name', 'text', 'e.g., John Doe')}
        {renderInputField('coachEmail', 'Coach Email', 'email', 'e.g., coach.doe@example.com')}
        {renderInputField('coachPhone', 'Coach Phone', 'tel', 'e.g., 555-123-4567')}
        {renderInputField('coachTitle', 'Coach Title', 'text', 'e.g., Head Coach')}
      </div>

      {/* File Uploads Section */}
      <h3 className="text-lg font-medium text-gray-700 pt-4 border-t border-gray-200 mt-6">File Uploads</h3>
      
      {/* Profile Photo Upload */}
      <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-md">
        <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-2">
          <FaCamera className="inline mr-2 text-gray-500" /> Profile Photo (.jpg, .png, .gif)
        </label>
        <input
          type="file"
          id="profilePhoto"
          name="profilePhoto"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleProfilePhotoChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {isUploadingPhoto && <p className="mt-1 text-xs text-blue-500">Uploading photo...</p>}
        {profileData.profileImageUrl && profileData.profileImageUrl.startsWith('blob:') && (
          <div className="mt-2">
            <img src={profileData.profileImageUrl} alt="Profile Preview" className="h-24 w-24 rounded-full object-cover" />
            <p className="text-xs text-gray-500">Current photo preview</p>
          </div>
        )}
        {profileData.mockUploads?.profilePhoto?.url && !profileData.profileImageUrl?.startsWith('blob:') && (
           <p className="mt-1 text-xs text-gray-500">
             Stored photo: {profileData.mockUploads.profilePhoto.name} (URL: {profileData.mockUploads.profilePhoto.url})
           </p>
        )}
      </div>

      {/* Main Video Upload */}
      <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-md">
        <label htmlFor="videoMain" className="block text-sm font-medium text-gray-700 mb-2">
          <FaVideo className="inline mr-2 text-gray-500" /> Main Highlight Video (.mp4, .mov)
        </label>
        <input
          type="file"
          id="videoMain"
          name="videoMain"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={(e) => handleGenericFileUpload(e, 'videoMain', setIsUploadingVideo)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {isUploadingVideo && <p className="mt-1 text-xs text-blue-500">Uploading video...</p>}
        {profileData.mockUploads?.videoMain?.previewUrl && (
          <div className="mt-2">
            <video src={profileData.mockUploads.videoMain.previewUrl} controls className="max-w-xs rounded"></video>
            <p className="text-xs text-gray-500">Video preview: {profileData.mockUploads.videoMain.name}</p>
          </div>
        )}
         {profileData.mockUploads?.videoMain?.url && !profileData.mockUploads?.videoMain?.previewUrl && (
           <p className="mt-1 text-xs text-gray-500">
             Stored video: {profileData.mockUploads.videoMain.name} (URL: {profileData.mockUploads.videoMain.url})
           </p>
        )}
      </div>

      {/* Transcript PDF Upload */}
      <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-md">
        <label htmlFor="transcriptPDF" className="block text-sm font-medium text-gray-700 mb-2">
          <FaFilePdf className="inline mr-2 text-gray-500" /> Transcript (.pdf)
        </label>
        <input
          type="file"
          id="transcriptPDF"
          name="transcriptPDF"
          accept="application/pdf"
          onChange={(e) => handleGenericFileUpload(e, 'transcriptPDF', setIsUploadingTranscript)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {isUploadingTranscript && <p className="mt-1 text-xs text-blue-500">Uploading transcript...</p>}
        {profileData.mockUploads?.transcriptPDF?.name && (
           <p className="mt-1 text-xs text-gray-500">
             Mock transcript: {profileData.mockUploads.transcriptPDF.name} 
             (Stored URL: {profileData.mockUploads.transcriptPDF.url})
           </p>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting || isUploadingPhoto || isUploadingVideo || isUploadingTranscript}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>

      {/* Debug Tools - Kept as per existing structure from file preview */}
      {isTestModeActive() && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
          <h3 className="text-md font-semibold text-yellow-700 mb-3 text-center">Debug Tools</h3>
          <div className="flex space-x-2 mb-3">
            <button type="button" onClick={() => setDebugInfo(JSON.stringify(profileData, null, 2))} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1 px-2 rounded">Log Form Data</button>
            <button type="button" onClick={testApiConnection} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1 px-2 rounded">Test API Connection</button>
            <button type="button" onClick={testDbConnection} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1 px-2 rounded">Test DB Connection</button>
          </div>
          {debugInfo && (
            <div className="mt-2 p-2 bg-gray-50 text-xs text-gray-600 border border-gray-200 rounded max-h-32 overflow-y-auto">
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      )}

      {savedProfile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-md text-xs text-green-700">
          <p><strong>Saved Profile Details (from API response):</strong></p>
          <p>ID: {savedProfile.id}</p>
          <p>Name: {savedProfile.fullName}</p>
          <p>Email: {savedProfile.email}</p>
          <p>Created At: {new Date(savedProfile.createdAt).toLocaleString()}</p>
        </div>
      )}
    </form>
  );
};

export default ProfileInfoForm; 