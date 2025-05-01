import React, { useState, ChangeEvent } from 'react';
import Layout from './components/Layout'; // Import the Layout component
import ProfileInfoForm from './components/ProfileInfoForm'; // Import the form component
import ProfilePreview from './components/ProfilePreview'; // Import the preview component
import './App.css'

// Define the shape of the profile data
export interface ProfileData {
  fullName: string;
  email: string;
  highSchool: string;
  position: string;
  gradYear: string; // Added for preview
  cityState: string; // Added for preview
  heightFt: string;
  heightIn: string;
  weight: string;
  fortyYardDash: string;
  benchPress: string;
}

function App() {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    highSchool: '',
    position: '',
    gradYear: '', // Initialize all fields
    cityState: '',
    heightFt: '',
    heightIn: '',
    weight: '',
    fortyYardDash: '',
    benchPress: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Format data for preview (e.g., combine height, add units)
  const previewData = {
    ...profileData,
    school: profileData.highSchool,
    height: profileData.heightFt && profileData.heightIn ? `${profileData.heightFt}'${profileData.heightIn}"` : '',
    weight: profileData.weight ? `${profileData.weight} lbs` : '',
    fortyYardDash: profileData.fortyYardDash ? `${profileData.fortyYardDash}s` : '',
    benchPress: profileData.benchPress ? `${profileData.benchPress} lbs` : '',
  };

  return (
    <Layout>
      <main className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Column */}
          <div>
            <ProfileInfoForm
              formData={profileData}
              onFormChange={handleInputChange}
            />
          </div>
          {/* Preview Column */}
          <div>
            <ProfilePreview {...previewData} />
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default App;
