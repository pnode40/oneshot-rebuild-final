import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { apiRequest } from '../../lib/apiRequest';
import { PublicProfile, PublicMetrics } from '../../../shared/types/publicProfileTypes';
import { VCardDownloadButton } from '../../components/VCardDownloadButton';
import { CoachVCardDownloadButton } from '../../components/CoachVCardDownloadButton';
import { ScrollToTopButton } from '../../components/ScrollToTopButton';
import { ChecklistEmailButton } from '../../components/ChecklistEmailButton';
import { ProfilePictureManager } from '../../components/ProfilePictureManager';
import { QRCodeBlock } from '../../components/QRCodeBlock';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      const response = await apiRequest<{ profile: PublicProfile; metrics: PublicMetrics }>(`/api/public-profile/${id}`, 'GET');
      if (response.success && response.data) {
        setProfile(response.data.profile);
        setMetrics(response.data.metrics);
      }
    }

    fetchProfile();
  }, [id]);

  if (!profile) {
    return <div className="p-4">Loading...</div>;
  }

  const scrollToDetails = () => {
    const detailsSection = document.getElementById('details-section');
    if (detailsSection) {
      detailsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeProfilePicture = profile.profilePictures?.find(pic => pic.active)?.url || '/default-profile.png';

  return (
    <>
      <Helmet>
        <title>{profile.fullName} | OneShot Recruiting</title>
        <meta property="og:title" content={`${profile.fullName} | OneShot`} />
        <meta property="og:description" content="Check out this athlete's profile on OneShot Recruiting!" />
        <meta property="og:image" content={`https://oneshotrecruits.com/api/og/${id}`} />
        <meta property="og:url" content={`https://oneshotrecruits.com/athlete/${id}`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="p-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <img src={activeProfilePicture} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
          <p className="text-xl text-gray-600 mb-4">{profile.position} | Class of {profile.graduationYear}</p>
          <QRCodeBlock url={`https://oneshotrecruits.com/athlete/${id}`} />
        </div>

        {/* Profile Picture Manager */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Pictures</h2>
          <ProfilePictureManager 
            userId={parseInt(id as string)} 
            pictures={profile.profilePictures || []} 
          />
        </div>

        {/* Checklist Button */}
        <div className="flex justify-center mb-8">
          <ChecklistEmailButton userId={parseInt(id as string)} />
        </div>

        {/* General Metrics */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">General Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ul className="space-y-2">
                <li>Height: {metrics?.heightFeet}' {metrics?.heightInches}"</li>
                <li>Weight: {metrics?.weight} lbs</li>
                <li>40-Yard Dash: {metrics?.fortyYardDash} sec</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>Shuttle Run: {metrics?.shuttleRun} sec</li>
                <li>Vertical Jump: {metrics?.verticalJump} in</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Video Highlights */}
        {profile.highlightVideos && profile.highlightVideos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Video Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.highlightVideos.map((video, index) => (
                <div key={index} className="aspect-video bg-gray-200 rounded-lg">
                  {/* Video player component would go here */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Athlete Contact Block */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-2">
            <p>Email: {profile.contactEmail}</p>
            <p>Phone: {profile.contactPhone}</p>
            {profile.twitterHandle && (
              <p>Twitter: <a href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`} className="text-blue-500 hover:underline">@{profile.twitterHandle.replace('@', '')}</a></p>
            )}
          </div>
          <VCardDownloadButton userId={parseInt(id as string)} />
        </div>

        {/* Powered by OneShot Branding */}
        <div className="bg-gray-100 p-6 rounded-lg text-center mb-8">
          <p className="text-gray-600 mb-2">Powered by OneShot</p>
          <a href="/signup" className="text-blue-600 hover:underline">Create Your Recruit Profile Today</a>
        </div>

        {/* Want to Learn More Button */}
        <div className="text-center mb-8">
          <button
            onClick={scrollToDetails}
            className="bg-orange-500 text-white px-6 py-2 rounded shadow hover:bg-orange-600"
          >
            Want to Learn More About {profile.fullName}?
          </button>
        </div>

        {/* Coach Contact Block */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Coach Information</h2>
          <div className="space-y-2">
            <p>Name: {profile.coachName}</p>
            <p>Email: {profile.coachEmail}</p>
            <p>Phone: {profile.coachPhone}</p>
          </div>
          <CoachVCardDownloadButton userId={parseInt(id as string)} />
        </div>

        {/* Position-Specific Stats */}
        <div id="details-section" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Position-Specific Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ul className="space-y-2">
                <li>Passing Yards: {metrics?.passingYards}</li>
                <li>Rushing Yards: {metrics?.rushingYards}</li>
                <li>Receiving Yards: {metrics?.receivingYards}</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>Tackles: {metrics?.tackles}</li>
                <li>Sacks: {metrics?.sacks}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Awards and Accomplishments */}
        {profile.awards && profile.awards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Awards and Accomplishments</h2>
            <ul className="list-disc list-inside space-y-2">
              {profile.awards.map((award, index) => (
                <li key={index}>{award}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracurricular Activities */}
        {profile.extracurriculars && profile.extracurriculars.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Extracurricular Activities</h2>
            <ul className="list-disc list-inside space-y-2">
              {profile.extracurriculars.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>
    </>
  );
} 