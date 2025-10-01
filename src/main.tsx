import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set document direction early based on stored preferences
const storedDirection = localStorage.getItem('app-direction');
const storedLanguage = localStorage.getItem('app-language');

if (storedDirection && storedLanguage) {
  document.documentElement.dir = storedDirection;
  document.documentElement.lang = storedLanguage;
}

createRoot(document.getElementById("root")!).render(<App />);
