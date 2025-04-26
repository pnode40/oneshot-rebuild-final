// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './frontend/App';  // <-- ✅ frontend included!
import './frontend/index.css';     // <-- ✅ frontend included!

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
