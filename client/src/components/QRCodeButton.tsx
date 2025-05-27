import React, { useState, useEffect } from 'react';
import { FaQrcode } from 'react-icons/fa';
import QRCodeDisplay from './QRCodeDisplay';
import { AthleteProfile } from '../types/athleteProfile';
import axios from 'axios';
import { useAuth } from '../context/useAuth';

interface QRCodeButtonProps {
  variant?: 'floating' | 'inline' | 'header';
  className?: string;
}

const QRCodeButton: React.FC<QRCodeButtonProps> = ({ variant = 'floating', className = '' }) => {
  const [showQR, setShowQR] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch the athlete's profile when component mounts
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const response = await axios.get('/api/athlete-profile/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('oneshot_auth_token')}`
            }
          });
          
          if (response.data.success && response.data.data) {
            setProfile(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching profile for QR:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleClick = () => {
    if (profile?.isPublic) {
      setShowQR(true);
    } else {
      alert('Please make your profile public before sharing via QR code.');
    }
  };

  // Don't show button if no profile or still loading
  if (!profile || loading) {
    return null;
  }

  const buttonStyles = {
    floating: 'fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg z-40 transition-all hover:scale-110',
    inline: 'bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2',
    header: 'bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2'
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${buttonStyles[variant]} ${className}`}
        aria-label="Show QR Code"
      >
        <FaQrcode className={variant === 'floating' ? 'text-2xl' : 'text-lg'} />
        {variant !== 'floating' && <span>Share Profile</span>}
      </button>

      {profile && (
        <QRCodeDisplay
          profile={profile}
          isOpen={showQR}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
};

export default QRCodeButton; 