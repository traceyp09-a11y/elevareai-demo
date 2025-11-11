#!/bin/bash
set -e

echo "🗑️  COMPLETE VITE REMOVAL SCRIPT"
echo "================================"
echo ""

# 1. Stop all containers
echo "1. Stopping all containers..."
docker compose down -v
echo "✅ Containers stopped"
echo ""

# 2. Remove all elevare images
echo "2. Removing all ElevareAI Docker images..."
docker images | grep elevare | awk '{print $3}' | xargs -r docker rmi -f || true
echo "✅ Images removed"
echo ""

# 3. Prune Docker build cache
echo "3. Pruning Docker build cache..."
docker builder prune -f
echo "✅ Build cache cleared"
echo ""

# 4. Verify package.json has webpack (not vite)
echo "4. Verifying package.json has webpack..."
if grep -q "webpack serve" frontend/package.json; then
    echo "✅ package.json has webpack"
else
    echo "❌ ERROR: package.json does not have webpack!"
    exit 1
fi
echo ""

# 5. Check for any Vite references
echo "5. Checking for Vite references..."
if grep -qi vite frontend/package.json; then
    echo "❌ ERROR: Found Vite in package.json!"
    grep -i vite frontend/package.json
    exit 1
else
    echo "✅ No Vite references in package.json"
fi
echo ""

# 6. Rebuild frontend from scratch
echo "6. Rebuilding frontend with NO cache..."
docker compose build --no-cache --pull frontend
echo "✅ Frontend rebuilt"
echo ""

# 7. Start containers
echo "7. Starting containers..."
docker compose up -d
echo "✅ Containers started"
echo ""

# 8. Wait for containers to initialize
echo "8. Waiting 10 seconds for initialization..."
sleep 10
echo ""

# 9. Verify webpack is running (not vite)
echo "9. Verifying webpack is running..."
if docker compose exec frontend cat /app/package.json | grep -q "webpack serve"; then
    echo "✅ Container package.json has webpack"
else
    echo "❌ ERROR: Container still has old package.json!"
    docker compose exec frontend cat /app/package.json | grep '"dev"'
    exit 1
fi
echo ""

# 10. Check logs for webpack
echo "10. Checking logs for webpack (not vite)..."
docker compose logs frontend --tail 20 | grep -i webpack && echo "✅ Webpack is running!" || echo "⚠️  Check logs manually"
docker compose logs frontend --tail 20 | grep -i vite && echo "❌ Vite still running!" || echo "✅ No Vite found!"
echo ""

echo "================================"
echo "✅ VITE REMOVAL COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Check logs: docker compose logs frontend -f"
echo "2. Open Executive Dashboard: http://localhost:5173/executive"
echo ""
