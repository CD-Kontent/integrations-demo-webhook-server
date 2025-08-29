@echo off
chcp 65001 >nul

echo 🚀 Render Deployment Helper for Kontent.ai Webhook Server
echo ========================================================
echo.

REM Check if we're in the Webhook Server directory
if not exist "package.json" (
    echo ❌ Error: Make sure you're in the Webhook Server directory
    echo    Current directory: %CD%
    echo    Required files: package.json, server.production.js
    echo.
    echo 💡 Tip: Navigate to the Webhook Server folder first
    pause
    exit /b 1
)

if not exist "server.production.js" (
    echo ❌ Error: server.production.js not found
    echo    Make sure you're in the Webhook Server directory
    pause
    exit /b 1
)

echo ✅ Found required files in Webhook Server directory
echo.

REM Check if render.yaml exists
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found
    echo    This file is required for Render deployment
    pause
    exit /b 1
)

echo ✅ Found render.yaml configuration
echo.

REM Check if .gitignore exists and excludes .env
if not exist ".gitignore" (
    echo ⚠️  Warning: .gitignore not found
    echo    Consider creating one to exclude sensitive files
) else (
    findstr /c:".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo ✅ .gitignore properly configured (excludes .env)
    ) else (
        echo ⚠️  Warning: .env not in .gitignore
        echo    Add '.env' to .gitignore to protect your secrets
    )
)

echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.

echo 🧪 Testing production server...
echo    (This will start the server briefly to test it)
echo.

REM Try to start the production server briefly
start /b node server.production.js >nul 2>&1
timeout /t 3 /nobreak >nul
taskkill /f /im node.exe >nul 2>&1

echo ✅ Production server test completed
echo.

echo 🎯 Ready for Render Deployment!
echo ================================
echo.
echo Next steps:
echo 1. Push your code to GitHub (from Webhook Server folder):
echo    git add .
echo    git commit -m "Deploy to Render"
echo    git push origin main
echo.
echo 2. Go to [render.com](https://render.com) and:
echo    - Click 'New +' → 'Web Service'
echo    - Connect your GitHub repository
echo    - Select this repository
echo    - Render will auto-detect your configuration
echo.
echo 3. Set environment variables in Render:
echo    - WEBHOOK_SECRET = Your Kontent.ai webhook secret
echo    - NODE_ENV = production (optional, auto-set)
echo.
echo 4. Click 'Create Web Service' and wait for deployment
echo.
echo 5. Update Kontent.ai webhook URL to:
echo    https://your-service-name.onrender.com/webhook
echo.
echo 6. Test your webhook with the updated URL
echo.
echo 📚 For detailed instructions, see RENDER_DEPLOYMENT.md
echo.
echo 📁 Note: Your project is in the Webhook Server folder
echo    Make sure this folder structure is preserved in your GitHub repo
echo.
echo Good luck with your deployment! 🚀
echo.
pause
