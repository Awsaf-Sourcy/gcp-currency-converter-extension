#!/bin/bash

# Script to generate PNG icons from SVG
# Requires: inkscape or imagemagick (convert command)

SVG_FILE="public/icons/icon.svg"
ICON_DIR="public/icons"

# Check if inkscape is available
if command -v inkscape &> /dev/null; then
    echo "Using Inkscape to generate icons..."
    inkscape "$SVG_FILE" -w 16 -h 16 -o "$ICON_DIR/icon16.png"
    inkscape "$SVG_FILE" -w 48 -h 48 -o "$ICON_DIR/icon48.png"
    inkscape "$SVG_FILE" -w 128 -h 128 -o "$ICON_DIR/icon128.png"
    echo "Icons generated successfully!"

# Check if ImageMagick convert is available
elif command -v convert &> /dev/null; then
    echo "Using ImageMagick to generate icons..."
    convert -background none "$SVG_FILE" -resize 16x16 "$ICON_DIR/icon16.png"
    convert -background none "$SVG_FILE" -resize 48x48 "$ICON_DIR/icon48.png"
    convert -background none "$SVG_FILE" -resize 128x128 "$ICON_DIR/icon128.png"
    echo "Icons generated successfully!"

else
    echo "Error: Neither inkscape nor ImageMagick (convert) found."
    echo "Please install one of these tools to generate icons:"
    echo "  - Ubuntu/Debian: sudo apt-get install inkscape"
    echo "  - macOS: brew install inkscape"
    echo ""
    echo "Alternatively, convert the SVG manually using an online tool:"
    echo "  https://cloudconvert.com/svg-to-png"
    exit 1
fi
