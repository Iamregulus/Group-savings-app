import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // This will include Tailwind
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is loaded
import { Analytics } from '@vercel/analytics/react';

// Import test utilities (makes them available in the browser console)
import './utils/testCreateGroup';
import './utils/apiTest'; // Import API test utility

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);