import React, { useState } from 'react';
import VideoPlayer from '../VideoPlayer';

interface PublicProfileVideoProps {
  videoUrl: string;
  videoType: string;
  thumbnailUrl?: string | null;
}

const PublicProfileVideo: React.FC<PublicProfileVideoProps> = ({
  videoUrl,
  videoType,
  thumbnailUrl
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Determine if this is a YouTube or Hudl video
  const isYouTube = videoType === 'youtube';
  
  // For YouTube videos, extract the video ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const youtubeId = isYouTube ? getYouTubeId(videoUrl) : null;
  
  // For Hudl videos, we'll just show a thumbnail that redirects to Hudl
  const handleHudlClick = () => {
    window.open(videoUrl, '_blank');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Highlight Video</h2>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {isYouTube && youtubeId ? (
          // YouTube embed
          <div className="aspect-w-16 aspect-h-9">
            <VideoPlayer 
              videoUrl={`https://www.youtube.com/embed/${youtubeId}`} 
              posterUrl={thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
            />
          </div>
        ) : (
          // Hudl redirect thumbnail
          <div 
            className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center cursor-pointer group relative"
            onClick={handleHudlClick}
          >
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Hudl Video</h3>
                <p className="text-gray-600 mt-1">Click to view on Hudl</p>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                View on Hudl
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Video Playback</h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">YouTube Videos</h4>
              <p className="text-gray-600">YouTube videos will play directly on this page. You can use the player controls to adjust volume, seek through the video, or enter fullscreen mode.</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Hudl Videos</h4>
              <p className="text-gray-600">Hudl videos will open in a new tab on the Hudl website when you click the thumbnail. This is because Hudl videos cannot be embedded directly.</p>
            </div>
            
            <div className="text-right mt-6">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfileVideo; 