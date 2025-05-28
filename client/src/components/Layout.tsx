import React, { ReactNode } from 'react';
import Header from './Header'; // Assuming Header.tsx is in the same directory
import QRCodeButton from './QRCodeButton';
import { useAuth } from '../context/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="bg-background text-body font-body min-h-screen w-full mx-auto px-2 sm:px-4 md:max-w-screen-lg">
      <Header />
      <main>{children}</main>
      
      {/* Floating QR Code Button - only show when authenticated */}
      {isAuthenticated && <QRCodeButton variant="floating" />}
    </div>
  );
};

export default Layout; 