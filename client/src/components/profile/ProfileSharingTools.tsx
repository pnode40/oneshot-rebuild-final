import React, { useState, useRef } from 'react';
import { 
  ShareIcon, 
  LinkIcon, 
  QrCodeIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ProfileSharingToolsProps {
  profileSlug: string;
  profileTitle: string;
  profileDescription: string;
  profileImageUrl?: string;
  onShare?: (platform: string) => void;
  analytics?: {
    totalShares: number;
    totalViews: number;
    topPlatforms: Array<{ platform: string; shares: number }>;
  };
}

interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (url: string, title: string, description: string) => string;
}

const sharePlatforms: SharePlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: (url, title, description) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${description}`)}&url=${encodeURIComponent(url)}`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (url, title, description) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-pink-500 hover:bg-pink-600',
    shareUrl: () => '' // Instagram doesn't support direct URL sharing
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: (url, title, description) => 
      `mailto:?subject=${encodeURIComponent(`Check out ${title}`)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '💬',
    color: 'bg-green-600 hover:bg-green-700',
    shareUrl: (url, title) => 
      `sms:?body=${encodeURIComponent(`Check out ${title}: ${url}`)}`
  }
];

const ProfileSharingTools: React.FC<ProfileSharingToolsProps> = ({
  profileSlug,
  profileTitle,
  profileDescription,
  profileImageUrl,
  onShare,
  analytics
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'share' | 'analytics' | 'qr'>('share');
  const [customMessage, setCustomMessage] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  const profileUrl = `${window.location.origin}/profile/${profileSlug}`;
  const shareText = customMessage || `Check out ${profileTitle} on OneShot!`;

  const handleShare = async (platform: SharePlatform) => {
    if (platform.id === 'copy') {
      await copyToClipboard(profileUrl);
      return;
    }

    if (platform.id === 'instagram') {
      // For Instagram, copy link and show instructions
      await copyToClipboard(profileUrl);
      alert('Link copied! Open Instagram and paste the link in your story or post.');
      return;
    }

    const shareUrl = platform.shareUrl(profileUrl, profileTitle, shareText);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShare?.(platform.id);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      if (linkInputRef.current) {
        linkInputRef.current.select();
        document.execCommand('copy');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const generateQRCode = () => {
    // In a real implementation, you'd use a QR code library like qrcode
    // For now, we'll use a QR code API service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;
  };

  const downloadQRCode = async () => {
    const qrUrl = generateQRCode();
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileSlug}-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#00c2ff] text-white rounded-full hover:bg-[#00a8d6] transition-all"
      >
        <ShareIcon className="w-5 h-5" />
        Share Profile
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Share Profile</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedTab('share')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    selectedTab === 'share'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShareIcon className="w-4 h-4 inline mr-2" />
                  Share
                </button>
                <button
                  onClick={() => setSelectedTab('qr')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    selectedTab === 'qr'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <QrCodeIcon className="w-4 h-4 inline mr-2" />
                  QR Code
                </button>
                {analytics && (
                  <button
                    onClick={() => setSelectedTab('analytics')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      selectedTab === 'analytics'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ChartBarIcon className="w-4 h-4 inline mr-2" />
                    Analytics
                  </button>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedTab === 'share' && (
                <div className="space-y-6">
                  {/* Profile Preview */}
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                    {profileImageUrl && (
                      <img 
                        src={profileImageUrl} 
                        alt={profileTitle}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{profileTitle}</h4>
                      <p className="text-sm text-gray-600">{profileDescription}</p>
                    </div>
                  </div>

                  {/* Custom Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder={`Check out ${profileTitle} on OneShot!`}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Share Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        ref={linkInputRef}
                        type="text"
                        value={profileUrl}
                        readOnly
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(profileUrl)}
                        className={`px-4 py-3 rounded-lg transition-all ${
                          copiedLink
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {copiedLink ? (
                          <CheckIcon className="w-5 h-5" />
                        ) : (
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Share Platforms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Share on Social Media
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {sharePlatforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => handleShare(platform)}
                          className={`flex items-center gap-3 p-4 rounded-xl text-white transition-all ${platform.color}`}
                        >
                          <span className="text-2xl">{platform.icon}</span>
                          <span className="font-medium">{platform.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'qr' && (
                <div className="space-y-6 text-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h4>
                    <p className="text-gray-600 mb-6">
                      Scan this QR code to quickly access the profile on mobile devices
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                      <img
                        src={generateQRCode()}
                        alt="Profile QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={downloadQRCode}
                      className="w-full py-3 px-4 bg-[#00c2ff] text-white rounded-xl hover:bg-[#00a8d6] transition-all"
                    >
                      Download QR Code
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(profileUrl)}
                      className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Copy Profile Link
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>💡 Tip: Print this QR code on business cards, flyers, or recruiting materials</p>
                  </div>
                </div>
              )}

              {selectedTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Sharing Analytics</h4>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalShares}</div>
                      <div className="text-sm text-blue-800">Total Shares</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.totalViews}</div>
                      <div className="text-sm text-green-800">Profile Views</div>
                    </div>
                  </div>

                  {/* Top Platforms */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Top Sharing Platforms</h5>
                    <div className="space-y-2">
                      {analytics.topPlatforms.map((platform, index) => (
                        <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                            <span className="capitalize">{platform.platform}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{platform.shares} shares</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <EyeIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h6 className="font-medium text-yellow-800">Boost Your Visibility</h6>
                        <p className="text-sm text-yellow-700 mt-1">
                          Share your profile on multiple platforms to increase recruiter discovery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSharingTools; 