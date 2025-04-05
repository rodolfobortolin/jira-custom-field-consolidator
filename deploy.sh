#!/bin/bash
# Script para build e deploy automático do app

echo "Starting build and deploy process..."

# Build the React app
cd static/main && npm run build

# Go back to root directory
cd ../../

# Deploy the app
forge deploy

echo "Build and deploy completed successfully!"
