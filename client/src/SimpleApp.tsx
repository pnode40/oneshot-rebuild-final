import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 OneShot Frontend is Working!</h1>
      <p>This is a simple React component to verify the frontend is functioning.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>System Status:</h3>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ TypeScript is compiling</li>
          <li>✅ Vite dev server is running</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleApp; 