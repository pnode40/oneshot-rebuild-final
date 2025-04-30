import React from 'react';

interface ProfilePreviewProps {
  fullName: string;
  position: string;
  gradYear: string;
  school: string;
  cityState: string;
  height: string;
  weight: string;
  fortyYardDash: string;
  benchPress: string;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  fullName = "Jalen Smith",
  position = "WR",
  gradYear = "2026",
  school = "Sunset High School",
  cityState = "Austin, TX",
  height = "6'1\"",
  weight = "185 lbs",
  fortyYardDash = "4.5s",
  benchPress = "225 lbs",
}) => {

  // Helper component for metric items
  const MetricItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
      <p className="text-oneshot-label text-sm font-medium" style={{ fontVariant: 'small-caps' }}>{label}</p>
      <p className="text-oneshot-text font-medium">{value}</p>
    </div>
  );

  return (
    <div className="max-w-screen-md mx-auto p-4 bg-white rounded shadow-lg my-4">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Circular Image Placeholder */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full shadow-md flex items-center justify-center">
            <span className="text-gray-500">Image</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-oneshot-text mb-1">{fullName}</h1>
          <p className="text-oneshot-label font-medium mb-2" style={{ fontVariant: 'small-caps' }}>
            {position} | Class of {gradYear}
          </p>
          <p className="text-oneshot-text text-sm mb-1">{school}</p>
          <p className="text-oneshot-text text-sm mb-4">{cityState}</p>
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