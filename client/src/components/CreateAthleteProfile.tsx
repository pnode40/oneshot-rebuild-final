import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaFootballBall, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/auth';

const CreateAthleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sport: 'Football',
    primaryPosition: 'QB',
    graduationYear: new Date().getFullYear() + 1,
    city: '',
    state: '',
    highSchoolName: '',
    heightFeet: '',
    heightInches: '',
    weightLbs: ''
  });

  const positions = [
    { value: 'QB', label: 'Quarterback' },
    { value: 'WR', label: 'Wide Receiver' },
    { value: 'RB', label: 'Running Back' },
    { value: 'TE', label: 'Tight End' },
    { value: 'OL', label: 'Offensive Line' },
    { value: 'DL', label: 'Defensive Line' },
    { value: 'LB', label: 'Linebacker' },
    { value: 'DB', label: 'Defensive Back' },
    { value: 'K', label: 'Kicker' },
    { value: 'P', label: 'Punter' },
    { value: 'LS', label: 'Long Snapper' },
    { value: 'ATH', label: 'Athlete' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate total height in inches
      const totalHeightInches = formData.heightFeet && formData.heightInches
        ? (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches)
        : null;

      const response = await fetch('/api/athlete-profile/me', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          sport: formData.sport,
          primaryPosition: formData.primaryPosition,
          graduationYear: formData.graduationYear,
          city: formData.city,
          state: formData.state,
          highSchoolName: formData.highSchoolName,
          heightInches: totalHeightInches,
          weightLbs: formData.weightLbs ? parseInt(formData.weightLbs) : null,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Navigate to the profile management page
        navigate(`/profile-management/${data.data.userId}`);
      } else {
        setError(data.message || 'Failed to create profile');
      }
    } catch (err) {
      setError('An error occurred while creating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FaUser className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Athlete Profile</h1>
          <p className="text-gray-600">Let's get you set up with your recruiting profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Athletic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaFootballBall className="mr-2 text-blue-600" />
              Athletic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Position *
                </label>
                <select
                  name="primaryPosition"
                  value={formData.primaryPosition}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="heightFeet"
                      value={formData.heightFeet}
                      onChange={handleChange}
                      min="3"
                      max="8"
                      placeholder="Feet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="heightInches"
                      value={formData.heightInches}
                      onChange={handleChange}
                      min="0"
                      max="11"
                      placeholder="Inches"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="weightLbs"
                  value={formData.weightLbs}
                  onChange={handleChange}
                  min="50"
                  max="500"
                  placeholder="Weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* School & Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              School & Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  High School Name
                </label>
                <input
                  type="text"
                  name="highSchoolName"
                  value={formData.highSchoolName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    placeholder="TX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAthleteProfile; 