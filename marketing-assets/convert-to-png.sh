#!/bin/bash

# ElevareAI SVG to PNG Conversion Script
# This script converts all SVG logos to PNG format at multiple resolutions

echo "Converting ElevareAI logos from SVG to PNG..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Please install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Create PNGs at different resolutions
echo "Creating dark logo PNGs..."
convert elevareai-logo-dark.svg -resize 600x elevareai-logo-dark.png
convert elevareai-logo-dark.svg -resize 1200x elevareai-logo-dark@2x.png

echo "Creating light logo PNGs..."
convert elevareai-logo-light.svg -resize 600x elevareai-logo-light.png
convert elevareai-logo-light.svg -resize 1200x elevareai-logo-light@2x.png

echo "Creating icon PNGs..."
convert elevareai-icon.svg -resize 512x512 elevareai-icon-512.png
convert elevareai-icon.svg -resize 256x256 elevareai-icon-256.png
convert elevareai-icon.svg -resize 128x128 elevareai-icon-128.png
convert elevareai-icon.svg -resize 64x64 elevareai-icon-64.png
convert elevareai-icon.svg -resize 32x32 elevareai-icon-32.png

echo "✅ Conversion complete!"
echo ""
echo "Created files:"
echo "  - elevareai-logo-dark.png (600px width)"
echo "  - elevareai-logo-dark@2x.png (1200px width, high-res)"
echo "  - elevareai-logo-light.png (600px width)"
echo "  - elevareai-logo-light@2x.png (1200px width, high-res)"
echo "  - elevareai-icon-512.png (app icon)"
echo "  - elevareai-icon-256.png"
echo "  - elevareai-icon-128.png"
echo "  - elevareai-icon-64.png (favicon)"
echo "  - elevareai-icon-32.png (favicon)"
