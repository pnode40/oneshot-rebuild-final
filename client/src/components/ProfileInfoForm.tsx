import React, { useState, ChangeEvent, FormEvent } from 'react';

export interface ProfileData {
  fullName: string;
  email: string;
  highSchool: string;
  position: string;
  gradYear: string;
  cityState: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  fortyYardDash: string;
  benchPress: string;
}

interface Props {
  formData: ProfileData;
  onFormChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfileInfoForm: React.FC<Props> = ({ formData, onFormChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields = ['fullName', 'email', 'highSchool', 'position'];
    requiredFields.forEach((field) => {
      if (!formData[field as keyof ProfileData]?.trim()) {
        newErrors[field] = `${field} is required`;
      }
    });

    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    const numberFields = ['heightFt', 'heightIn', 'weight', 'fortyYardDash', 'benchPress'];
    numberFields.forEach((field) => {
      const value = formData[field as keyof ProfileData];
      if (value && isNaN(Number(value))) {
        newErrors[field] = 'Must be a number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form is valid:', formData);
    } else {
      console.log('Validation errors:', errors);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Basic Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">High School</label>
        <input
          type="text"
          name="highSchool"
          value={formData.highSchool}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.highSchool && <p className="text-red-500 text-xs mt-1">{errors.highSchool}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Position</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
        <input
          type="text"
          name="gradYear"
          value={formData.gradYear}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">City, State</label>
        <input
          type="text"
          name="cityState"
          value={formData.cityState}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Height (Feet & Inches) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Height</label>
        <div className="flex space-x-2">
          <input
            type="text"
            name="heightFt"
            placeholder="Feet"
            value={formData.heightFt}
            onChange={onFormChange}
            className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="heightIn"
            placeholder="Inches"
            value={formData.heightIn}
            onChange={onFormChange}
            className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
          />
        </div>
        {(errors.heightFt || errors.heightIn) && (
          <p className="text-red-500 text-xs mt-1">
            {errors.heightFt || errors.heightIn}
          </p>
        )}
      </div>

      {/* Athletic Metrics */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
        <input
          type="text"
          name="weight"
          value={formData.weight}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">40-Yard Dash (s)</label>
        <input
          type="text"
          name="fortyYardDash"
          value={formData.fortyYardDash}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.fortyYardDash && <p className="text-red-500 text-xs mt-1">{errors.fortyYardDash}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bench Press (lbs)</label>
        <input
          type="text"
          name="benchPress"
          value={formData.benchPress}
          onChange={onFormChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.benchPress && <p className="text-red-500 text-xs mt-1">{errors.benchPress}</p>}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default ProfileInfoForm; 