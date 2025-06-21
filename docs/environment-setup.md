# Environment Setup Guide

This document explains how to set up environment variables for the Greeting-View application in different development and deployment scenarios.

## Environment Files Overview

The project uses three main environment files:

1. **Frontend Environment** - `.env` (copied from `.env.example`) in the project root  
   Contains configuration for the Next.js frontend.

2. **Backend Environment** - `.env` (copied from `.env.example`) in the `backend/` directory  
   Contains configuration for the Express backend.

3. **Docker Environment** - `.env` (copied from `.env.docker`) in the project root  
   Contains configuration for the entire Docker Compose stack.

## Setting Up Local Development

### Frontend Setup (Next.js)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Update the variables as needed:
   - `NEXT_PUBLIC_API_URL`: URL of your backend API (default: http://localhost:3001)
   - `NEXT_PUBLIC_KEYCLOAK_URL`: URL of your Keycloak server (default: http://localhost:8080)
   - `NEXT_PUBLIC_KEYCLOAK_REALM`: Your Keycloak realm name (default: greeting-view)
   - `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: Frontend client ID (default: greeting-view-frontend)
   - Additional settings can be customized as needed

3. Start the frontend:
   ```bash
   npm run dev
   ```

### Backend Setup (Express)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Update the variables as needed:
   - `KEYCLOAK_URL`: URL of your Keycloak server
   - `KEYCLOAK_REALM`: Your Keycloak realm name
   - `KEYCLOAK_CLIENT_ID`: Backend client ID
   - `KEYCLOAK_SECRET`: Client secret from Keycloak
   - `SESSION_SECRET`: Secret for session encryption

4. Start the backend:
   ```bash
   npm run dev
   ```

## Docker Compose Setup

For running the complete stack with Docker Compose:

1. Copy the docker environment file:
   ```bash
   cp .env.docker .env
   ```

2. Update variables as needed, particularly:
   - `KEYCLOAK_ADMIN_PASSWORD`: Secure password for Keycloak admin
   - `POSTGRES_PASSWORD`: Secure password for PostgreSQL
   - Any client secrets or other security-related values

3. Start the Docker Compose stack:
   ```bash
   docker-compose up
   ```

## Production Environment

For production deployment, similar environment files should be set up with:

- Production URLs instead of localhost
- HTTPS URLs instead of HTTP
- Proper secrets for production
- Additional security settings

Never commit your actual `.env` files containing secrets to version control. The `.env.example` and `.env.docker` files are meant to be templates only.

## Keycloak Realm Setup

After starting Keycloak, you'll need to set up the realm:

1. Access Keycloak at http://localhost:8080
2. Create a new realm named "greeting-view"
3. Create two clients:
   - `greeting-view-frontend` (public)
   - `greeting-view-backend` (confidential, with service account)
4. Create roles: admin, teacher, student
5. Configure the client secrets in your `.env` files

Refer to the [Keycloak documentation](https://www.keycloak.org/documentation) for detailed setup instructions. 