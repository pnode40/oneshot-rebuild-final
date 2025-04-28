import React, { useState } from 'react';
import { apiRequest } from '../lib/apiRequest';

interface ProfilePicture {
  url: string;
  uploadedAt: string;
  active: boolean;
}

interface ProfilePictureManagerProps {
  userId: number;
  pictures: ProfilePicture[];
}

export function ProfilePictureManager({ userId, pictures }: ProfilePictureManagerProps) {
  const [url, setUrl] = useState('');

  const handleUpload = async () => {
    try {
      await apiRequest('/api/upload/profile-pic', 'POST', { userId, url });
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  const handleActivate = async (selectedUrl: string) => {
    try {
      await apiRequest('/api/upload/profile-pic/activate', 'POST', { userId, url: selectedUrl });
      window.location.reload();
    } catch (error) {
      console.error('Failed to activate profile picture:', error);
      alert('Failed to activate profile picture. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          placeholder="Paste profile picture URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button 
          onClick={handleUpload} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Upload New Picture
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        {pictures.map((pic) => (
          <div key={pic.url} className="relative group">
            <img 
              src={pic.url} 
              alt="Profile Pic" 
              className={`rounded w-full h-32 object-cover ${pic.active ? 'ring-4 ring-green-500' : ''}`} 
            />
            {!pic.active && (
              <button
                onClick={() => handleActivate(pic.url)}
                className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Set Active
              </button>
            )}
            <div className="absolute top-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {new Date(pic.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 