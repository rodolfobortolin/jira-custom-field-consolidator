#!/bin/bash
# Build the React app
cd static/main && npm run build

# Go back to root directory
cd ../../

# Deploy the app to production
forge deploy --environment=production

echo "Build and deploy to production completed!"
