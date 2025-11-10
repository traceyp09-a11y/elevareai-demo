#!/bin/bash
# Executive Dashboard Verification Script

echo "🔍 Executive Dashboard Verification"
echo "===================================="
echo ""

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Check containers
echo "📦 Checking Docker containers..."
docker compose ps

echo ""
echo "🔄 Restarting containers to pick up latest code..."
docker compose restart

echo ""
echo "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

echo ""
echo "🧪 Testing Backend API..."
echo "---"

# Test Executive Dashboard endpoint
RESPONSE=$(curl -s http://localhost:3001/api/executive/dashboard)

if [ -z "$RESPONSE" ]; then
    echo "❌ Backend not responding"
    echo "Run: docker compose logs backend"
    exit 1
fi

# Check if response contains expected data
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Backend API responding"
else
    echo "❌ Backend API error"
    echo "$RESPONSE"
    exit 1
fi

# Check for status fields
if echo "$RESPONSE" | grep -q '"status"'; then
    echo "✅ Status fields present in API response"
else
    echo "⚠️  Status fields missing - may need full rebuild"
    echo "Run: docker compose down && docker compose build --no-cache && docker compose up -d"
fi

echo ""
echo "🌐 Frontend URLs:"
echo "   Executive Dashboard: http://localhost:5173/executive"
echo "   HR Analytics: http://localhost:5173/"
echo "   HSE Analytics: http://localhost:5173/hse"
echo ""

echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5173/executive in your browser"
echo "2. Check browser console (F12) for any errors"
echo "3. Navigate between departments using the top navigation"
echo ""
