import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createProfile } from '../services/api';
import { ProfileData } from '../App';

// Define the profile type returned from the API
interface Profile extends ProfileData {
  id: number;
  createdAt: string;
}

interface Props {
  profileData: ProfileData;
  onChange: (data: Partial<ProfileData>) => void;
}

const ProfileInfoForm: React.FC<Props> = ({ profileData, onChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields = ['fullName', 'email', 'highSchool', 'position'];
    requiredFields.forEach((field) => {
      if (!profileData[field as keyof ProfileData]?.trim()) {
        newErrors[field] = `${field} is required`;
      }
    });

    if (profileData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(profileData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    const numberFields = ['heightFt', 'heightIn', 'weight', 'fortyYardDash', 'benchPress'];
    numberFields.forEach((field) => {
      const value = profileData[field as keyof ProfileData];
      if (value && isNaN(Number(value))) {
        newErrors[field] = 'Must be a number';
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setDebugInfo('Submitting profile...');
        
        console.log('Submitting profile data:', profileData);
        const response = await createProfile(profileData);
        
        console.log('Response received:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          setSavedProfile(data.profile);
          setDebugInfo(`Profile saved successfully with ID: ${data.profile.id}`);
          alert('Profile saved successfully!');
          console.log('Profile saved:', data.profile);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setDebugInfo(`Error saving profile: ${errorData.message || response.statusText}`);
          alert(`Failed to save profile: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        setDebugInfo(`Exception occurred: ${error}`);
        alert('An error occurred while saving the profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Validation errors:', errors);
      setDebugInfo('Validation failed');
    }
  };

  return (
    <div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Basic Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">High School</label>
          <input
            type="text"
            name="highSchool"
            value={profileData.highSchool}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.highSchool && <p className="text-red-500 text-xs mt-1">{errors.highSchool}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="text"
            name="position"
            value={profileData.position}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
          <input
            type="text"
            name="gradYear"
            value={profileData.gradYear}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City, State</label>
          <input
            type="text"
            name="cityState"
            value={profileData.cityState}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Height (Feet & Inches) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Height</label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="heightFt"
              placeholder="Feet"
              value={profileData.heightFt}
              onChange={handleChange}
              className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="heightIn"
              placeholder="Inches"
              value={profileData.heightIn}
              onChange={handleChange}
              className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
            />
          </div>
          {(errors.heightFt || errors.heightIn) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.heightFt || errors.heightIn}
            </p>
          )}
        </div>

        {/* Athletic Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
          <input
            type="text"
            name="weight"
            value={profileData.weight}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">40-Yard Dash (s)</label>
          <input
            type="text"
            name="fortyYardDash"
            value={profileData.fortyYardDash}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.fortyYardDash && <p className="text-red-500 text-xs mt-1">{errors.fortyYardDash}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bench Press (lbs)</label>
          <input
            type="text"
            name="benchPress"
            value={profileData.benchPress}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.benchPress && <p className="text-red-500 text-xs mt-1">{errors.benchPress}</p>}
        </div>

        {/* Debug Tools */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Debug Tools</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <button 
              type="button" 
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={() => {
                console.log('Form Data:', profileData);
                setDebugInfo('Form data logged to console');
              }}
            >
              Log Form Data
            </button>
            <button 
              type="button" 
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={testApiConnection}
            >
              Test API Connection
            </button>
            <button 
              type="button" 
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={testDbConnection}
            >
              Test DB Connection
            </button>
          </div>
          {debugInfo && (
            <div className="text-xs bg-white p-2 rounded border border-gray-200 max-h-20 overflow-auto">
              {debugInfo}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Display saved profile data */}
      {savedProfile && (
        <div className="mt-8 p-4 border border-green-500 rounded bg-green-50">
          <h3 className="text-lg font-medium text-green-800 mb-2">Saved Profile (ID: {savedProfile.id})</h3>
          <pre className="text-xs overflow-auto max-h-60 bg-white p-2 rounded">
            {JSON.stringify(savedProfile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoForm; 