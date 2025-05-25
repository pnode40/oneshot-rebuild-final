import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaPlay,
  FaGripVertical,
  FaSave,
  FaTimes,
  FaYoutube,
  FaVimeoV,
  FaVideo,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';

interface VideoLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  mediaType: 'highlight_video' | 'game_film' | 'training_clip' | 'skills_video';
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoLinkManagerProps {
  athleteProfileId: string;
  isOwner: boolean;
}

const VideoLinkManager: React.FC<VideoLinkManagerProps> = ({ athleteProfileId, isOwner }) => {
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Form state for adding/editing videos
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    mediaType: 'highlight_video' as VideoLink['mediaType']
  });

  useEffect(() => {
    fetchVideos();
  }, [athleteProfileId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/videos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const result = await response.json();
      setVideos(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    try {
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add video: ${response.status}`);
      }

      const result = await response.json();
      setVideos([...videos, result.data]);
      setIsAddingVideo(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
    }
  };

  const handleEditVideo = async (videoId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update video: ${response.status}`);
      }

      const result = await response.json();
      setVideos(videos.map(video => video.id === videoId ? result.data : video));
      setEditingVideoId(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video link?')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/athlete/${athleteProfileId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete video: ${response.status}`);
      }

      setVideos(videos.filter(video => video.id !== videoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      mediaType: 'highlight_video'
    });
  };

  const startEdit = (video: VideoLink) => {
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      mediaType: video.mediaType
    });
    setEditingVideoId(video.id);
    setIsAddingVideo(false);
  };

  const cancelEdit = () => {
    setEditingVideoId(null);
    setIsAddingVideo(false);
    resetForm();
  };

  const getVideoIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <FaYoutube className="text-red-500" />;
    } else if (url.includes('vimeo.com')) {
      return <FaVimeoV className="text-blue-500" />;
    } else {
      return <FaVideo className="text-gray-500" />;
    }
  };

  const getMediaTypeLabel = (mediaType: VideoLink['mediaType']) => {
    switch (mediaType) {
      case 'highlight_video': return 'Highlight Reel';
      case 'game_film': return 'Game Film';
      case 'training_clip': return 'Training Clip';
      case 'skills_video': return 'Skills Video';
      default: return 'Video';
    }
  };

  const getMediaTypeColor = (mediaType: VideoLink['mediaType']) => {
    switch (mediaType) {
      case 'highlight_video': return 'bg-purple-100 text-purple-800';
      case 'game_film': return 'bg-blue-100 text-blue-800';
      case 'training_clip': return 'bg-green-100 text-green-800';
      case 'skills_video': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validateUrl = (url: string) => {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const isFormValid = () => {
    return formData.title.trim() && formData.url.trim() && validateUrl(formData.url);
  };

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
          <FaVideo className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Video Links</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsAddingVideo(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Video</span>
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

      {/* Add Video Form */}
      {isAddingVideo && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Video</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Championship Game Highlights"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Type
              </label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as VideoLink['mediaType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="highlight_video">Highlight Reel</option>
                <option value="game_film">Game Film</option>
                <option value="training_clip">Training Clip</option>
                <option value="skills_video">Skills Video</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/watch?v=..."
              />
              {formData.url && !validateUrl(formData.url) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the video content..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVideo}
              disabled={!isFormValid()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSave className="w-4 h-4" />
              <span>Save Video</span>
            </button>
          </div>
        </div>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <FaVideo className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner ? 'Add your first video to showcase your skills' : 'No videos have been added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Video Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getVideoIcon(video.url)}
                    <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                  </div>
                  {isOwner && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEdit(video)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Type Badge */}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMediaTypeColor(video.mediaType)}`}>
                  {getMediaTypeLabel(video.mediaType)}
                </span>

                {/* Description */}
                {video.description && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">{video.description}</p>
                )}

                {/* Video Actions */}
                <div className="flex items-center justify-between mt-4">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaPlay className="w-4 h-4" />
                    <span className="text-sm font-medium">Watch Video</span>
                  </a>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </a>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500 mt-3">
                  Added {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Edit Form */}
              {editingVideoId === video.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Edit Video</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Video title"
                    />
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Video URL"
                    />
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as VideoLink['mediaType'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="highlight_video">Highlight Reel</option>
                      <option value="game_film">Game Film</option>
                      <option value="training_clip">Training Clip</option>
                      <option value="skills_video">Skills Video</option>
                    </select>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditVideo(video.id)}
                      disabled={!isFormValid()}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaSave className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLinkManager; 