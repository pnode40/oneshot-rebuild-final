import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-white border-b py-4 px-6 flex justify-between items-center">
      <div className="text-xl font-bold">
        OneShot
      </div>
      <div>
        {/* Placeholder for future navigation menu */}
        <span className="text-sm text-gray-500">(Nav Menu)</span>
      </div>
    </header>
  );
};

export default Header; 