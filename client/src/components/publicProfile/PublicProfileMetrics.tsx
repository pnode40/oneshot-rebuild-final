import React from 'react';
import { AthleteProfile } from '../../types/athleteProfile';

interface PublicProfileMetricsProps {
  profile: AthleteProfile;
}

const PublicProfileMetrics: React.FC<PublicProfileMetricsProps> = ({ profile }) => {
  // Helper to check if there are any speed/agility metrics
  const hasSpeedMetrics = profile.fortyYardDash || profile.verticalLeap || profile.broadJump || profile.proAgility;
  
  // Helper to check if there are any strength metrics
  const hasStrengthMetrics = profile.benchPressMax || profile.squat || profile.deadlift;
  
  // If no metrics, don't render the component
  if (!hasSpeedMetrics && !hasStrengthMetrics) {
    return null;
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Performance Metrics</h2>
      </div>
      
      <div className="p-4">
        {/* Speed & Agility Metrics */}
        {hasSpeedMetrics && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Speed & Agility</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.fortyYardDash && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">40-Yard Dash</p>
                  <p className="text-xl font-semibold text-blue-700">{profile.fortyYardDash} sec</p>
                </div>
              )}
              
              {profile.verticalLeap && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Vertical Leap</p>
                  <p className="text-xl font-semibold text-blue-700">{profile.verticalLeap}"</p>
                </div>
              )}
              
              {profile.broadJump && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Broad Jump</p>
                  <p className="text-xl font-semibold text-blue-700">{profile.broadJump}"</p>
                </div>
              )}
              
              {profile.proAgility && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Pro Agility</p>
                  <p className="text-xl font-semibold text-blue-700">{profile.proAgility} sec</p>
                </div>
              )}
              
              {profile.shuttleRun && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Shuttle Run</p>
                  <p className="text-xl font-semibold text-blue-700">{profile.shuttleRun} sec</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Strength & Power Metrics */}
        {hasStrengthMetrics && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Strength & Power</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.benchPressMax && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Bench Press</p>
                  <p className="text-xl font-semibold text-gray-800">{profile.benchPressMax} lbs</p>
                </div>
              )}
              
              {profile.squat && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Squat</p>
                  <p className="text-xl font-semibold text-gray-800">{profile.squat} lbs</p>
                </div>
              )}
              
              {profile.deadlift && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Deadlift</p>
                  <p className="text-xl font-semibold text-gray-800">{profile.deadlift} lbs</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Additional metrics from the otherAthleticStats object */}
        {profile.otherAthleticStats && Object.keys(profile.otherAthleticStats).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Metrics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(profile.otherAthleticStats).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="text-xl font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileMetrics; 