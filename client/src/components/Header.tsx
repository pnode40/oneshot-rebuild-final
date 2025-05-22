import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 bg-white border-b py-4 px-6 flex justify-between items-center shadow-sm">
      <div className="text-xl font-bold">
        <Link to="/">OneShot</Link>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">
              {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
            </span>
            <button 
              onClick={logout}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link 
              to="/login" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Login
            </Link>
            <span className="text-gray-400">|</span>
            <Link 
              to="/register" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 