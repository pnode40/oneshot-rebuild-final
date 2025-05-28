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

  // Completely redesigned mobile-first approach
  return (
    <div style={{
      backgroundColor: "#0a1128",
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
      padding: 0,
    }}>
      <div style={{
        width: "100%",
        maxWidth: "350px",
        padding: "0 16px",
        boxSizing: "border-box",
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "24px",
          width: "100%",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>SIGN IN</h2>
          
          {error && (
            <div style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#ffeeee",
              color: "#ff6b35",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="email" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                marginBottom: "4px",
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                marginBottom: "4px",
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 16px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                backgroundColor: "#00c2ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#666" }}>
                New to OneShot? <Link to="/register" style={{ color: "#00c2ff", textDecoration: "none" }}>Create an account</Link>
              </p>
            </div>
          </form>
          
          <div style={{ 
            marginTop: "32px", 
            paddingTop: "16px", 
            borderTop: "1px solid #f0f0f0", 
            textAlign: "center" 
          }}>
            <p style={{ fontSize: "12px", color: "#999" }}>
              OneShot • Built for athletes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 