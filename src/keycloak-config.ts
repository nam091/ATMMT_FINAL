import Keycloak from 'keycloak-js';

// Cấu hình để kết nối đến Keycloak server của bạn
const keycloakConfig = {
    url: 'http://localhost:8080/',
    realm: 'greeting-view-portal',
    clientId: 'greeting-view-frontend'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;