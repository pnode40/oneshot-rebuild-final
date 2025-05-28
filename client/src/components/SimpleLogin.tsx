import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../App.css';

interface SimpleLoginProps {
  onSuccess?: () => void;
}

const SimpleLogin: React.FC<SimpleLoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2 className="text-center" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textTransform: 'uppercase' }}>Sign In</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffeeee', 
            color: '#ff6b35', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px', 
            fontSize: '14px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="button"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            New to OneShot? <Link to="/register" style={{ color: '#00c2ff' }}>Create an account</Link>
          </p>
        </div>
        
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#999' }}>
            OneShot • Built for athletes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin; 