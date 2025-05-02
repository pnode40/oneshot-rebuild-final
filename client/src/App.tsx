import React, { useState, useEffect, ChangeEvent } from 'react';
import ProfileInfoForm from './components/ProfileInfoForm';
import ProfilePreview from './components/ProfilePreview';
import './App.css'

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

const defaultProfileData: ProfileData = {
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
};

function App() {
  const [formData, setFormData] = useState<ProfileData>(defaultProfileData);

  // ✅ Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem('profileData');
    if (stored) {
      try {
        setFormData(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse localStorage:', err);
      }
    }
  }, []);

  // ✅ Save to localStorage on every field change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    localStorage.setItem('profileData', JSON.stringify(updated));
  };

  return (
    // Removed Layout component for simplification
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Athlete Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Column */}
        <div>
          <ProfileInfoForm formData={formData} onFormChange={handleInputChange} />
        </div>
        {/* Preview Column */}
        <div>
          {/* Passing formData directly to preview */}
          <ProfilePreview profile={formData} /> 
        </div>
      </div>
    </div>
  );
}

export default App;
