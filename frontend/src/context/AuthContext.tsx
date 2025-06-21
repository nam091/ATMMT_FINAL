import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Keycloak from 'keycloak-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  keycloak: Keycloak | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  keycloak: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const keycloakInstance = new Keycloak({
          url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080/auth',
          realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'greeting-view',
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'greeting-view-frontend',
        });

        const authenticated = await keycloakInstance.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        });

        setKeycloak(keycloakInstance);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          setUser(keycloakInstance.tokenParsed);
          
          // Thiết lập refresh token
          setInterval(() => {
            keycloakInstance.updateToken(70).catch(() => {
              console.error('Failed to refresh token');
            });
          }, 60000);
        }
      } catch (error) {
        console.error('Keycloak init error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ khởi tạo Keycloak khi ở client-side
    if (typeof window !== 'undefined') {
      initKeycloak();
    }
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, keycloak }}>
      {children}
    </AuthContext.Provider>
  );
}; 