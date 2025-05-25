import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FaChartLine, FaHome, FaShieldAlt, FaUser } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [athleteProfileId, setAthleteProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the athlete profile for the current user
    const fetchAthleteProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch('/api/athlete-profile/by-user', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('oneshot_auth_token')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.id) {
              setAthleteProfileId(data.data.id);
            }
          }
        } catch (error) {
          console.error('Error fetching athlete profile:', error);
        }
      }
    };

    fetchAthleteProfile();
  }, [isAuthenticated, user]);

  return (
    <header className="sticky top-0 bg-white border-b py-4 px-6 flex justify-between items-center shadow-sm z-50">
      <div className="text-xl font-bold">
        <Link to="/" className="text-blue-600 hover:text-blue-700">OneShot</Link>
      </div>
      
      {isAuthenticated && (
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MdDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          {athleteProfileId && (
            <Link 
              to={`/profile-management/${athleteProfileId}`} 
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaUser className="h-4 w-4 mr-1" />
              Profile
            </Link>
          )}
          <Link 
            to="/analytics" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaChartLine className="h-4 w-4 mr-1" />
            Analytics
          </Link>
          <Link 
            to="/security" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaShieldAlt className="h-4 w-4 mr-1" />
            Security
          </Link>
        </nav>
      )}
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">
              {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
            </span>
            <button 
              onClick={logout}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
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