import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  highSchool: z.string().min(1, "High school is required"),
  position: z.string().min(1, "Position is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  gpa: z.coerce.number().min(0).max(4.0).optional(),
  highlightLinks: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("private")
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CreateProfileFormProps {
  onSuccess?: () => void;
}

export default function CreateProfileForm({ onSuccess }: CreateProfileFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    highSchool: '',
    position: '',
    height: '',
    weight: 0,
    gpa: undefined,
    highlightLinks: '',
    visibility: 'private'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/profile/me', {
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
    }
  }, [user]);

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
    // Clear any API error or success message when user makes changes
    if (apiError) setApiError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});
    
    try {
      // Validate form data
      const validatedData = profileSchema.parse(formData);
      setIsSubmitting(true);

      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setApiError('You must be logged in to create a profile');
        setIsSubmitting(false);
        return;
      }

      // Send data to the server
      const response = await axios.post('/api/profile', validatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage('Profile created successfully!');
      // Reset form after successful submission
      setFormData({
        name: '',
        highSchool: '',
        position: '',
        height: '',
        weight: 0,
        gpa: undefined,
        highlightLinks: '',
        visibility: 'private'
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
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
      } else if (axios.isAxiosError(error)) {
        // Handle API errors
        setApiError(error.response?.data?.message || 'Failed to create profile. Please try again.');
      } else {
        // Handle unexpected errors
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Your Athletic Profile</h2>
      
      {apiError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {apiError}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {hasProfile ? (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
          You already have a profile. You can update it from your dashboard.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700">
                High School *
              </label>
              <input
                type="text"
                id="highSchool"
                name="highSchool"
                value={formData.highSchool}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.highSchool ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.highSchool && (
                <p className="mt-1 text-sm text-red-600">{errors.highSchool}</p>
              )}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height *
              </label>
              <input
                type="text"
                id="height"
                name="height"
                placeholder="e.g., 6'2&quot; or 188 cm"
                value={formData.height}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.height ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.height && (
                <p className="mt-1 text-sm text-red-600">{errors.height}</p>
              )}
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (lbs) *
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.weight ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
              )}
            </div>

            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">
                GPA (Optional)
              </label>
              <input
                type="number"
                id="gpa"
                name="gpa"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.gpa || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.gpa ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.gpa && (
                <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="highlightLinks" className="block text-sm font-medium text-gray-700">
              Highlight Links (Optional, comma-separated)
            </label>
            <textarea
              id="highlightLinks"
              name="highlightLinks"
              rows={3}
              value={formData.highlightLinks}
              onChange={handleChange}
              placeholder="https://example.com/highlights, https://youtube.com/watch?v=..."
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.highlightLinks ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.highlightLinks && (
              <p className="mt-1 text-sm text-red-600">{errors.highlightLinks}</p>
            )}
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
              Profile Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Public profiles can be discovered by coaches and recruiters.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || hasProfile}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || hasProfile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 