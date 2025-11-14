# Docker Setup Instructions for macOS

## Problem
Getting "zsh: command not found: docker" even though Docker Desktop is running.

## Quick Fix Option 1: Run the Setup Script

```bash
cd ~/elevareai-demo
bash fix-docker-path.sh
```

Then close your terminal and open a new one.

---

## Manual Fix Option 2: Step-by-Step

### Step 1: Ensure Docker Desktop is Fully Started
1. Open Docker Desktop application
2. Wait for the whale icon in the menu bar to become steady (not animated)
3. This can take 1-2 minutes on first launch

### Step 2: Add Docker to Your PATH

Open your terminal and run:

```bash
# Create .zshrc if it doesn't exist
touch ~/.zshrc

# Add Docker to PATH
echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc

# Reload your shell configuration
source ~/.zshrc
```

### Step 3: Close and Reopen Terminal
The changes won't take effect in your current terminal window. You must:
1. Close your terminal completely (⌘Q)
2. Open a new terminal window
3. Test: `docker --version`

### Step 4: Verify Docker is Working

```bash
docker --version
docker compose version
```

You should see version numbers displayed.

---

## Option 3: Install via Homebrew (Alternative)

If the above doesn't work, you can install Docker via Homebrew:

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Open Docker Desktop
open /Applications/Docker.app

# Wait for initialization, then test
docker --version
```

---

## Option 4: Create Symlink Manually

If Docker is installed but not in PATH, create a symlink:

```bash
# This requires admin password
sudo ln -s /Applications/Docker.app/Contents/Resources/bin/docker /usr/local/bin/docker
sudo ln -s /Applications/Docker.app/Contents/Resources/bin/docker-compose /usr/local/bin/docker-compose
```

---

## Start the ElevareAI Platform

Once Docker is working, start the platform:

```bash
cd ~/elevareai-demo
docker compose up
```

Then open your browser to: **http://localhost:3000**

Navigate to the new **ROI Dashboard**: **http://localhost:3000/roi**

---

## Still Not Working?

### Check Docker Desktop Settings
1. Open Docker Desktop
2. Go to Preferences (gear icon) → Resources → Advanced
3. Ensure "Enable CLI" is checked (if available)
4. Restart Docker Desktop

### Completely Reinstall Docker Desktop
1. Quit Docker Desktop
2. Delete: `/Applications/Docker.app`
3. Delete: `~/Library/Group Containers/group.com.docker`
4. Delete: `~/Library/Containers/com.docker.docker`
5. Empty Trash
6. Download fresh copy from: https://www.docker.com/products/docker-desktop
7. Install and restart your Mac

---

## Testing Checklist

After fixing, run these commands to verify everything works:

```bash
✓ docker --version           # Should show: Docker version X.X.X
✓ docker compose version     # Should show: Docker Compose version X.X.X
✓ docker ps                  # Should show empty list (or running containers)
✓ cd ~/elevareai-demo
✓ docker compose up          # Should start building/running containers
```

---

**Need Help?** Check Docker Desktop logs:
- Docker Desktop → Troubleshoot → View Logs
