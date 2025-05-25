import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaCamera,
  FaUpload,
  FaImage,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaStar,
  FaRegStar
} from 'react-icons/fa';
import { MdCloudUpload, MdPhotoLibrary } from 'react-icons/md';

interface ProfilePhoto {
  id: string;
  url: string;
  filename: string;
  isProfilePhoto: boolean;
  caption?: string;
  uploadedAt: string;
}

interface ProfilePhotoManagerProps {
  userId: string;
  isOwner: boolean;
  maxPhotos?: number;
}

const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ 
  userId, 
  isOwner, 
  maxPhotos = 5 
}) => {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profile-photos/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const result = await response.json();
      setPhotos(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Check photo limit
    if (photos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`/api/profile-photos/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload photo: ${response.status}`);
      }

      const result = await response.json();
      setPhotos([...photos, result.data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/profile-photos/item/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete photo: ${response.status}`);
      }

      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const handleSetProfilePhoto = async (photoId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/profile-photos/item/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isProfilePhoto: true }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set profile photo: ${response.status}`);
      }

      const result = await response.json();
      setPhotos(photos.map(photo => ({
        ...photo,
        isProfilePhoto: photo.id === photoId
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set profile photo');
    }
  };

  const handleUpdateCaption = async (photoId: string, caption: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/profile-photos/item/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update caption: ${response.status}`);
      }

      const result = await response.json();
      setPhotos(photos.map(photo => 
        photo.id === photoId ? { ...photo, caption } : photo
      ));
      setEditingCaption(null);
      setCaptionText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update caption');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const startEditCaption = (photo: ProfilePhoto) => {
    setEditingCaption(photo.id);
    setCaptionText(photo.caption || '');
  };

  const cancelEditCaption = () => {
    setEditingCaption(null);
    setCaptionText('');
  };

  const profilePhoto = photos.find(photo => photo.isProfilePhoto);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaCamera className="text-2xl text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Profile Photos</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {photos.length}/{maxPhotos}
          </span>
        </div>
        {isOwner && photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Profile Photo */}
      {profilePhoto && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Profile Photo</h3>
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={profilePhoto.url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
              />
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                <FaStar className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">
                This photo appears as your main profile image across the platform.
              </p>
              {profilePhoto.caption && (
                <p className="text-gray-800 mt-2 italic">"{profilePhoto.caption}"</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {isOwner && photos.length < maxPhotos && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
        >
          <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Upload a photo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop your photo here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPEG, PNG, WebP up to 5MB
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <FaUpload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <FaImage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No photos yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner ? 'Upload your first photo to get started' : 'No photos have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPhoto === photo.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${photo.isProfilePhoto ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Profile photo'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Profile Photo Badge */}
                {photo.isProfilePhoto && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <FaStar className="w-3 h-3" />
                  </div>
                )}

                {/* Overlay Actions */}
                {isOwner && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {!photo.isProfilePhoto && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetProfilePhoto(photo.id);
                          }}
                          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                          title="Set as profile photo"
                        >
                          <FaRegStar className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditCaption(photo);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Edit caption"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete photo"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                    <p className="text-xs truncate">{photo.caption}</p>
                  </div>
                )}

                {/* Upload Date */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Photo Details */}
      {selectedPhoto && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {(() => {
            const photo = photos.find(p => p.id === selectedPhoto);
            if (!photo) return null;

            return (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Profile photo'}
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center space-x-2">
                        {photo.isProfilePhoto ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaStar className="w-3 h-3 mr-1" />
                            Profile Photo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Gallery Photo
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Uploaded</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(photo.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Caption</label>
                      {editingCaption === photo.id ? (
                        <div className="mt-1 space-y-2">
                          <textarea
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add a caption..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateCaption(photo.id, captionText)}
                              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              <FaCheck className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEditCaption}
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-1 text-sm"
                            >
                              <FaTimes className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <p className="text-sm text-gray-900">
                            {photo.caption || 'No caption'}
                          </p>
                          {isOwner && (
                            <button
                              onClick={() => startEditCaption(photo)}
                              className="mt-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {photo.caption ? 'Edit caption' : 'Add caption'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isOwner && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          {!photo.isProfilePhoto && (
                            <button
                              onClick={() => handleSetProfilePhoto(photo.id)}
                              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <FaStar className="w-4 h-4" />
                              <span>Set as Profile Photo</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                            <span>Delete Photo</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoManager; 