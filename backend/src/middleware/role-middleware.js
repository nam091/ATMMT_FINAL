/**
 * Middleware to check if the authenticated user has the required role
 * @param {string} requiredRole - The role to check for
 */
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (!req.kauth || !req.kauth.grant) {
      return res.status(403).json({ message: 'Not authenticated' });
    }

    const tokenContent = req.kauth.grant.access_token.content;
    const roles = tokenContent.realm_access?.roles || [];
    
    if (roles.includes(requiredRole)) {
      return next();
    } else {
      return res.status(403).json({ 
        message: `Access denied: Required role '${requiredRole}' not found` 
      });
    }
  };
}

/**
 * Middleware to check if the authenticated user has any of the required roles
 * @param {string[]} requiredRoles - Array of roles, any of which grants access
 */
function hasAnyRole(requiredRoles) {
  return (req, res, next) => {
    if (!req.kauth || !req.kauth.grant) {
      return res.status(403).json({ message: 'Not authenticated' });
    }

    const tokenContent = req.kauth.grant.access_token.content;
    const userRoles = tokenContent.realm_access?.roles || [];
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (hasRequiredRole) {
      return next();
    } else {
      return res.status(403).json({ 
        message: `Access denied: None of the required roles found` 
      });
    }
  };
}

module.exports = {
  hasRole,
  hasAnyRole
}; 