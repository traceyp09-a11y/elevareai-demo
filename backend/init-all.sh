#!/bin/bash

echo "🔄 Complete ElevareAI Database Initialization"
echo "=============================================="
echo ""
echo "This will initialize ALL modules:"
echo "  ✓ HR Analytics"
echo "  ✓ HSE Analytics"
echo "  ✓ Operations"
echo "  ✓ Quality Control"
echo "  ✓ Supply Chain"
echo "  ✓ Finance"
echo "  ✓ Sales"
echo "  ✓ Marketing"
echo "  ✓ Customer Success"
echo "  ✓ Administration/IT"
echo "  ✓ Authentication System"
echo ""
echo "⚠️  WARNING: This will RECREATE the database!"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting initialization..."
echo ""

npx ts-node src/scripts/initAllModules.ts

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Database initialization complete!"
    echo ""
    echo "🚀 Start the server with: npm start"
    echo "   Or use auto-restart: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Initialization failed. Check errors above."
    echo ""
    exit 1
fi
