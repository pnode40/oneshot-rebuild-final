import React, { ChangeEvent, FormEvent } from 'react';
import { ProfileData } from '../App'; // Import the shared type

// Define props for the component
interface ProfileInfoFormProps {
  formData: ProfileData;
  onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ formData, onFormChange }) => {

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Submission logic might be lifted up later or handled here
    console.log('Submitting data (from form component):', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-oneshot-text">Edit Profile Information</h2>

      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700 mb-1">High School</label>
        <input
          type="text"
          id="highSchool"
          value={formData.highSchool} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="cityState" className="block text-sm font-medium text-gray-700 mb-1">City, State</label>
        <input
          type="text"
          id="cityState"
          value={formData.cityState}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Austin, TX"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
        <input
          type="number"
          id="gradYear"
          value={formData.gradYear}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 2026"
        />
      </div>

      <h3 className="text-lg font-semibold mb-3 mt-6 border-t pt-4 text-oneshot-text">Athletic Metrics</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="heightFt" className="sr-only">Height (Feet)</label>
            <input
              type="number"
              id="heightFt"
              placeholder="Feet"
              value={formData.heightFt} // Use prop value
              onChange={onFormChange} // Use prop handler
              className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="heightIn" className="sr-only">Height (Inches)</label>
            <input
              type="number"
              id="heightIn"
              placeholder="Inches"
              value={formData.heightIn} // Use prop value
              onChange={onFormChange} // Use prop handler
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
          value={formData.weight} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="fortyYardDash" className="block text-sm font-medium text-gray-700 mb-1">40-Yard Dash (seconds)</label>
        <input
          type="number"
          step="0.01"
          id="fortyYardDash"
          value={formData.fortyYardDash} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="benchPress" className="block text-sm font-medium text-gray-700 mb-1">Bench Press Max (lbs)</label>
        <input
          type="number"
          id="benchPress"
          value={formData.benchPress} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <input
          type="text"
          id="position"
          value={formData.position} // Use prop value
          onChange={onFormChange} // Use prop handler
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
      >
        Save Profile
      </button>
    </form>
  );
};

export default ProfileInfoForm; 