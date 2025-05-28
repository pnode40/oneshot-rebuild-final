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

  // Full-screen login that extends to the edges of the screen
  return (
    <div style={{
      backgroundColor: "#0a1128",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      margin: 0,
      zIndex: 1000, // Ensure it's above any other elements
      width: "100vw", // Full viewport width
      height: "100vh", // Full viewport height
      maxWidth: "none", // Override any max-width from parent
      boxSizing: "border-box" // Ensure padding doesn't add to width
    }}>
      <div style={{
        width: "85%",
        maxWidth: "300px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "15px",
      }}>
        <h2 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          textAlign: "center", 
          margin: "0 0 10px 0",
          color: "#1f2a44"
        }}>SIGN IN</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffeeee', 
            color: '#ff6b35', 
            padding: '4px 6px', 
            borderRadius: '3px', 
            marginBottom: '8px', 
            fontSize: '11px',
            lineHeight: '1.2'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ margin: 0 }}>
          <div style={{ marginBottom: "6px" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              style={{
                width: "100%",
                padding: "5px 8px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                fontSize: "13px",
                height: "32px"
              }}
            />
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              style={{
                width: "100%",
                padding: "5px 8px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                fontSize: "13px",
                height: "32px"
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "34px",
              backgroundColor: "#00c2ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'SIGN IN'}
          </button>
        
          <div style={{ 
            marginTop: "8px", 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center" 
          }}>
            <span style={{ fontSize: "10px", color: "#999" }}>
              OneShot
            </span>
            <span style={{ fontSize: "11px" }}>
              <Link to="/register" style={{ color: "#00c2ff" }}>Create account</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleLogin; 