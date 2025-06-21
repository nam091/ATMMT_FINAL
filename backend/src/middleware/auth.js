// Simple authentication middleware
const auth = (req, res, next) => {
  // In a real application, this would verify the token from Keycloak
  // For now, we'll just check if there's an authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }
  
  // Normally we would verify the token here
  // For demo purposes, we'll just add a mock user to the request
  req.user = {
    id: '123',
    username: 'demo-user',
    roles: ['user']
  };
  
  next();
};

module.exports = { auth }; 