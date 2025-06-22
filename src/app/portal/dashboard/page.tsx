"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react'; // Or any other relevant icon
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function EmployeeDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    setMounted(true);
    console.log("EmployeeDashboardPage mounted");
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute requiredRole="employee"> 
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="w-full max-w-2xl text-center shadow-xl">
            <CardHeader>
              <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline text-primary">Cổng Thông Tin Nhân Viên TechCorp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Chào mừng bạn đến với cổng thông tin nội bộ của TechCorp. Tại đây bạn có thể tìm thấy thông tin và tài nguyên hữu ích.
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
              {/* Add more specific content for employees here */}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
} 