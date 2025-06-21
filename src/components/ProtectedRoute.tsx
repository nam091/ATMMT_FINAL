"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  token?: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Thử catch lỗi khi sử dụng useAuth để tránh crash trong quá trình hydration
  let authState: AuthState = { 
    isLoading: true, 
    isAuthenticated: false, 
    hasRole: () => false 
  };
  
  try {
    authState = useAuth();
    console.log("ProtectedRoute - useAuth:", {
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token
    });
  } catch (error) {
    console.error("Error using useAuth hook:", error);
    // Tiếp tục với giá trị mặc định
  }

  const { isLoading, isAuthenticated, hasRole, token } = authState;

  // Kiểm tra token có hợp lệ không
  const checkTokenValidity = () => {
    if (!token) return false;
    
    try {
      // Lấy phần payload của token (phần thứ 2)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      // Giải mã payload
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Kiểm tra thời gian hết hạn
      if (!payload.exp) return false;
      
      // So sánh với thời gian hiện tại
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  };

  useEffect(() => {
    setMounted(true);
    console.log("ProtectedRoute mounted, requiredRole:", requiredRole);
    
    // Chỉ kiểm tra xác thực sau khi component đã được mount
    if (!isLoading && mounted) {
      console.log("ProtectedRoute - checking auth, isAuthenticated:", isAuthenticated);
      
      // Kiểm tra token nếu đã xác thực
      if (isAuthenticated && !checkTokenValidity()) {
        console.log("Token không hợp lệ hoặc đã hết hạn, chuyển hướng đến trang đăng nhập");
        // Xóa token cũ
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kc_token');
          localStorage.removeItem('kc_profile');
        }
        router.push('/login');
        return;
      }
      
      // Nếu không được xác thực, chuyển hướng đến trang đăng nhập
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push('/login');
        return;
      }

      // Nếu yêu cầu kiểm tra vai trò và người dùng không có vai trò đó
      if (requiredRole && !hasRole(requiredRole)) {
        console.log(`User doesn't have required role: ${requiredRole}`);
        // Chuyển hướng đến trang phù hợp với vai trò của người dùng
        if (hasRole('admin')) {
          router.push('/admin');
        } else if (hasRole('teacher')) {
          router.push('/teacher');
        } else if (hasRole('student')) {
          router.push('/student');
        } else {
          router.push('/login');
        }
      } else if (requiredRole) {
        console.log(`User has required role: ${requiredRole}`);
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, hasRole, router, mounted, token]);

  // Hiển thị trạng thái đang tải trong khi kiểm tra xác thực
  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu không được xác thực hoặc không có vai trò yêu cầu, không render children
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    console.log("Not rendering children due to auth/role check failure");
    return null;
  }

  // Tất cả kiểm tra đã pass, render nội dung được bảo vệ
  console.log("Rendering protected content");
  return <>{children}</>;
} 