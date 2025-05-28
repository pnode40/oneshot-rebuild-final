import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PhotoIcon,
  SparklesIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram,
  FaTiktok,
  FaSnapchat
} from 'react-icons/fa';

interface OGImageStatus {
  hasOgImages: boolean;
  ogImages: { [key: string]: { url: string; template: string; generatedAt: string } };
  lastGenerated?: string;
  selectedPhotoId?: string;
  selectedPhoto?: any;
  actionPhotosCount: number;
  canGenerate: boolean;
  serviceStatus: 'available' | 'unavailable';
  maxSlots: number;
  userTier: 'free' | 'viral' | 'premium';
  slotsUsed: number;
}

interface Template {
  template: string;
  tier: string;
  locked: boolean;
}

interface TemplateData {
  templates: Template[];
  maxSlots: number;
  userTier: 'free' | 'viral' | 'premium';
  tiers: {
    free: { slots: number; templates: number; price: string };
    viral: { slots: number; templates: number; price: string };
    premium: { slots: number; templates: number; price: string };
  };
}

interface ActionPhoto {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

interface OGImageManagerProps {
  athleteProfileId: string;
  isOwner: boolean;
}

const OGImageManager: React.FC<OGImageManagerProps> = ({ athleteProfileId, isOwner }) => {
  const [status, setStatus] = useState<OGImageStatus | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [actionPhotos, setActionPhotos] = useState<ActionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('minimal');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchOGImageStatus();
    fetchTemplateData();
    fetchActionPhotos();
  }, [athleteProfileId]);

  const fetchOGImageStatus = async () => {
    try {
      const response = await axios.get('/api/v1/og-image/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch OG image status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateData = async () => {
    try {
      const response = await axios.get('/api/v1/og-image/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTemplateData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch template data:', error);
    }
  };

  const fetchActionPhotos = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPhotos: ActionPhoto[] = [
        {
          id: '1',
          url: '/uploads/action-photos/action1.jpg',
          filename: 'touchdown_celebration.jpg',
          uploadedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          url: '/uploads/action-photos/action2.jpg',
          filename: 'game_winning_catch.jpg',
          uploadedAt: '2024-01-10T14:20:00Z'
        }
      ];
      setActionPhotos(mockPhotos);
    } catch (error) {
      console.error('Failed to fetch action photos:', error);
    }
  };

  const generateOGImage = async (template: string = selectedTemplate, slot: number = selectedSlot, regenerate: boolean = false) => {
    if (!isOwner) return;
    
    setGenerating(true);
    try {
      const response = await axios.post('/api/v1/og-image/generate', {
        template,
        slot,
        regenerate
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        await fetchOGImageStatus();
        alert('🎉 Your social media image is ready! Time to show off your skills!');
      }
    } catch (error: any) {
      console.error('Failed to generate OG image:', error);
      
      if (error.response?.data?.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        alert(error.response?.data?.message || 'Failed to generate social media image');
      }
    } finally {
      setGenerating(false);
    }
  };

  const selectActionPhoto = async (photoId: string) => {
    if (!isOwner) return;

    try {
      await axios.post('/api/v1/og-image/select-photo', {
        photoId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      await fetchOGImageStatus();
      alert('Action photo selected! Generate new images to see the changes.');
    } catch (error: any) {
      console.error('Failed to select action photo:', error);
      alert(error.response?.data?.message || 'Failed to select action photo');
    }
  };

  const shareToSocial = (platform: string, ogImageUrl?: string) => {
    const profileUrl = `${window.location.origin}/profile/${athleteProfileId}`;
    const shareText = `🏈 Check out my OneShot profile! Ready to take my game to the next level 🔥`;

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}&hashtags=OneShot,Recruiting,Football`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${shareText} ${profileUrl}`);
        alert('Caption and link copied! Paste in your Instagram story or post.');
        return;
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const downloadOGImage = async (ogImageUrl: string) => {
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'oneshot-profile-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image');
    }
  };

  const getTemplateDisplayName = (template: string) => {
    const names: { [key: string]: string } = {
      minimal: 'Clean',
      bold: 'Bold',
      action: 'Action',
      stats: 'Stats',
      elite: 'Elite',
      signature: 'Signature',
      champion: 'Champion',
      legacy: 'Legacy',
      future: 'Future',
      dynasty: 'Dynasty'
    };
    return names[template] || template;
  };

  const getTemplateDescription = (template: string) => {
    const descriptions: { [key: string]: string } = {
      minimal: 'Clean, professional design',
      bold: 'High contrast, attention-grabbing',
      action: 'Photo-focused with overlay',
      stats: 'Data-driven tech aesthetic',
      elite: 'Luxury black & gold design',
      signature: 'Personal branding style',
      champion: 'Victory-themed design',
      legacy: 'Timeless classic look',
      future: 'Modern tech aesthetic',
      dynasty: 'Elite legacy design'
    };
    return descriptions[template] || 'Premium template';
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <PhotoIcon className="w-4 h-4" />;
      case 'viral': return <FireIcon className="w-4 h-4" />;
      case 'premium': return <StarIcon className="w-4 h-4" />;
      default: return <PhotoIcon className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-gray-600 bg-gray-100';
      case 'viral': return 'text-orange-600 bg-orange-100';
      case 'premium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
          Social Media Images
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create stunning Nike-style social media images that make recruiters stop scrolling. 
          Professional graphics that get you noticed and recruited.
        </p>
      </div>

      {/* User Tier Status */}
      {status && templateData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon(status.userTier)}
              <div>
                <h3 className="font-bold text-gray-900 capitalize">{status.userTier} Tier</h3>
                <p className="text-sm text-gray-600">
                  {status.slotsUsed}/{status.maxSlots} image slots used • {templateData.templates.filter(t => !t.locked).length} templates available
                </p>
              </div>
            </div>
            {status.userTier !== 'premium' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      )}

      {/* Service Status */}
      {status && !status.canGenerate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">Service Temporarily Unavailable</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Image generation service is currently unavailable. Please try again later.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current OG Images */}
      {status && status.hasOgImages && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Social Media Images</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(status.ogImages).map(([slotKey, imageData]) => {
              const slotNumber = slotKey.replace('slot', '');
              return (
                <div key={slotKey} className="relative group">
                  <div className="relative">
                    <img
                      src={imageData.url}
                      alt={`Social Media Image ${slotNumber}`}
                      className="w-full aspect-[1200/630] object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setPreviewImage(imageData.url);
                        setShowPreview(true);
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      Slot {slotNumber} • {getTemplateDisplayName(imageData.template)}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => shareToSocial('copy', imageData.url)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => downloadOGImage(imageData.url)}
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => generateOGImage(imageData.template, parseInt(slotNumber), true)}
                        disabled={generating || !status.canGenerate}
                        className="flex items-center justify-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Selection */}
      {isOwner && status?.canGenerate && templateData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Style</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {templateData.templates.map((template) => (
              <button
                key={template.template}
                onClick={() => {
                  if (template.locked) {
                    setShowUpgradeModal(true);
                  } else {
                    setSelectedTemplate(template.template);
                  }
                }}
                disabled={template.locked}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === template.template && !template.locked
                    ? 'border-blue-600 bg-blue-50'
                    : template.locked
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {template.locked && (
                  <div className="absolute top-2 right-2">
                    <LockClosedIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${getTierColor(template.tier)}`}>
                  {getTierIcon(template.tier)}
                  {template.tier.toUpperCase()}
                </div>
                
                <h4 className="font-medium text-gray-900">{getTemplateDisplayName(template.template)}</h4>
                <p className="text-sm text-gray-600 mt-1">{getTemplateDescription(template.template)}</p>
              </button>
            ))}
          </div>

          {/* Slot Selection */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Select Image Slot</h4>
            <div className="flex gap-2">
              {Array.from({ length: status.maxSlots }, (_, i) => i + 1).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedSlot === slot
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Slot {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => generateOGImage()}
              disabled={generating || templateData.templates.find(t => t.template === selectedTemplate)?.locked}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-medium mx-auto disabled:opacity-50"
            >
              <SparklesIcon className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : `Generate ${getTemplateDisplayName(selectedTemplate)} Image`}
            </button>
          </div>
        </div>
      )}

      {/* No Images State */}
      {status && !status.hasOgImages && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Social Media Images Yet</h4>
            <p className="text-gray-600 mb-6">
              Create your first Nike-style social media image to start getting noticed by recruiters!
            </p>
            
            {isOwner && status.canGenerate && (
              <button
                onClick={() => generateOGImage()}
                disabled={generating}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all font-medium mx-auto"
              >
                <SparklesIcon className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Creating Your Image...' : 'Create Social Media Image'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Photos Selection */}
      {isOwner && actionPhotos.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Action Photo</h3>
          <p className="text-gray-600 mb-6">
            Select your best action shot to use in your social media images. This will make your posts stand out!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {actionPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                  status?.selectedPhotoId === photo.id
                    ? 'ring-4 ring-blue-600 ring-offset-2'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => selectActionPhoto(photo.id)}
              >
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-32 object-cover"
                />
                {status?.selectedPhotoId === photo.id && (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <CheckCircleIcon className="w-8 h-8 text-blue-600 bg-white rounded-full" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-xs truncate">{photo.filename}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              🚀 Share Your Profile!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Show recruiters what you're made of. Share your profile and get discovered!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <FaTwitter className="w-5 h-5" />
                Twitter
              </button>
              
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
                Facebook
              </button>
              
              <button
                onClick={() => shareToSocial('instagram')}
                className="flex items-center justify-center gap-2 p-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
                Instagram
              </button>
              
              <button
                onClick={() => shareToSocial('copy')}
                className="flex items-center justify-center gap-2 p-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                Copy Link
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && templateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              🔥 Unlock Premium Templates
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-orange-600">Viral Tier</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{templateData.tiers.viral.price}</p>
                <p className="text-sm">Unlock 4 premium templates + 3 image slots</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-bold text-yellow-600">Premium Tier</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{templateData.tiers.premium.price}</p>
                <p className="text-sm">All 10 Nike-style templates + 10 image slots</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // TODO: Implement upgrade flow
                  alert('Upgrade feature coming soon!');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={previewImage}
              alt="Social Media Preview"
              className="w-full rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OGImageManager; 