import React, { useState, ChangeEvent, FormEvent } from 'react';
import { ProfileData } from '../App'; // Import the shared type

// Define props for the component
interface ProfileInfoFormProps {
  formData: ProfileData;
  onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Define the shape for validation errors
interface FormErrors {
  fullName?: string;
  email?: string;
  highSchool?: string;
  position?: string;
  heightFt?: string;
  heightIn?: string;
  weight?: string;
  // Add other fields as needed
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ formData, onFormChange }) => {
  const [errors, setErrors] = useState<FormErrors>({});

  // Basic email validation regex
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Basic number validation (checks if value is a number string)
  const isNumber = (value: string): boolean => {
    return !isNaN(Number(value)) && value.trim() !== '';
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.highSchool.trim()) newErrors.highSchool = 'High School is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';

    if (formData.heightFt && !isNumber(formData.heightFt)) {
      newErrors.heightFt = 'Height (ft) must be a number';
    }
    if (formData.heightIn && !isNumber(formData.heightIn)) {
      newErrors.heightIn = 'Height (in) must be a number';
    }
    if (formData.weight && !isNumber(formData.weight)) {
      newErrors.weight = 'Weight must be a number';
    }
    // Add more number validations if needed (fortyYardDash, benchPress)

    return newErrors;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // No errors, proceed with submission (currently just logging)
      console.log('Submitting valid data:', formData);
      // TODO: Add actual submission logic (e.g., API call)
    } else {
      console.log('Validation failed:', validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md bg-white space-y-4">
      <h2 className="text-xl font-semibold text-oneshot-text">Edit Profile Information</h2>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={onFormChange}
          className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={onFormChange}
          className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* High School */}
      <div>
        <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700 mb-1">High School</label>
        <input
          type="text"
          id="highSchool"
          value={formData.highSchool}
          onChange={onFormChange}
          className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.highSchool ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.highSchool && <p className="text-red-500 text-xs mt-1">{errors.highSchool}</p>}
      </div>

      {/* City, State */}
      <div>
        <label htmlFor="cityState" className="block text-sm font-medium text-gray-700 mb-1">City, State</label>
        <input
          type="text"
          id="cityState"
          value={formData.cityState}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Austin, TX"
        />
        {/* No validation needed for this field based on requirements */}
      </div>

      {/* Graduation Year */}
      <div>
        <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
        <input
          type="number"
          id="gradYear"
          value={formData.gradYear}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 2026"
        />
        {/* No validation needed for this field based on requirements */}
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t text-oneshot-text">Athletic Metrics</h3>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="heightFt" className="sr-only">Height (Feet)</label>
            <input
              type="number"
              id="heightFt"
              placeholder="Feet"
              value={formData.heightFt}
              onChange={onFormChange}
              className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.heightFt ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.heightFt && <p className="text-red-500 text-xs mt-1">{errors.heightFt}</p>}
          </div>
          <div className="flex-1">
            <label htmlFor="heightIn" className="sr-only">Height (Inches)</label>
            <input
              type="number"
              id="heightIn"
              placeholder="Inches"
              value={formData.heightIn}
              onChange={onFormChange}
              className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.heightIn ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.heightIn && <p className="text-red-500 text-xs mt-1">{errors.heightIn}</p>}
          </div>
        </div>
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
        <input
          type="number"
          id="weight"
          value={formData.weight}
          onChange={onFormChange}
          className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
      </div>

      {/* 40-Yard Dash */}
      <div>
        <label htmlFor="fortyYardDash" className="block text-sm font-medium text-gray-700 mb-1">40-Yard Dash (seconds)</label>
        <input
          type="number"
          step="0.01"
          id="fortyYardDash"
          value={formData.fortyYardDash}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {/* Add number validation error display if needed */}
      </div>

      {/* Bench Press */}
      <div>
        <label htmlFor="benchPress" className="block text-sm font-medium text-gray-700 mb-1">Bench Press Max (lbs)</label>
        <input
          type="number"
          id="benchPress"
          value={formData.benchPress}
          onChange={onFormChange}
          className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {/* Add number validation error display if needed */}
      </div>

      {/* Position */}
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <input
          type="text"
          id="position"
          value={formData.position}
          onChange={onFormChange}
          className={`block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
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