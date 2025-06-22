"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
// import { useRouter } from 'next/navigation'; // Not strictly needed for this page structure

export default function PortalAdminPage() {
  // State để kiểm tra nếu component đã mounted
  const [mounted, setMounted] = useState(false);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    setMounted(true);
    console.log("PortalAdminPage mounted");
    
    // Debug: Kiểm tra token trong localStorage (optional, can be removed if not needed)
    const token = localStorage.getItem('kc_token');
    const profile = localStorage.getItem('kc_profile');
    console.log("Token exists:", !!token);
    console.log("Profile exists:", !!profile);
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        console.log("User roles:", parsedProfile.roles);
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }
  }, []);
  
  // Chỉ render nội dung chính khi đã mounted ở client-side
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute requiredRole="portal-admin">
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-xl">
            <CardHeader>
              <UserCog className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline text-primary">Trang Quản Trị Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Chào mừng Portal Admin! Tại đây bạn có thể quản lý các khía cạnh của cổng thông tin TechCorp.
              </p>
              {userProfile && userProfile.roles && userProfile.roles.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-semibold">Các quyền của bạn:</p>
                  <ul className="list-disc list-inside ml-4">
                    {userProfile.roles.map(role => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
} 