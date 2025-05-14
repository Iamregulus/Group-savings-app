import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // This will include Tailwind
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is loaded

// Import test utilities (makes them available in the browser console)
import './utils/testCreateGroup';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);