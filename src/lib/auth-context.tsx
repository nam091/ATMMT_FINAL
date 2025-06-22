"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useKeycloak } from "./keycloak";

type AuthContextType = ReturnType<typeof useKeycloak>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const keycloakState = useKeycloak();

  // Kiểm tra token hết hạn
  useEffect(() => {
    if (!keycloakState.isAuthenticated || !keycloakState.token) return;

    const checkTokenValidity = () => {
      try {
        const tokenParts = keycloakState.token?.split('.');
        if (!tokenParts || tokenParts.length !== 3) return false;
        const payload = JSON.parse(atob(tokenParts[1]));
        if (!payload.exp) return false;
        const isValid = payload.exp * 1000 > Date.now();
        
        if (!isValid) {
          console.log("Token đã hết hạn, đăng xuất người dùng (AuthProvider check)");
          keycloakState.logout();
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error checking token validity (AuthProvider check):", error);
        return false;
      }
    };

    if (checkTokenValidity()) {
      const tokenCheckInterval = setInterval(checkTokenValidity, 60000);
      return () => {
        clearInterval(tokenCheckInterval);
      };
    }
  }, [keycloakState.isAuthenticated, keycloakState.token, keycloakState.logout]);

  return (
    <AuthContext.Provider value={keycloakState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
}; 