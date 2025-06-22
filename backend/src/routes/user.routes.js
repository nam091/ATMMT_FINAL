const express = require('express');
const router = express.Router();
const { keycloakConfig } = require('../../config/keycloak-config');

const keycloak = keycloakConfig.getKeycloak();

// Route for general user profile, accessible if authenticated (e.g., has 'employee' role or any valid token)
router.get('/profile', keycloak.protect(), (req, res) => {
  if (req.kauth && req.kauth.grant) {
    const tokenContent = req.kauth.grant.access_token.content;
    res.json({
      id: tokenContent.sub,
      username: tokenContent.preferred_username,
      email: tokenContent.email,
      firstName: tokenContent.given_name,
      lastName: tokenContent.family_name,
      roles: tokenContent.realm_access?.roles || []
    });
  } else {
    res.status(403).json({ message: 'Not authenticated or no token information found' });
  }
});

// Endpoint for portal administrators
router.get('/portal-admin-data', keycloak.protect('portal-admin'), (req, res) => {
  res.json({ 
    message: 'This data is only accessible to Portal Administrators',
    data: { 
      adminStats: {
        totalUsers: 120,
        activeUsers: 85,
        systemHealth: 'Good',
        siteConfigAccess: true
      }
    }
  });
});

// Endpoint for users who can publish news (e.g., Marketing group)
router.get('/news-publisher-area', keycloak.protect('can-publish-news'), (req, res) => {
  res.json({ 
    message: 'Welcome News Publisher! Access to news creation tools granted.',
    data: { 
      pendingArticles: 5,
      publishedToday: 2
    }
  });
});

// Endpoint for users who can write docs (e.g., Engineering group)
router.get('/docs-editor-area', keycloak.protect('can-write-docs'), (req, res) => {
  res.json({ 
    message: 'Documentation Area: Access to document editing features.',
    data: { 
      draftDocuments: 10,
      recentEdits: ['Guide A', 'Spec B']
    }
  });
});

// Endpoint for users who can view reports (e.g., Finance group)
router.get('/finance-reports', keycloak.protect('can-view-reports'), (req, res) => {
  res.json({ 
    message: 'Finance Reports Dashboard.',
    data: { 
      monthlyRevenue: '...',
      expenseSummary: '...'
    }
  });
});

// Example of a basic employee-accessible route
router.get('/employee-dashboard', keycloak.protect('employee'), (req, res) => {
  res.json({
    message: 'Welcome to the TechCorp Employee Dashboard!',
    data: {
      companyAnnouncements: ['New holiday schedule', 'Quarterly meeting reminder'],
      quickLinks: ['HR Portal', 'IT Support']
    }
  });
});

module.exports = router; 