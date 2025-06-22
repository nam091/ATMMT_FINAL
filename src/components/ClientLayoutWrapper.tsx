"use client";

import { ReactNode, useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { applyWebComponentsFix } from "@/lib/webcomponents-fix";
import { preloadScripts } from "@/lib/preload-scripts";

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Áp dụng fix cho webcomponents
    applyWebComponentsFix();
    
    // Tải trước các script cần thiết
    preloadScripts().catch(error => {
      console.error('Error preloading scripts:', error);
    });
  }, []);

  // Kiểm tra xem đường dẫn hiện tại có phải là trang login hay không
  const isLoginPage = pathname === '/login';
  
  // Nếu đang ở trang login, không cần bao bọc bằng AuthProvider
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Bao bọc bằng AuthProvider cho tất cả các trang khác (bao gồm cả callback).
  // AuthProvider itself (via useKeycloak) manages an isLoading state.
  return <AuthProvider>{children}</AuthProvider>;
} 