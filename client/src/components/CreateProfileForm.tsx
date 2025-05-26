import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { useAuth } from '../context/useAuth';
import { useMutation } from '@tanstack/react-query';
import { getToken } from '../services/api';
import { Link } from 'react-router-dom';
import { FaPencilAlt } from 'react-icons/fa';

// Configure axios base URL
const API_BASE_URL = 'http://localhost:3001';

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  highSchool: z.string().min(1, "High school is required"),
  position: z.string().min(1, "Position is required"),
  heightFt: z.string().min(1, "Height feet is required"),
  heightIn: z.string().min(1, "Height inches is required"),
  weight: z.string().min(1, "Weight is required"),
  email: z.string().email("Valid email is required"),
  gradYear: z.string().optional(),
  cityState: z.string().optional(),
  gpa: z.string().optional(),
  highlightVideoUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CreateProfileFormProps {
  onSuccess?: () => void;
}

// Input field label 
const InputLabel = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#0a1128] flex items-center space-x-1">
    <span>{children}</span>
    <FaPencilAlt className="h-3 w-3 text-gray-400 ml-1" />
  </label>
);

// Section Heading component
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-bold text-[#0a1128] mb-3 pb-1 border-b border-gray-200">
    {children}
  </h3>
);

export default function CreateProfileForm({ onSuccess }: CreateProfileFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: user?.email || '',
    highSchool: '',
    position: '',
    heightFt: '',
    heightIn: '',
    weight: '',
    gradYear: '',
    cityState: '',
    gpa: '',
    highlightVideoUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setHasProfile(true);
        }
      } catch (error) {
        // If 404, user doesn't have a profile yet (which is good)
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setHasProfile(false);
        }
      }
    };

    if (user) {
      checkProfile();
      // Set email from user context
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  // Create Profile Mutation
  const mutation = useMutation({
    mutationFn: async (validatedData: ProfileFormData) => {
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to create a profile');
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/profile`, validatedData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        return response.data;
      } catch (error) {
        // Handle specific error types
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          }
          throw new Error(error.response?.data?.message || 'Failed to save profile. Please try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Reset form after successful submission
      setFormData({
        fullName: '',
        email: user?.email || '',
        highSchool: '',
        position: '',
        heightFt: '',
        heightIn: '',
        weight: '',
        gradYear: '',
        cityState: '',
        gpa: '',
        highlightVideoUrl: ''
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ProfileFormData) => ({ ...prev, [name]: value }));
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear any API error when user makes changes
    if (mutation.error) {
      mutation.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      // Validate form data
      const validatedData = profileSchema.parse(formData);
      
      // Submit the form data using the mutation
      mutation.mutate(validatedData);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-tight text-[#0a1128]">Create Your Profile</h2>
      
      {mutation.isLoading && (
        <div className="mb-4 p-3 bg-[#f9f9f9] text-[#00c2ff] rounded-lg flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00c2ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Creating your profile...</span>
        </div>
      )}
      
      {mutation.isSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          Profile created successfully!
        </div>
      )}
      
      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-100 text-[#ff6b35] rounded-lg">
          {mutation.error instanceof Error && 
           (mutation.error.message.includes("login") || 
            mutation.error.message.includes("Authentication") || 
            mutation.error.message.includes("auth")) ? (
            <div>
              <p>Authentication required.</p> 
              <p className="mt-1">Please <Link to="/login" className="font-medium underline hover:text-[#ff6b35]">log in</Link> to create your profile.</p>
            </div>
          ) : (
            <p>{mutation.error instanceof Error ? mutation.error.message : 'Failed to create profile. Please try again.'}</p>
          )}
        </div>
      )}
      
      {hasProfile ? (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
          You already have a profile. You can update it from your dashboard.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <SectionHeading>Personal Information</SectionHeading>

            <div>
              <InputLabel htmlFor="fullName">
                Full Name *
              </InputLabel>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.fullName ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.fullName}</p>
              )}
            </div>

            <div>
              <InputLabel htmlFor="email">
                Email *
              </InputLabel>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!!user?.email}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.email ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff] ${
                  user?.email ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.email}</p>
              )}
            </div>

            <div>
              <InputLabel htmlFor="highSchool">
                High School *
              </InputLabel>
              <input
                type="text"
                id="highSchool"
                name="highSchool"
                value={formData.highSchool}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.highSchool ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
              />
              {errors.highSchool && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.highSchool}</p>
              )}
            </div>

            <div>
              <InputLabel htmlFor="cityState">
                City, State
              </InputLabel>
              <input
                type="text"
                id="cityState"
                name="cityState"
                placeholder="e.g., Dallas, TX"
                value={formData.cityState}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              />
            </div>
          </div>

          {/* Athletic Stats Section */}
          <div className="space-y-4">
            <SectionHeading>Athletic Stats</SectionHeading>

            <div>
              <InputLabel htmlFor="position">
                Position *
              </InputLabel>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.position ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
              >
                <option value="">Select a position</option>
                <option value="QB">QB - Quarterback</option>
                <option value="RB">RB - Running Back</option>
                <option value="WR">WR - Wide Receiver</option>
                <option value="TE">TE - Tight End</option>
                <option value="OL">OL - Offensive Line</option>
                <option value="DL">DL - Defensive Line</option>
                <option value="LB">LB - Linebacker</option>
                <option value="DB">DB - Defensive Back</option>
                <option value="K">K - Kicker</option>
                <option value="P">P - Punter</option>
                <option value="LS">LS - Long Snapper</option>
                <option value="ATH">ATH - Athlete</option>
              </select>
              {errors.position && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.position}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <InputLabel htmlFor="heightFt">
                  Height (ft) *
                </InputLabel>
                <input
                  type="text"
                  id="heightFt"
                  name="heightFt"
                  placeholder="6"
                  value={formData.heightFt}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                    errors.heightFt ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
                />
                {errors.heightFt && (
                  <p className="mt-1 text-sm text-[#ff6b35]">{errors.heightFt}</p>
                )}
              </div>

              <div>
                <InputLabel htmlFor="heightIn">
                  Height (in) *
                </InputLabel>
                <input
                  type="text"
                  id="heightIn"
                  name="heightIn"
                  placeholder="2"
                  value={formData.heightIn}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                    errors.heightIn ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
                />
                {errors.heightIn && (
                  <p className="mt-1 text-sm text-[#ff6b35]">{errors.heightIn}</p>
                )}
              </div>
            </div>

            <div>
              <InputLabel htmlFor="weight">
                Weight (lbs) *
              </InputLabel>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.weight ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.weight}</p>
              )}
            </div>

            <div>
              <InputLabel htmlFor="gradYear">
                Graduation Year
              </InputLabel>
              <input
                type="text"
                id="gradYear"
                name="gradYear"
                placeholder="2026"
                value={formData.gradYear}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              />
            </div>

            <div>
              <InputLabel htmlFor="gpa">
                GPA (Optional)
              </InputLabel>
              <input
                type="text"
                id="gpa"
                name="gpa"
                placeholder="3.5"
                value={formData.gpa}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border ${
                  errors.gpa ? 'border-[#ff6b35]' : 'border-[#e0e0e0]'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]`}
              />
              {errors.gpa && (
                <p className="mt-1 text-sm text-[#ff6b35]">{errors.gpa}</p>
              )}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4">
            <SectionHeading>Additional Information</SectionHeading>

            <div>
              <InputLabel htmlFor="highlightVideoUrl">
                Highlight Video URL (Optional)
              </InputLabel>
              <input
                type="text"
                id="highlightVideoUrl"
                name="highlightVideoUrl"
                value={formData.highlightVideoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1 block w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={mutation.isLoading || hasProfile || mutation.isSuccess}
              className={`w-full py-2 rounded-lg font-semibold uppercase ${
                mutation.isLoading || hasProfile || mutation.isSuccess
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#00c2ff] text-white hover:bg-[#ff6b35] transition-colors duration-200'
              }`}
            >
              {mutation.isLoading ? 'Creating...' : mutation.isSuccess ? 'Created' : 'Create Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 