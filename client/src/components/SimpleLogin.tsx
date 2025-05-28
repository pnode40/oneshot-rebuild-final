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

  // More compact layout with tighter spacing
  return (
    <div style={{
      backgroundColor: "#0a1128",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
      padding: 0
    }}>
      <div style={{
        width: "90%",
        maxWidth: "320px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        padding: "20px",
        marginTop: "-20px" // Move up slightly to reduce scroll
      }}>
        <h2 style={{ 
          fontSize: "22px", 
          fontWeight: "bold", 
          textAlign: "center", 
          marginBottom: "16px",
          textTransform: "uppercase"
        }}>Sign In</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffeeee', 
            color: '#ff6b35', 
            padding: '8px', 
            borderRadius: '4px', 
            marginBottom: '12px', 
            fontSize: '13px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ margin: 0 }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "3px"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "15px"
              }}
            />
          </div>
          
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "3px"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "15px"
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "40px",
              backgroundColor: "#00c2ff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              marginTop: "8px"
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              New to OneShot? <Link to="/register" style={{ color: "#00c2ff" }}>Create an account</Link>
            </p>
          </div>
          
          <div style={{ marginTop: "16px", paddingTop: "10px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>
              OneShot • Built for athletes
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleLogin; 