const express = require('express');
const router = express.Router();
const { keycloakConfig } = require('../../config/keycloak-config');

const keycloak = keycloakConfig.getKeycloak();

// Get user profile - protected by Keycloak
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
    res.status(403).json({ message: 'Not authenticated' });
  }
});

// Admin-only endpoint
router.get('/admin-data', keycloak.protect('realm:admin'), (req, res) => {
  res.json({ 
    message: 'This data is only accessible to admins',
    data: { 
      adminStats: {
        totalUsers: 120,
        activeUsers: 85,
        systemHealth: 'Good'
      }
    }
  });
});

// Teacher-only endpoint
router.get('/teacher-data', keycloak.protect('realm:teacher'), (req, res) => {
  res.json({ 
    message: 'This data is only accessible to teachers',
    data: { 
      teacherStats: {
        totalStudents: 45,
        averageScore: 7.8,
        completedAssignments: 156
      }
    }
  });
});

// Student-only endpoint
router.get('/student-data', keycloak.protect('realm:student'), (req, res) => {
  res.json({ 
    message: 'This data is only accessible to students',
    data: { 
      studentStats: {
        enrolledCourses: 5,
        averageGrade: 'B+',
        assignmentsDue: 3
      }
    }
  });
});

module.exports = router; 