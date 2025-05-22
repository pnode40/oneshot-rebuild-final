import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfileBySlug, generateVCard } from '../services/api';
import { ProfileData } from '../types';
// Layout is now provided by App.tsx's AppContent

const PublicProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const { response, data: responseData } = await getPublicProfileBySlug(slug);
          if (response.ok && responseData.success) {
            setProfile(responseData.data);
          } else {
            setError(responseData.message || 'Failed to load profile.');
            setProfile(null);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
          setProfile(null);
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="container mx-auto p-4 text-center">Profile not found.</div>;
  }

  const photoToDisplay = 
    profile.profileImageUrl && (profile.profileImageUrl.startsWith('http') || profile.profileImageUrl.startsWith('blob:')) ? profile.profileImageUrl :
    (profile.mockUploads?.profilePhoto?.url ? `https://via.placeholder.com/150/1f2a44/ffffff?Text=${encodeURIComponent(profile.fullName.split(' ')[0])}` : undefined);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{profile.fullName}'s Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Profile Image */}
          {photoToDisplay ? (
            <img 
              src={photoToDisplay}
              alt={`${profile.fullName}'s profile photo`}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-semibold border-4 border-gray-200 shadow-sm">
              {profile.fullName?.charAt(0) || 'P'} {/* Fallback to first initial or P */}
            </div>
          )}

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">{profile.fullName}</h2>
            <p className="text-gray-600">{profile.position}</p>
            <p className="text-gray-500 text-sm">{profile.highSchool} - Class of {profile.gradYear || 'N/A'}</p>
            <p className="text-gray-500 text-sm">{profile.cityState || 'N/A'}</p>
          </div>
        </div>

        <hr className="my-6" />

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Bio</h3>
            <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {/* Athletic Metrics - Example */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Athletic Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {profile.heightFt && profile.heightIn && <div><strong>Height:</strong> {profile.heightFt}'{profile.heightIn}"</div>}
            {profile.weight && <div><strong>Weight:</strong> {profile.weight} lbs</div>}
            {profile.fortyYardDash && <div><strong>40-Yard Dash:</strong> {profile.fortyYardDash}s</div>}
            {profile.benchPress && <div><strong>Bench Press:</strong> {profile.benchPress} lbs</div>}
          </div>
        </div>

        {/* Uploaded Files Section */}
        {profile.mockUploads && Object.keys(profile.mockUploads).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Uploaded Files (Mock)</h3>
            <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-gray-600">
              {profile.mockUploads.profilePhoto && (
                <li>Profile Photo: {profile.mockUploads.profilePhoto.name} (Stored at: {profile.mockUploads.profilePhoto.url})</li>
              )}
              {profile.mockUploads.videoMain && (
                <li>Main Highlight Video: {profile.mockUploads.videoMain.name} (Stored at: {profile.mockUploads.videoMain.url})</li>
                // In a real app, this might be an embedded player or a download link
              )}
              {profile.mockUploads.transcriptPDF && (
                <li>Transcript: {profile.mockUploads.transcriptPDF.name} (Stored at: {profile.mockUploads.transcriptPDF.url})</li>
                // In a real app, this would be a download link
              )}
            </ul>
          </div>
        )}

        {/* Social Media Links - Example */}
        {profile.socialMediaLinks && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Connect</h3>
            <div className="flex space-x-4">
              {profile.socialMediaLinks.twitter && <a href={profile.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Twitter</a>}
              {profile.socialMediaLinks.instagram && <a href={profile.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700">Instagram</a>}
              {profile.socialMediaLinks.hudl && <a href={profile.socialMediaLinks.hudl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-700">Hudl</a>}
            </div>
          </div>
        )}

        {/* vCard Download Button */}
        <div className="mt-6 pt-6 border-t">
          <button 
            onClick={async () => {
              if (!profile) return;
              try {
                const { response, data: responseData } = await generateVCard(profile);
                if (response.ok && responseData.success && responseData.data.vCardString) {
                  const vCardString = responseData.data.vCardString;
                  const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  const fileName = `${profile.fullName.replace(/ /g, '_') || 'contact'}.vcf`;
                  link.setAttribute('download', fileName);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  alert('vCard downloaded!'); // Or some less intrusive notification
                } else {
                  console.error('Failed to generate vCard:', responseData.message);
                  alert('Could not generate vCard.');
                }
              } catch (error) {
                console.error('Error generating vCard:', error);
                alert('An error occurred while generating the vCard.');
              }
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Download vCard (.vcf)
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage; 