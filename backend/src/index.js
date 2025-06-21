const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { auth } = require('./middleware/auth');
const { keycloakConfig } = require('../config/keycloak-config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using https
}));

// Initialize Keycloak
const keycloakInstance = keycloakConfig.initKeycloak();
app.use(keycloakInstance.middleware());

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

app.get('/', (req, res) => {
  res.json({ message: 'Greeting View Backend API is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Protected route example
app.get('/api/protected', auth, (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Keycloak URL: ${process.env.KEYCLOAK_URL || 'http://localhost:8080'}`);
  console.log(`Keycloak Realm: ${process.env.KEYCLOAK_REALM || 'greeting-view'}`);
}); 