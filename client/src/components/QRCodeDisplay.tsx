import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { AthleteProfile } from '../types/athleteProfile';

interface QRCodeDisplayProps {
  profile: AthleteProfile;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ profile, isOpen, onClose }) => {
  const [brightness, setBrightness] = useState<number>(100);
  
  // Generate the QR URL with the special parameter for recruiter version
  const qrUrl = `${window.location.origin}/u/${profile.slug}?qr=true`;
  
  useEffect(() => {
    if (isOpen) {
      // Save current brightness (if possible)
      const currentBrightness = (window as any).screen?.brightness;
      if (currentBrightness) {
        setBrightness(currentBrightness);
      }
      
      // Set to max brightness (note: this requires special permissions on mobile)
      if ((window as any).screen?.setBrightness) {
        (window as any).screen.setBrightness(1.0);
      }
      
      // Prevent screen from sleeping
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {
          // Wake lock request failed - usually system related
        });
      }
      
      // Disable scroll on body
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Restore brightness
      if ((window as any).screen?.setBrightness && brightness !== 100) {
        (window as any).screen.setBrightness(brightness / 100);
      }
      
      // Re-enable scroll
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, brightness]);
  
  // Handle swipe down to close
  useEffect(() => {
    if (!isOpen) return;
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      
      // If swipe down more than 50px, close
      if (touchStartY < touchEndY - 50) {
        onClose();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
      {/* Header with athlete info */}
      <div className="absolute top-0 left-0 right-0 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {profile.firstName} {profile.lastName}
          {profile.jerseyNumber && (
            <span className="ml-2 text-blue-600">#{profile.jerseyNumber}</span>
          )}
        </h2>
        <p className="text-gray-600 mt-1">
          {profile.highSchoolName} • {profile.primaryPosition}
        </p>
      </div>
      
      {/* QR Code */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <QRCode
          value={qrUrl}
          size={window.innerWidth < 400 ? window.innerWidth * 0.7 : 300}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      
      {/* OneShot branding */}
      <div className="mt-6">
        <p className="text-gray-500 text-sm">Powered by</p>
        <p className="text-2xl font-bold text-blue-600">OneShot</p>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-gray-500 text-sm">Swipe down to close</p>
        
        {/* Alternative close button for desktop */}
        <button
          onClick={onClose}
          className="mt-4 md:block hidden px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay; 