#!/bin/bash

# Fix Docker PATH for macOS
# Run this script in your Mac terminal: bash fix-docker-path.sh

echo "🔧 Fixing Docker PATH configuration..."

# Check if Docker Desktop is installed
if [ ! -d "/Applications/Docker.app" ]; then
    echo "❌ Docker Desktop not found at /Applications/Docker.app"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Create .zshrc if it doesn't exist
if [ ! -f ~/.zshrc ]; then
    echo "📝 Creating ~/.zshrc..."
    touch ~/.zshrc
fi

# Add Docker to PATH if not already there
if ! grep -q "Docker.app" ~/.zshrc; then
    echo "➕ Adding Docker to PATH in ~/.zshrc..."
    echo '' >> ~/.zshrc
    echo '# Docker Desktop CLI tools' >> ~/.zshrc
    echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc
    echo '✅ Docker PATH added to ~/.zshrc'
else
    echo "ℹ️  Docker PATH already configured in ~/.zshrc"
fi

# Source the updated configuration
echo "🔄 Reloading shell configuration..."
source ~/.zshrc

# Try to find docker
DOCKER_LOCATIONS=(
    "/Applications/Docker.app/Contents/Resources/bin/docker"
    "/usr/local/bin/docker"
    "$HOME/.docker/bin/docker"
)

echo ""
echo "🔍 Searching for Docker CLI..."
for location in "${DOCKER_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        echo "✅ Found Docker at: $location"
        $location --version
        DOCKER_FOUND=true
        break
    fi
done

if [ -z "$DOCKER_FOUND" ]; then
    echo ""
    echo "⚠️  Docker CLI not found in standard locations."
    echo ""
    echo "Try these steps:"
    echo "1. Open Docker Desktop application"
    echo "2. Wait for it to fully start (whale icon in menu bar should be steady)"
    echo "3. Go to Docker Desktop → Preferences → Resources → Advanced"
    echo "4. Make sure 'Enable CLI' or 'Install CLI tools' is checked"
    echo "5. Restart Docker Desktop"
    echo "6. Close and reopen your terminal"
    echo ""
    echo "If that doesn't work, try reinstalling Docker Desktop:"
    echo "  brew install --cask docker"
    echo ""
fi

echo ""
echo "🔄 Please close this terminal window and open a new one for changes to take effect."
echo "Then try: docker --version"
