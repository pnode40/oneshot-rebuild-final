import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'athlete' as 'athlete' | 'recruiter' | 'admin' | 'parent',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };
      
      const success = await register(userData);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm mx-auto w-full p-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-tight text-[#0a1128]">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-[#ff6b35] rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-[#0a1128] mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-[#0a1128] mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#0a1128] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#0a1128] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0a1128] mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-[#0a1128] mb-1">
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
            >
              <option value="athlete">Athlete</option>
              <option value="recruiter">Recruiter</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-10 px-4 font-semibold uppercase tracking-wide bg-[#00c2ff] text-white rounded-lg hover:bg-[#ff6b35] transition-colors duration-200 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="text-center">
            <p className="mt-4 text-center text-gray-600">
              Already have an account? <Link to="/login" className="text-[#00c2ff] hover:text-[#ff6b35]">Log In</Link>
            </p>
          </div>
        </form>
        
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            OneShot • Built for athletes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 