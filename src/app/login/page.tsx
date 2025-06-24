"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyIcon } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Xóa token cũ và dữ liệu auth code
    if (typeof window !== 'undefined') {
      // Xóa token và profile
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_refresh_token');
      localStorage.removeItem('kc_profile');
      
      // Xóa tất cả các dữ liệu auth code
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_code_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Kiểm tra xem người dùng có đến từ trang logout của Keycloak không
      const url = new URL(window.location.href);
      if (url.searchParams.has('logout') || url.searchParams.has('error')) {
        // Xóa các tham số từ URL để tránh refresh lại trang và mất trạng thái
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    
    // Redirect to Keycloak
    const keycloakUrl = 'http://localhost:8080';
    const realm = 'greeting-view-portal';
    const clientId = 'greeting-view-frontend';
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    
    window.location.href = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
  };

  if (!isMounted) {
    return null; // Tránh hydration mismatch
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyIcon className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập để truy cập vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập với Keycloak'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
