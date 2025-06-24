const Keycloak = require('keycloak-connect');
const session = require('express-session');

let _keycloak;

function initKeycloak() {
  if (_keycloak) {
    console.warn("Trying to init Keycloak again!");
    return _keycloak;
  }

  console.log("Initializing Keycloak...");
  
  const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM || 'greeting-view-portal',
    'auth-server-url': process.env.KEYCLOAK_URL || 'http://localhost:8080',
    'ssl-required': 'external',
    resource: process.env.KEYCLOAK_CLIENT_ID || 'greeting-view-backend',
    'confidential-port': 0,
    'bearer-only': true,
    credentials: {
      secret: process.env.KEYCLOAK_SECRET
    }
  };

  _keycloak = new Keycloak({ store: new session.MemoryStore() }, keycloakConfig);
  
  return _keycloak;
}

function getKeycloak() {
  if (!_keycloak) {
    console.error('Keycloak has not been initialized. Please call initKeycloak first.');
  }
  return _keycloak;
}

module.exports = {
  keycloakConfig: {
    initKeycloak,
    getKeycloak
  }
}; 