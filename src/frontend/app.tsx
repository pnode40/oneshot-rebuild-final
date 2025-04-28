// src/frontend/App.tsx
import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function App() {
    return (
      <>
        <Toaster position="top-center" />
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <h1>Hello, OneShot 👋</h1>
          <p>This page is rendering correctly!</p>
        </div>
      </>
    );
  }
  
  