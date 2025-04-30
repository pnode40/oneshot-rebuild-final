import React from 'react';

// Update props interface to match the structure passed from App (formatted data)
interface ProfilePreviewProps {
  fullName: string;
  position: string;
  gradYear: string;
  school: string; // Ensure school is included
  cityState: string;
  height: string; // Expect formatted height
  weight: string; // Expect formatted weight
  fortyYardDash: string; // Expect formatted time
  benchPress: string; // Expect formatted weight
  // Add any other fields from ProfileData if needed directly
  highSchool?: string; // Make original optional if school is primary
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  fullName,
  position,
  gradYear,
  school, // Use passed school prop
  cityState,
  height,
  weight,
  fortyYardDash,
  benchPress,
}) => {

  // Helper component for metric items
  const MetricItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div>
      <p className="text-oneshot-label text-sm font-medium" style={{ fontVariant: 'small-caps' }}>{label}</p>
      {/* Render value only if it exists and is not empty */}
      <p className="text-oneshot-text font-medium">{value || '-'}</p>
    </div>
  );

  // Use school prop, fallback to highSchool if needed and available
  const displaySchool = school || '';

  return (
    <div className="p-4 bg-white rounded shadow-lg sticky top-[calc(theme(spacing.20)+1rem)]"> {/* Adjust top based on header height */}
      <h2 className="text-xl font-semibold mb-4 text-oneshot-text">Live Preview</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Circular Image Placeholder */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full shadow-md flex items-center justify-center">
            <span className="text-gray-500">Image</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-oneshot-text mb-1">{fullName || 'Full Name'}</h1>
          <p className="text-oneshot-label font-medium mb-2" style={{ fontVariant: 'small-caps' }}>
            {position || 'Position'} | Class of {gradYear || 'Year'}
          </p>
          <p className="text-oneshot-text text-sm mb-1">{displaySchool || 'School Name'}</p>
          <p className="text-oneshot-text text-sm mb-4">{cityState || 'City, State'}</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 my-4" />

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Column 1: Basic Info / Power */}
        <div className="space-y-3">
          <MetricItem label="Height" value={height} />
          <MetricItem label="Weight" value={weight} />
          <MetricItem label="Bench Press" value={benchPress} />
        </div>

        {/* Column 2: Speed / Position */}
        <div className="space-y-3">
          <MetricItem label="40-Yard Dash" value={fortyYardDash} />
          {/* Add other relevant metrics here if needed */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview; 