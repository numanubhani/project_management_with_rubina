import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully: ', registration);
      })
      .catch(registrationError => {
        // Silently fail if service worker file doesn't exist (development)
        if (import.meta.env.DEV) {
          console.warn('Service Worker registration skipped in development:', registrationError);
        } else {
          console.error('Service Worker registration failed: ', registrationError);
        }
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);