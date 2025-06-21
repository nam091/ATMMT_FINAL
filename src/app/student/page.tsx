"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentPage() {
  // State để kiểm tra nếu component đã mounted
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
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
    <ProtectedRoute requiredRole="student">
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <Card className="w-full max-w-2xl text-center shadow-xl">
          <CardHeader>
            <GraduationCap className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-4xl font-headline text-primary">Xin chào Student!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Chào mừng bạn đến với cổng thông tin sinh viên.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
    </ProtectedRoute>
  );
}
