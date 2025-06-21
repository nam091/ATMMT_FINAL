#!/bin/bash

echo "Installing dependencies..."
echo

# Navigate to the correct directory
cd "$(dirname "$0")"
echo "Current directory: $(pwd)"
echo

# Install dependencies
echo "Installing autoprefixer..."
npm install --save-dev autoprefixer
echo

echo "Dependencies installed successfully."
echo 