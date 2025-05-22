import React, { ReactNode } from 'react';
import Header from './Header'; // Assuming Header.tsx is in the same directory

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-background text-body font-body min-h-screen max-w-screen-lg mx-auto p-4">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout; 