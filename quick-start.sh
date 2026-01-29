#!/bin/bash

# Daily Questions App - Quick Start Script
# This script helps you get the app running quickly

echo "🌱 Daily Questions App - Quick Start"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the daily-questions-app directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 You can now run the app with:"
echo ""
echo "  npm start          # Start Expo dev server"
echo "  npm run ios        # Run on iOS simulator"
echo "  npm run android    # Run on Android emulator"
echo "  npm run web        # Run in web browser"
echo ""
echo "📱 To test on your phone:"
echo "  1. Install 'Expo Go' app"
echo "  2. Run 'npm start'"
echo "  3. Scan the QR code"
echo ""
echo "📖 For more info, see README.md"
echo ""
