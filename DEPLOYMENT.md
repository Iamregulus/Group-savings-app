# Group Savings App - Deployment Guide

## Recent Changes to Fix Network Error

We have implemented several improvements to fix the network error that was occurring when deploying the app on Vercel:

### Backend Changes

1. **Enhanced CORS Configuration**: Updated the Flask app to explicitly allow requests from Vercel domains.
   - Modified `app.py` to specify allowed origins, methods, and headers
   - Added explicit CORS handling for the API endpoints

### Frontend Changes

1. **Improved API Service Configuration**:
   - Enhanced error handling to better diagnose connection issues
   - Added utility methods to test connectivity with both root and API endpoints
   - Properly configured timeout settings

2. **Enhanced Network Status Checker Component**:
   - Added detailed error reporting with specific error types
   - Implemented a retry mechanism with visual feedback
   - Added more comprehensive error messages based on the type of error

3. **Added Diagnostic Tools**:
   - Created `runNetworkDiagnostics()` utility function accessible in browser console
   - Enhanced logging of connection issues with suggested fixes
   - Added comprehensive testing of different API endpoints

4. **Updated Vercel Configuration**:
   - Modified `vercel.json` to include proper CORS headers
   - Configured environment variables for API URL
   - Ensured build process properly sets the production API URL

## Troubleshooting Network Errors

If you encounter network errors when using the app, follow these steps:

1. **Check Browser Console**: Open browser developer tools (F12) and check for error messages
   - Run `window.runNetworkDiagnostics()` in the console for detailed diagnostics

2. **Verify API Connectivity**:
   - Ensure the Railway backend is running at https://group-savings-app-production.up.railway.app
   - Check if your browser is blocking requests due to CORS issues

3. **Common Issues and Solutions**:
   - **CORS Errors**: Make sure the backend allows requests from your frontend domain
   - **Connection Timeouts**: The backend may be overloaded or temporarily down
   - **API Endpoint Errors**: Ensure the API routes are correctly configured

## Deployment Process

To deploy updates to the application:

1. **Backend (Railway)**:
   - Commit changes to Git and push to the GitHub repository
   - Railway will automatically deploy changes to the backend

2. **Frontend (Vercel)**:
   - Commit changes to Git and push to the GitHub repository
   - Vercel will automatically deploy changes to the frontend

3. **Verify Deployment**:
   - Check Railway deployment status
   - Check Vercel deployment status
   - Test the application to ensure it's working correctly

You can use the provided `deploy.sh` script to automate the Git push process.

## API Configuration

The application is configured to use the following endpoints:

- **Production API**: https://group-savings-app-production.up.railway.app/api
- **Development API**: http://localhost:5000/api (when running locally)

The application automatically selects the appropriate API endpoint based on the environment. 