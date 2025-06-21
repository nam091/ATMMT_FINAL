"use client";

import { useState, useEffect } from "react";

interface KeycloakUserProfile {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface KeycloakState {
  isLoading: boolean;
  isAuthenticated: boolean;
  token?: string;
  refreshToken?: string;
  userProfile?: KeycloakUserProfile;
  hasRole: (role: string) => boolean;
  login: () => void;
  logout: () => void;
  refreshTokenFn: () => Promise<string | null>;
}

// Kiểm tra môi trường chạy
const isBrowser = typeof window !== 'undefined';

export function useKeycloak(): KeycloakState {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<KeycloakUserProfile | undefined>(undefined);

  // Khởi tạo trạng thái xác thực từ localStorage
  useEffect(() => {
    if (isBrowser) {
      console.log("useKeycloak - initializing from localStorage");
      const storedToken = localStorage.getItem('kc_token');
      const storedRefreshToken = localStorage.getItem('kc_refresh_token');
      const storedProfile = localStorage.getItem('kc_profile');
      
      console.log("useKeycloak - token exists:", !!storedToken);
      console.log("useKeycloak - refresh token exists:", !!storedRefreshToken);
      console.log("useKeycloak - profile exists:", !!storedProfile);
      
      if (storedToken && storedProfile) {
        try {
          setToken(storedToken);
          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
          }
          const parsedProfile = JSON.parse(storedProfile);
          setUserProfile(parsedProfile);
          setIsAuthenticated(true);
          console.log("useKeycloak - authenticated with profile:", parsedProfile.username);
          console.log("useKeycloak - roles:", parsedProfile.roles);
        } catch (error) {
          console.error('Error parsing stored profile:', error);
          localStorage.removeItem('kc_token');
          localStorage.removeItem('kc_refresh_token');
          localStorage.removeItem('kc_profile');
        }
      }
      
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string): Promise<KeycloakUserProfile | null> => {
    if (!isBrowser) return null;
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const login = () => {
    if (!isBrowser) return;
    
    // Redirect to Keycloak login
    const keycloakUrl = 'http://localhost:8080';
    const realm = 'greeting-view';
    const clientId = 'greeting-view-frontend';
    const redirectUri = encodeURIComponent(window.location.origin);
    
    window.location.href = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
  };

  const logout = async () => {
    if (!isBrowser) return;
    
    console.log("useKeycloak - logging out");
    
    try {
      // Gọi API logout ở backend nếu có refresh token
      if (refreshToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error calling logout API:', error);
    }
    
    // Xóa token và thông tin người dùng trong localStorage
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_refresh_token');
    localStorage.removeItem('kc_profile');
    
    // Xóa tất cả các dữ liệu auth code
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auth_code_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Cập nhật state
    setToken(undefined);
    setRefreshToken(undefined);
    setUserProfile(undefined);
    setIsAuthenticated(false);
    
    // Chuyển hướng đến endpoint logout của Keycloak
    const keycloakUrl = 'http://localhost:8080';
    const realm = 'greeting-view';
    const clientId = 'greeting-view-frontend';
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    
    // Chuyển hướng đến endpoint logout của Keycloak
    window.location.href = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;
  };

  const refreshTokenFn = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    
    // This is a placeholder. In a real implementation, you would call your backend
    // to refresh the token using a refresh token.
    return null;
  };

  const hasRole = (role: string): boolean => {
    if (!userProfile || !userProfile.roles) {
      console.log(`useKeycloak - hasRole(${role}) = false (no profile or roles)`);
      return false;
    }
    const hasTheRole = userProfile.roles.includes(role);
    console.log(`useKeycloak - hasRole(${role}) = ${hasTheRole}`);
    return hasTheRole;
  };

  return {
    isLoading,
    isAuthenticated,
    token,
    refreshToken,
    userProfile,
    hasRole,
    login,
    logout,
    refreshTokenFn
  };
} 