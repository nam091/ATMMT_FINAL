# Greeting-View Backend

This is the backend service for the Greeting-View application, providing API endpoints and Keycloak integration for authentication and authorization.

## Features

- Express.js server
- Keycloak integration for authentication
- Role-based API access control
- REST API endpoints
- Docker containerization

## Setup

### Requirements

- Node.js 16+
- Docker and Docker Compose (for containerized setup)
- Keycloak server (included in Docker Compose)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

### Running the Service

#### Development mode

```bash
npm run dev
```

#### Production mode

```bash
npm start
```

#### Using Docker Compose

From the root directory of the project:

```bash
docker-compose up
```

This will start:
- PostgreSQL database
- Keycloak server
- Backend API service

## API Endpoints

### Authentication

- `GET /api/auth/userinfo`: Get user information from token
- `GET /api/auth/logout`: Get Keycloak logout URL

### User Data

- `GET /api/users/profile`: Get user profile (authenticated)
- `GET /api/users/admin-data`: Get admin-specific data (requires admin role)
- `GET /api/users/teacher-data`: Get teacher-specific data (requires teacher role)
- `GET /api/users/student-data`: Get student-specific data (requires student role)

## Keycloak Setup

1. Access Keycloak Admin Console at `http://localhost:8080/admin`
2. Login with admin/admin (default credentials in Docker setup)
3. Create a new realm: `greeting-view`
4. Create two clients:
   - `greeting-view-backend` (confidential, service account)
   - `greeting-view-frontend` (public)
5. Create roles: admin, teacher, student
6. Create test users and assign appropriate roles

## License

This project is proprietary and confidential. 