#!/bin/bash

# ElevareAI User Management Script
# This script allows you to add your own login credentials to the platform

echo "🚀 ElevareAI User Management"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the elevareai-demo directory"
    exit 1
fi

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Compile TypeScript if needed
if [ ! -d "dist" ] || [ "src/scripts/addUser.ts" -nt "dist/scripts/addUser.js" ]; then
    echo "🔨 Compiling TypeScript..."
    npx tsc
    echo ""
fi

# Run the user creation script
echo "Adding new user to the platform..."
echo ""
node dist/scripts/addUser.js

echo ""
echo "✨ Done!"
