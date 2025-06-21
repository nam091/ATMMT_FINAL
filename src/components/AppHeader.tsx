"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, UserCog, BookUser, GraduationCap, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const navLinks = [
  { href: '/admin', label: 'Admin', icon: UserCog, role: 'admin' },
  { href: '/teacher', label: 'Teacher', icon: BookUser, role: 'teacher' },
  { href: '/student', label: 'Student', icon: GraduationCap, role: 'student' },
];

interface AuthState {
  isAuthenticated: boolean;
  userProfile?: {
    username: string;
    roles: string[];
    [key: string]: any;
  };
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export default function AppHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Luôn gọi useAuth ở đầu component, bất kể mounted hay không
  // Đặt trong try/catch để tránh lỗi khi chưa có AuthProvider
  let auth: AuthState = {
    isAuthenticated: false,
    userProfile: undefined,
    logout: () => {},
    hasRole: (_role: string) => false
  };
  
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Error using useAuth in AppHeader:", error);
  }
  
  // Destructure sau khi đã gọi hook
  const { isAuthenticated, userProfile, logout, hasRole } = auth;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Nếu chưa mounted, hiển thị header đơn giản
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-semibold text-primary">RoleAccess</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary">RoleAccess</span>
        </Link>
        
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {mounted && isAuthenticated && navLinks.map((link) => {
            // Only show links the user has permission to access
            if (!hasRole(link.role)) return null;
            
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className={cn("mr-2 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {mounted && isAuthenticated && userProfile ? (
            <>
              <div className="hidden sm:flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{userProfile.username}</span>
              </div>
              <Button variant="outline" className="text-sm" onClick={logout}>
                <LogOut className="mr-2 h-5 w-5" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="text-sm">
                <LogOut className="mr-2 h-5 w-5" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
