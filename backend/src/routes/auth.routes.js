const express = require('express');
const router = express.Router();
const { keycloakConfig } = require('../../config/keycloak-config');
const axios = require('axios');
const querystring = require('querystring');

const keycloak = keycloakConfig.getKeycloak();

// Get Keycloak config for frontend
router.get('/config', (req, res) => {
  const clientConfig = {
    url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'greeting-view',
    clientId: 'greeting-view-frontend'
  };
  res.json(clientConfig);
});

// Get user info from Keycloak token
router.get('/userinfo', keycloak.protect(), (req, res) => {
  // The user information is available in the request.kauth.grant object
  if (req.kauth && req.kauth.grant) {
    const tokenContent = req.kauth.grant.access_token.content;
    // Extract relevant user information
    const userInfo = {
      id: tokenContent.sub,
      username: tokenContent.preferred_username,
      email: tokenContent.email,
      firstName: tokenContent.given_name,
      lastName: tokenContent.family_name,
      roles: tokenContent.realm_access?.roles || [],
      groups: tokenContent.groups || []
    };
    res.json(userInfo);
  } else {
    res.status(403).json({ message: 'No authentication data found' });
  }
});

// Handle callback from Keycloak after successful authentication
router.post('/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    
    if (!code || !redirectUri) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Sử dụng client ID cho frontend (public client)
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'greeting-view';
    const clientId = 'greeting-view-frontend'; // Client ID cho frontend
    
    console.log(`Processing callback with code ${code.substring(0, 10)}... for redirect URI ${redirectUri}`);
    
    // Exchange authorization code for tokens
    const tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    console.log(`Requesting tokens from ${tokenEndpoint}`);
    
    const tokenPayload = {
      grant_type: 'authorization_code',
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri
    };
    
    console.log('Token request payload:', tokenPayload);
    
    try {
      const tokenResponse = await axios.post(
        tokenEndpoint,
        new URLSearchParams(tokenPayload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log(`Token response received: ${tokenResponse.status}`);
      console.log('Token response data:', JSON.stringify({
        access_token_exists: !!tokenResponse.data.access_token,
        refresh_token_exists: !!tokenResponse.data.refresh_token,
        id_token_exists: !!tokenResponse.data.id_token,
        token_type: tokenResponse.data.token_type,
        expires_in: tokenResponse.data.expires_in
      }));
      
      // Extract tokens
      const { access_token, refresh_token, id_token } = tokenResponse.data;
      
      // Get user info using the access token
      const userInfoEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`;
      console.log(`Requesting user info from ${userInfoEndpoint}`);
      
      try {
        const userInfoResponse = await axios.get(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        
        console.log(`User info received: ${userInfoResponse.status}`);
        console.log('User info data:', JSON.stringify(userInfoResponse.data));
        
        // Giải mã token để lấy thông tin vai trò và nhóm
        let roles = [];
        let groups = [];
        try {
          // Lấy phần payload của token (phần thứ 2)
          const tokenParts = access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('Token payload:', JSON.stringify({
              sub: payload.sub,
              preferred_username: payload.preferred_username,
              realm_access: payload.realm_access,
              groups: payload.groups
            }));
            
            // Lấy vai trò từ token
            roles = payload.realm_access?.roles || [];
            groups = payload.groups || [];
            console.log(`Extracted roles from token: ${roles.join(', ')}`);
            console.log(`Extracted groups from token: ${groups.join(', ')}`);
          }
        } catch (error) {
          console.error('Error decoding token payload:', error);
        }
        
        // Extract user profile from ID token or userinfo
        let userProfile = {
          id: userInfoResponse.data.sub,
          username: userInfoResponse.data.preferred_username || userInfoResponse.data.email || 'unknown',
          email: userInfoResponse.data.email,
          firstName: userInfoResponse.data.given_name,
          lastName: userInfoResponse.data.family_name,
          roles: roles,
          groups: groups
        };
        
        // Đảm bảo có vai trò mặc định
        if (!userProfile.roles || userProfile.roles.length === 0) {
          console.log('No roles found, adding default role: user');
          userProfile.roles = ['user'];
          
          // Kiểm tra username để gán vai trò
          if (userProfile.username === 'admin') {
            console.log('Username is admin, adding admin role');
            userProfile.roles.push('admin');
          }
        }
        
        console.log(`User roles: ${userProfile.roles.join(', ')}`);
        console.log('Sending response to client');
        
        // Return tokens and user profile to the client
        return res.json({
          access_token,
          refresh_token,
          id_token,
          profile: userProfile
        });
        
      } catch (userInfoError) {
        console.error('Error fetching user info:', userInfoError.response?.status, userInfoError.response?.data);
        
        // Fallback: Parse the ID token to get basic user info
        try {
          const tokenParts = id_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('ID token payload:', JSON.stringify({
              sub: payload.sub,
              preferred_username: payload.preferred_username,
              realm_access: payload.realm_access
            }));
            
            // Lấy vai trò từ token
            const roles = payload.realm_access?.roles || ['user'];
            
            const userProfile = {
              id: payload.sub,
              username: payload.preferred_username || payload.email || 'unknown',
              email: payload.email,
              firstName: payload.given_name,
              lastName: payload.family_name,
              roles: roles,
              groups: payload.groups || []
            };
            
            // Đảm bảo có vai trò mặc định
            if (!userProfile.roles || userProfile.roles.length === 0) {
              console.log('No roles found in ID token, adding default role: user');
              userProfile.roles = ['user'];
              
              // Kiểm tra username để gán vai trò
              if (userProfile.username === 'admin') {
                console.log('Username is admin, adding admin role');
                userProfile.roles.push('admin');
              }
            }
            
            console.log(`User roles from ID token: ${userProfile.roles.join(', ')}`);
            console.log('Token payload parsed successfully (fallback)');
            
            // Return tokens and user profile to the client
            return res.json({
              access_token,
              refresh_token,
              id_token,
              profile: userProfile
            });
          }
        } catch (error) {
          console.error('Error parsing ID token:', error);
        }
        
        // Nếu không thể lấy thông tin từ userinfo hoặc id_token, tạo profile với vai trò mặc định
        const defaultProfile = {
          id: 'unknown',
          username: 'user',
          email: '',
          roles: ['user'],
          groups: []
        };
        
        console.log('Using default profile with role: user and no groups');
        
        return res.json({
          access_token,
          refresh_token,
          id_token,
          profile: defaultProfile
        });
      }
      
    } catch (tokenError) {
      console.error('Error exchanging code for token:', tokenError);
      return res.status(500).json({ 
        message: 'Failed to exchange authorization code for tokens', 
        error: tokenError.response?.data || tokenError.message 
      });
    }
    
  } catch (error) {
    console.error('Error processing callback:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get user info from Keycloak
router.get('/userinfo', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'greeting-view';
    
    try {
      const userInfoResponse = await axios.get(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const userProfile = {
        id: userInfoResponse.data.sub,
        username: userInfoResponse.data.preferred_username || userInfoResponse.data.email,
        email: userInfoResponse.data.email,
        firstName: userInfoResponse.data.given_name,
        lastName: userInfoResponse.data.family_name,
        roles: userInfoResponse.data.realm_access?.roles || [],
        groups: userInfoResponse.data.groups || []
      };
      
      // If groups are not in userInfoResponse, try to parse from the provided token
      if (userProfile.groups.length === 0 && token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            userProfile.groups = payload.groups || [];
          }
        } catch (e) {
          console.error("Error parsing token for groups in second /userinfo:", e);
        }
      }
      
      return res.json(userProfile);
      
    } catch (error) {
      console.error('Error fetching user info:', error.response?.status, error.response?.data);
      return res.status(error.response?.status || 500).json({ 
        message: 'Failed to fetch user info', 
        error: error.response?.data || error.message 
      });
    }
  } catch (error) {
    console.error('Error in userinfo endpoint:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Handle logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'greeting-view';
    const clientId = 'greeting-view-frontend';
    
    console.log('Processing logout request');
    
    // Nếu có refresh token, thực hiện logout session ở Keycloak
    if (refreshToken) {
      try {
        await axios.post(
          `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
          new URLSearchParams({
            client_id: clientId,
            refresh_token: refreshToken
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        console.log('Logout successful at Keycloak');
      } catch (error) {
        console.error('Error during Keycloak logout:', error.response?.data || error.message);
        // Tiếp tục xử lý ngay cả khi có lỗi từ Keycloak
      }
    }
    
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout endpoint:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router; 