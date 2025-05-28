import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log("Login form submitted, attempting login with:", { email });
    
    try {
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, about to trigger navigation callback...");
        if (onSuccess) {
          onSuccess();
        } else {
          console.warn("Login successful but no onSuccess callback provided");
        }
      } else {
        console.error("Login failed - invalid credentials or server error");
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1128] w-full flex flex-col items-center justify-center px-0 py-8 md:py-12">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
          <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-tight">SIGN IN</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-[#ff6b35] rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c2ff]"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-10 px-4 font-semibold uppercase tracking-wide bg-[#00c2ff] text-white rounded-lg hover:bg-[#ff6b35] transition-colors duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="mt-4 text-center text-sm text-[#f9f9f9]">
              <p className="mt-6 text-center text-gray-600">
                New to OneShot? <Link to="/register" className="text-[#00c2ff] hover:text-[#ff6b35]">Create an account</Link>
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
    </div>
  );
};

export default Login; 