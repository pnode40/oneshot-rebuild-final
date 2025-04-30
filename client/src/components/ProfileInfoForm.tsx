import React, { useState, ChangeEvent, FormEvent } from 'react';

const ProfileInfoForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [highSchool, setHighSchool] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Submission logic will be added later
    console.log('Form data:', { fullName, email, highSchool });
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

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Submit
      </button>
    </form>
  );
};

export default ProfileInfoForm; 