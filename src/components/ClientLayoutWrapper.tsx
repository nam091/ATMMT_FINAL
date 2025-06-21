"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kiểm tra xem đường dẫn hiện tại có phải là trang login hay không
  const isLoginPage = pathname === '/login';
  
  // Nếu chưa ở client-side, trả về children để tránh lỗi hydration
  if (!isClient) {
    return <>{children}</>;
  }

  // Nếu đang ở trang login, không cần bao bọc bằng AuthProvider
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Bao bọc bằng AuthProvider cho tất cả các trang khác (bao gồm cả callback)
  return <AuthProvider>{children}</AuthProvider>;
} 