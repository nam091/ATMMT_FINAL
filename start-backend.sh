#!/bin/bash

echo "Starting Greeting View Backend..."
echo

# Navigate to the correct directory
cd "$(dirname "$0")/backend"
echo "Current directory: $(pwd)"
echo

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3001
NODE_ENV=development
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=greeting-view
KEYCLOAK_CLIENT_ID=greeting-view-backend
KEYCLOAK_SECRET=your-client-secret
SESSION_SECRET=your-session-secret-change-in-production
FRONTEND_URL=http://localhost:9002
EOF
    echo "Created .env file."
    echo
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

# Start the backend server
echo "Starting backend server..."
npm start 