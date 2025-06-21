"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useKeycloak } from "./keycloak";

type AuthContextType = ReturnType<typeof useKeycloak>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const keycloakState = useKeycloak();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kiểm tra token hết hạn
  useEffect(() => {
    if (!mounted || !keycloakState.token) return;

    const checkTokenValidity = () => {
      try {
        // Lấy phần payload của token (phần thứ 2)
        const tokenParts = keycloakState.token?.split('.');
        if (!tokenParts || tokenParts.length !== 3) return false;
        
        // Giải mã payload
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Kiểm tra thời gian hết hạn
        if (!payload.exp) return false;
        
        // So sánh với thời gian hiện tại
        const isValid = payload.exp * 1000 > Date.now();
        
        if (!isValid) {
          console.log("Token đã hết hạn, đăng xuất người dùng");
          keycloakState.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Error checking token validity:", error);
        return false;
      }
    };

    // Kiểm tra token ngay lập tức
    checkTokenValidity();

    // Thiết lập kiểm tra token định kỳ
    const tokenCheckInterval = setInterval(checkTokenValidity, 60000); // Kiểm tra mỗi phút

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [mounted, keycloakState.token, keycloakState.logout]);

  // Khi chưa mounted, trả về children mà không có context provider
  // để tránh sự khác biệt giữa server và client rendering
  if (!mounted) {
    return <>{children}</>;
  }

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