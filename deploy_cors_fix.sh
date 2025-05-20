#!/bin/bash

# CORS Fix Deployment Script
echo "🔒 Deploying CORS fixes for Group Savings App..."

# Step 1: Make sure we're in the right directory
cd "$(dirname "$0")"
echo "📂 Working in directory: $(pwd)"

# Step 2: Make backend CORS debug script executable
chmod +x back-end/cors_debug.py
echo "✅ Made CORS debug script executable"

# Step 3: Add all changes
echo "➕ Adding changes to git..."
git add back-end/app.py back-end/cors_debug.py front-end/group_savings/src/services/api.js front-end/group_savings/vercel.json

# Step 4: Commit changes
echo "💾 Committing changes..."
git commit -m "Fix CORS configuration with comprehensive solution"

# Step 5: Push to main branch
echo "⬆️ Pushing to GitHub..."
git push origin main

echo "✅ CORS fixes pushed to GitHub!"
echo "ℹ️ This will trigger automatic deployments on Railway and Vercel"

echo "🔄 After deployment completes, check if the connection works"
echo "📝 If issues persist, run the CORS debug server with:"
echo "   cd back-end && python3 cors_debug.py"
echo "   Then test with: curl -H 'Origin: https://group-savings-app-mu.vercel.app' http://localhost:5001/cors-test"

echo "🏁 Deployment process completed!" 