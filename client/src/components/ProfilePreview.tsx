import React from 'react';
import { ProfileData } from '../App'; // assumes App.tsx exports the interface

interface Props {
  profile: ProfileData;
}

const ProfilePreview: React.FC<Props> = ({ profile }) => {
  return (
    <div className="border border-gray-300 rounded-md p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Preview</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Name:</span> {profile.fullName || '-'}</p>
        <p><span className="font-medium">High School:</span> {profile.highSchool || '-'}</p>
        <p><span className="font-medium">Position:</span> {profile.position || '-'}</p>
        <p><span className="font-medium">Graduation Year:</span> {profile.gradYear || '-'}</p>
        <p><span className="font-medium">City/State:</span> {profile.cityState || '-'}</p>
        <p>
          <span className="font-medium">Height:</span>{' '}
          {profile.heightFt && profile.heightIn
            ? `${profile.heightFt}' ${profile.heightIn}"`
            : '-'}
        </p>
        <p><span className="font-medium">Weight:</span> {profile.weight || '-'} lbs</p>
        <p><span className="font-medium">40-Yard Dash:</span> {profile.fortyYardDash || '-'} s</p>
        <p><span className="font-medium">Bench Press:</span> {profile.benchPress || '-'} lbs</p>
      </div>
    </div>
  );
};

export default ProfilePreview; 