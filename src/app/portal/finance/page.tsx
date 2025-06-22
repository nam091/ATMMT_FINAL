"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react'; // Icon for Finance
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function FinancePage() {
  const [mounted, setMounted] = useState(false);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    setMounted(true);
    console.log("FinancePage mounted");
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
              <Landmark className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-4xl font-headline text-primary">Trang Nhóm Finance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Chào mừng bạn đến với không gian làm việc của nhóm Finance.
              </p>
              {userProfile && (
                <div className="mt-4 text-sm text-left text-muted-foreground space-y-2">
                  {userProfile.roles && userProfile.roles.length > 0 && (
                    <div>
                      <p className="font-semibold">Vai trò của bạn:</p>
                      <ul className="list-disc list-inside ml-4">
                        {userProfile.roles.map(role => (
                          <li key={role}>{role}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {userProfile.groups && userProfile.groups.length > 0 && (
                    <div>
                      <p className="font-semibold">Nhóm của bạn:</p>
                      <ul className="list-disc list-inside ml-4">
                        {userProfile.groups.map(group => (
                          <li key={group}>{group.startsWith('/') ? group.substring(1) : group}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
} 