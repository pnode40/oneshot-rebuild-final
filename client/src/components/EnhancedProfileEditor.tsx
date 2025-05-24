import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';
import { ProfileData } from '../types';
import { useAuth } from '../context/useAuth';
import { saveProfile, uploadFile } from '../services/api';
import { 
  FaPencilAlt, 
  FaLock, 
  FaCamera, 
  FaVideo, 
  FaFilePdf, 
  FaCheck, 
  FaTimes, 
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaShareAlt
} from 'react-icons/fa';

// Enhanced profile interface matching the athlete profiles schema
interface EnhancedProfileData extends ProfileData {
  customUrlSlug?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  gpa?: string;
  // Visibility controls
  isHeightVisible?: boolean;
  isWeightVisible?: boolean;
  isGpaVisible?: boolean;
  isTranscriptVisible?: boolean;
  // Performance metrics
  fortyYardDash?: string;
  benchPressMax?: string;
  verticalLeap?: string;
  shuttleRun?: string;
}

interface Props {
  profileData: EnhancedProfileData;
  onChange: (data: Partial<EnhancedProfileData>) => void;
  onSave?: (profileId: string) => void;
}

interface SlugValidation {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
}

const EnhancedProfileEditor: React.FC<Props> = ({ profileData, onChange, onSave }) => {
  // State management
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStates, setUploadStates] = useState({
    profilePhoto: false,
    video: false,
    transcript: false,
  });
  const [slugValidation, setSlugValidation] = useState<SlugValidation>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });
  const [showVisibilityToggles, setShowVisibilityToggles] = useState(false);
  
  const { user } = useAuth();
  const photoObjectUrlRef = useRef<string | null>(null);

  // Generate slug from name
  const generateSlugFromName = useCallback((fullName: string) => {
    return fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50); // Limit length
  }, []);

  // Debounced slug validation
  const validateSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug || slug.length < 3) {
        setSlugValidation({
          isChecking: false,
          isAvailable: false,
          message: 'Slug must be at least 3 characters'
        });
        return;
      }

      setSlugValidation(prev => ({ ...prev, isChecking: true }));

      try {
        // Use the correct API path matching server routing
        const response = await fetch(`/api/athlete-profile/check-slug/${slug}`);
        const data = await response.json();
        
        setSlugValidation({
          isChecking: false,
          isAvailable: data.available,
          message: data.available 
            ? 'This slug is available!' 
            : 'This slug is already taken'
        });
      } catch (error) {
        setSlugValidation({
          isChecking: false,
          isAvailable: false,
          message: 'Error checking availability'
        });
      }
    }, 500),
    []
  );

  // Auto-generate slug when name changes
  useEffect(() => {
    if (profileData.fullName && !profileData.customUrlSlug) {
      const generatedSlug = generateSlugFromName(profileData.fullName);
      onChange({ customUrlSlug: generatedSlug });
    }
  }, [profileData.fullName, profileData.customUrlSlug, generateSlugFromName, onChange]);

  // Validate slug when it changes
  useEffect(() => {
    if (profileData.customUrlSlug) {
      validateSlug(profileData.customUrlSlug);
    }
  }, [profileData.customUrlSlug, validateSlug]);

  // Pre-populate from user account
  useEffect(() => {
    if (user && !profileData.fullName) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      onChange({
        fullName,
        firstName,
        lastName,
        email: user.email
      });
    }
  }, [user, profileData.fullName, onChange]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      }
    };
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!profileData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!profileData.email?.trim()) newErrors.email = 'Email is required';
    if (!profileData.highSchool?.trim()) newErrors.highSchool = 'High school is required';
    if (!profileData.position?.trim()) newErrors.position = 'Position is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileData.email && !emailRegex.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Slug validation
    if (profileData.customUrlSlug && !slugValidation.isAvailable) {
      newErrors.customUrlSlug = 'Please choose an available URL slug';
    }

    // Numeric field validation
    const numericFields = ['gradYear', 'heightFt', 'heightIn', 'weight', 'fortyYardDash', 'benchPressMax'];
    numericFields.forEach(field => {
      const value = profileData[field as keyof EnhancedProfileData];
      if (value && typeof value === 'string' && value.trim() && isNaN(Number(value))) {
        newErrors[field] = 'Must be a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { response, data } = await saveProfile(profileData);
      
      if (response.ok && data.success) {
        if (onSave && data.data?.id) {
          onSave(data.data.id);
        }
        // Show success message
        alert('Profile saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      alert(`Error saving profile: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (
    file: File, 
    type: keyof typeof uploadStates
  ) => {
    setUploadStates(prev => ({ ...prev, [type]: true }));

    try {
      if (type === 'profilePhoto') {
        // Handle photo preview
        if (photoObjectUrlRef.current) {
          URL.revokeObjectURL(photoObjectUrlRef.current);
        }
        const previewUrl = URL.createObjectURL(file);
        photoObjectUrlRef.current = previewUrl;
        onChange({ profileImageUrl: previewUrl });
      }

      const { response, data } = await uploadFile(file, type);
      
      if (response.ok && data.success) {
        const mockUploads = { ...profileData.mockUploads };
        mockUploads[type] = {
          name: file.name,
          type: file.type,
          url: data.data.url
        };
        onChange({ mockUploads });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      alert(`Error uploading ${type}: ${message}`);
      
      // Cleanup on error
      if (type === 'profilePhoto' && photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current);
        photoObjectUrlRef.current = null;
        onChange({ profileImageUrl: undefined });
      }
    } finally {
      setUploadStates(prev => ({ ...prev, [type]: false }));
    }
  };

  // Input field component
  const InputField: React.FC<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
    value?: string;
  }> = ({ name, label, type = 'text', placeholder, required = false, readOnly = false, value }) => {
    const rawValue = value ?? profileData[name as keyof EnhancedProfileData];
    // Ensure fieldValue is always a string for input fields
    const fieldValue = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
    
    return (
      <div className="space-y-1">
        <label className="flex items-center text-sm font-medium text-gray-700">
          {readOnly ? <FaLock className="w-3 h-3 mr-1 text-gray-400" /> : <FaPencilAlt className="w-3 h-3 mr-1 text-gray-400" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={fieldValue}
          onChange={(e) => onChange({ [name]: e.target.value })}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm
            ${errors[name] ? 'border-red-500' : 'border-gray-300'}
            ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}
          `}
        />
        {errors[name] && (
          <p className="text-xs text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  // Textarea field component  
  const TextareaField: React.FC<{
    name: string;
    label: string;
    placeholder?: string;
    rows?: number;
  }> = ({ name, label, placeholder, rows = 4 }) => {
    const rawValue = profileData[name as keyof EnhancedProfileData];
    // Ensure fieldValue is always a string for textarea fields
    const fieldValue = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
    
    return (
      <div className="space-y-1">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaPencilAlt className="w-3 h-3 mr-1 text-gray-400" />
          {label}
        </label>
        <textarea
          value={fieldValue}
          onChange={(e) => onChange({ [name]: e.target.value })}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm resize-none
            ${errors[name] ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          `}
        />
        {errors[name] && (
          <p className="text-xs text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  // File upload component
  const FileUpload: React.FC<{
    type: keyof typeof uploadStates;
    label: string;
    accept: string;
    icon: React.ReactNode;
  }> = ({ type, label, accept, icon }) => {
    const isUploading = uploadStates[type];
    const hasFile = profileData.mockUploads?.[type];
    
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
            {icon}
            <span className="ml-2">{label}</span>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, type);
            }}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center text-blue-600">
              <FaSpinner className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept.replace(/[,]/g, ', ')}
              </p>
            </div>
          )}
        </label>
        
        {hasFile && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <FaCheck className="w-3 h-3 inline mr-1 text-green-600" />
            {hasFile.name}
          </div>
        )}
      </div>
    );
  };

  // Visibility toggle component
  const VisibilityToggle: React.FC<{
    field: string;
    label: string;
  }> = ({ field, label }) => {
    const isVisible = profileData[field as keyof EnhancedProfileData] ?? true;
    
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => onChange({ [field]: !isVisible })}
          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${isVisible 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {isVisible ? <FaEye className="w-3 h-3 mr-1" /> : <FaEyeSlash className="w-3 h-3 mr-1" />}
          {isVisible ? 'Visible' : 'Hidden'}
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <h1 className="text-xl font-bold">Build Your Athlete Profile</h1>
        <p className="text-indigo-100 text-sm mt-1">
          Create an impressive profile to share with college recruiters
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Basic Information */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              required
              readOnly
            />
            <InputField
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
            />
            <InputField
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
            />
          </div>
        </section>

        {/* Profile URL */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <FaShareAlt className="w-4 h-4 mr-2" />
            Your Profile URL
          </h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">oneshot.dev/profile/</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={profileData.customUrlSlug ?? ''}
                  onChange={(e) => onChange({ customUrlSlug: e.target.value })}
                  placeholder="your-custom-url"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm
                    ${errors.customUrlSlug ? 'border-red-500' : 'border-gray-300'}
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  `}
                />
              </div>
              <div className="flex items-center">
                {slugValidation.isChecking ? (
                  <FaSpinner className="w-4 h-4 animate-spin text-gray-400" />
                ) : slugValidation.isAvailable === true ? (
                  <FaCheck className="w-4 h-4 text-green-600" />
                ) : slugValidation.isAvailable === false ? (
                  <FaTimes className="w-4 h-4 text-red-600" />
                ) : null}
              </div>
            </div>
            {slugValidation.message && (
              <p className={`text-xs ${
                slugValidation.isAvailable ? 'text-green-600' : 'text-red-600'
              }`}>
                {slugValidation.message}
              </p>
            )}
          </div>
        </section>

        {/* Athletic Information */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Athletic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="highSchool"
              label="High School"
              placeholder="Central High School"
              required
            />
            <InputField
              name="position"
              label="Primary Position"
              placeholder="Quarterback"
              required
            />
            <InputField
              name="gradYear"
              label="Graduation Year"
              placeholder="2025"
            />
            <div className="grid grid-cols-2 gap-2">
              <InputField
                name="city"
                label="City"
                placeholder="Austin"
              />
              <InputField
                name="state"
                label="State"
                placeholder="TX"
              />
            </div>
          </div>
        </section>

        {/* Physical Stats */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Physical Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField
              name="heightFt"
              label="Height (ft)"
              placeholder="6"
            />
            <InputField
              name="heightIn"
              label="Height (in)"
              placeholder="2"
            />
            <InputField
              name="weight"
              label="Weight (lbs)"
              placeholder="185"
            />
            <InputField
              name="gpa"
              label="GPA"
              placeholder="3.8"
            />
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField
              name="fortyYardDash"
              label="40-Yard Dash (s)"
              placeholder="4.6"
            />
            <InputField
              name="benchPressMax"
              label="Bench Press (lbs)"
              placeholder="225"
            />
            <InputField
              name="verticalLeap"
              label="Vertical Leap (in)"
              placeholder="32"
            />
            <InputField
              name="shuttleRun"
              label="Shuttle Run (s)"
              placeholder="4.2"
            />
          </div>
        </section>

        {/* Bio */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Personal Statement
          </h2>
          <TextareaField
            name="bio"
            label="Tell your story"
            placeholder="Share your athletic journey, goals, and what makes you unique as a player..."
            rows={6}
          />
        </section>

        {/* Media Uploads */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Media & Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUpload
              type="profilePhoto"
              label="Profile Photo"
              accept="image/jpeg,image/png,image/gif"
              icon={<FaCamera className="w-4 h-4" />}
            />
            <FileUpload
              type="video"
              label="Highlight Video"
              accept="video/mp4,video/quicktime"
              icon={<FaVideo className="w-4 h-4" />}
            />
            <FileUpload
              type="transcript"
              label="Academic Transcript"
              accept="application/pdf"
              icon={<FaFilePdf className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* Privacy Controls */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Privacy Settings
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowVisibilityToggles(!showVisibilityToggles)}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              {showVisibilityToggles ? 'Hide' : 'Show'} visibility controls
              <FaPencilAlt className="w-3 h-3 ml-1" />
            </button>
            
            {showVisibilityToggles && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                <VisibilityToggle field="isHeightVisible" label="Height & Weight" />
                <VisibilityToggle field="isGpaVisible" label="GPA" />
                <VisibilityToggle field="isTranscriptVisible" label="Academic Transcript" />
              </div>
            )}
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !slugValidation.isAvailable}
            className={`px-6 py-3 rounded-md font-medium text-white transition-colors
              ${isSubmitting || !slugValidation.isAvailable
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                Saving Profile...
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EnhancedProfileEditor; 