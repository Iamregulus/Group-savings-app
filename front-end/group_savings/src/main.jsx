import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // This will include Tailwind
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is loaded

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);