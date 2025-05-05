import React from 'react';
import { ProfileData } from '../App'; // assumes App.tsx exports the interface

interface Props {
  profileData: ProfileData;
}

const ProfilePreview: React.FC<Props> = ({ profileData }) => {
  return (
    <div className="border border-gray-300 rounded-md p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Preview</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Name:</span> {profileData.fullName || '-'}</p>
        <p><span className="font-medium">High School:</span> {profileData.highSchool || '-'}</p>
        <p><span className="font-medium">Position:</span> {profileData.position || '-'}</p>
        <p><span className="font-medium">Graduation Year:</span> {profileData.gradYear || '-'}</p>
        <p><span className="font-medium">City/State:</span> {profileData.cityState || '-'}</p>
        <p>
          <span className="font-medium">Height:</span>{' '}
          {profileData.heightFt && profileData.heightIn
            ? `${profileData.heightFt}' ${profileData.heightIn}"`
            : '-'}
        </p>
        <p><span className="font-medium">Weight:</span> {profileData.weight || '-'} lbs</p>
        <p><span className="font-medium">40-Yard Dash:</span> {profileData.fortyYardDash || '-'} s</p>
        <p><span className="font-medium">Bench Press:</span> {profileData.benchPress || '-'} lbs</p>
      </div>
    </div>
  );
};

export default ProfilePreview; 