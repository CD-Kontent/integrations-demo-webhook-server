#!/bin/bash

# Render Deployment Helper Script for Webhook Server Folder
# This script helps you deploy your webhook server to Render

echo "🚀 Render Deployment Helper for Kontent.ai Webhook Server"
echo "========================================================"
echo ""

# Check if we're in the Webhook Server directory
if [ ! -f "package.json" ] || [ ! -f "server.production.js" ]; then
    echo "❌ Error: Make sure you're in the Webhook Server directory"
    echo "   Current directory: $(pwd)"
    echo "   Required files: package.json, server.production.js"
    echo ""
    echo "💡 Tip: Navigate to the Webhook Server folder first"
    exit 1
fi

echo "✅ Found required files in Webhook Server directory"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found"
    echo "   This file is required for Render deployment"
    exit 1
fi

echo "✅ Found render.yaml configuration"
echo ""

# Check if .gitignore exists and excludes .env
if [ ! -f ".gitignore" ]; then
    echo "⚠️  Warning: .gitignore not found"
    echo "   Consider creating one to exclude sensitive files"
else
    if grep -q "\.env" .gitignore; then
        echo "✅ .gitignore properly configured (excludes .env)"
    else
        echo "⚠️  Warning: .env not in .gitignore"
        echo "   Add '.env' to .gitignore to protect your secrets"
    fi
fi

echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Check if production server can start
echo "🧪 Testing production server..."
timeout 10s node server.production.js > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ Production server starts successfully (timeout after 10s)"
elif [ $? -eq 0 ]; then
    echo "✅ Production server starts successfully"
else
    echo "❌ Production server failed to start"
    echo "   Check your configuration and environment variables"
    exit 1
fi

echo ""

echo "🎯 Ready for Render Deployment!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub (from Webhook Server folder):"
echo "   git add ."
echo "   git commit -m 'Deploy to Render'"
echo "   git push origin main"
echo ""
echo "2. Go to [render.com](https://render.com) and:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Select this repository"
echo "   - Render will auto-detect your configuration"
echo ""
echo "3. Set environment variables in Render:"
echo "   - WEBHOOK_SECRET = Your Kontent.ai webhook secret"
echo "   - NODE_ENV = production (optional, auto-set)"
echo ""
echo "4. Click 'Create Web Service' and wait for deployment"
echo ""
echo "5. Update Kontent.ai webhook URL to:"
echo "   https://your-service-name.onrender.com/webhook"
echo ""
echo "6. Test your webhook with the updated URL"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "📁 Note: Your project is in the Webhook Server folder"
echo "   Make sure this folder structure is preserved in your GitHub repo"
echo ""
echo "Good luck with your deployment! 🚀"
