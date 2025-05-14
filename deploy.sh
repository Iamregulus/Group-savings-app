#!/bin/bash

# Group Savings App Deployment Script
echo "🚀 Starting deployment process for Group Savings App..."

# Step 1: Make sure all changes are committed
echo "📝 Checking git status..."
git status

# Prompt for confirmation
read -p "Continue with deployment? (y/n) " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
  echo "Deployment cancelled."
  exit 1
fi

# Step 2: Add all changes
echo "➕ Adding changes to git..."
git add .

# Step 3: Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"

# Step 4: Push to main branch
echo "⬆️ Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub!"
echo "ℹ️ This will trigger automatic deployments:"
echo "   - Backend: Railway will deploy changes to app.py and other backend files"
echo "   - Frontend: Vercel will deploy changes to the frontend code"

echo "🔄 Checking deployment status..."
echo "  - Railway: https://railway.app/project/your-project-id/service/your-service-id"
echo "  - Vercel: https://vercel.com/your-username/group-savings-app"

echo "🧪 After deployment completes, test the connection with:"
echo "  1. Open https://group-savings-app-mu.vercel.app/"
echo "  2. Open browser console and run: window.runNetworkDiagnostics()"

echo "🏁 Deployment process completed!" 