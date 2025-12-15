import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // This will include Tailwind
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is loaded
import { Analytics } from '@vercel/analytics/react';
import { testApiConnection, runNetworkDiagnostics } from './utils/apiTest.js';

// Import test utilities (makes them available in the browser console)
import './utils/testCreateGroup';

// Make the API test function available in the browser console
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.runNetworkDiagnostics = runNetworkDiagnostics;
  console.log('API test utilities available:');
  console.log('- window.testApiConnection() - Basic API connectivity test');
  console.log('- window.runNetworkDiagnostics() - Comprehensive network diagnostics');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
    <Analytics />
  </React.StrictMode>
);