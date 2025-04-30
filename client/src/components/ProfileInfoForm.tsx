import React, { useState, ChangeEvent, FormEvent } from 'react';

const ProfileInfoForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [highSchool, setHighSchool] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [fortyYardDash, setFortyYardDash] = useState('');
  const [benchPress, setBenchPress] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Submission logic will be added later
    console.log('Form data:', {
      fullName, email, highSchool,
      heightFt, heightIn, weight,
      fortyYardDash, benchPress, position
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700 mb-1">High School</label>
        <input
          type="text"
          id="highSchool"
          value={highSchool}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setHighSchool(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <h3 className="text-lg font-semibold mb-3 mt-6 border-t pt-4">Athletic Metrics</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="heightFt" className="sr-only">Height (Feet)</label>
            <input
              type="number"
              id="heightFt"
              placeholder="Feet"
              value={heightFt}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeightFt(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="heightIn" className="sr-only">Height (Inches)</label>
            <input
              type="number"
              id="heightIn"
              placeholder="Inches"
              value={heightIn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeightIn(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="fortyYardDash" className="block text-sm font-medium text-gray-700 mb-1">40-Yard Dash (seconds)</label>
        <input
          type="number"
          step="0.01"
          id="fortyYardDash"
          value={fortyYardDash}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFortyYardDash(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="benchPress" className="block text-sm font-medium text-gray-700 mb-1">Bench Press Max (lbs)</label>
        <input
          type="number"
          id="benchPress"
          value={benchPress}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBenchPress(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
      >
        Submit
      </button>
    </form>
  );
};

export default ProfileInfoForm; 