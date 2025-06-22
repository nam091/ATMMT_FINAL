"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, UserCog, ShieldCheck, User, LayoutDashboard, Megaphone, Code2, Landmark, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const portalAdminNavLinks = [
  { href: '/portal/admin', label: 'Quản trị Portal', icon: UserCog, requiredRole: 'portal-admin' },
];

const groupNavLinks = [
  { href: '/portal/marketing', label: 'Marketing', icon: Megaphone, requiredGroup: 'Marketing' },
  { href: '/portal/engineering', label: 'Engineering', icon: Code2, requiredGroup: 'Engineering' },
  { href: '/portal/finance', label: 'Finance', icon: Landmark, requiredGroup: 'Finance' },
  { href: '/portal/partners', label: 'Đối tác', icon: Handshake, requiredGroup: 'Partners' },
];

const generalNavLinks = [
  { href: '/portal/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard, requiredRole: 'employee' }, // employee is a general role for dashboard access
];

interface AuthState {
  isAuthenticated: boolean;
  userProfile?: {
    username: string;
    roles: string[];
    groups?: string[];
    [key: string]: any;
  };
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasGroup: (group: string) => boolean; // Ensure this is in your AuthState type from useKeycloak
}

export default function AppHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  let auth: AuthState = {
    isAuthenticated: false,
    userProfile: undefined,
    logout: () => {},
    hasRole: (_role: string) => false,
    hasGroup: (_group: string) => false
  };
  
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Error using useAuth in AppHeader:", error);
  }
  
  const { isAuthenticated, userProfile, logout, hasRole, hasGroup } = auth;
  
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
          <span className="font-headline text-xl font-semibold text-primary">TechCorp Portal</span>
        </Link>
        
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {/* Portal Admin Links */}
          {mounted && isAuthenticated && portalAdminNavLinks.map((link) => {
            if (!hasRole(link.requiredRole)) return null;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className={cn("mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          {/* Group Specific Links */}
          {mounted && isAuthenticated && groupNavLinks.map((link) => {
            if (!link.requiredGroup || !hasGroup(link.requiredGroup)) return null;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className={cn("mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          {/* General Authenticated Links (like Dashboard) */}
          {mounted && isAuthenticated && generalNavLinks.map((link) => {
            // Show dashboard if user is employee AND not already covered by a more specific group page shown above
            // Or if they are portal-admin (who should see everything)
            // This logic might need refinement based on exact visibility rules for the dashboard.
            // For now, if they are an employee and don't specifically belong to Marketing, Eng, Fin, show Dashboard.
            // A simpler approach could be to always show Dashboard if they are an employee.
            let shouldShow = hasRole(link.requiredRole);
            if (link.href === '/portal/dashboard' && hasRole('employee')) {
                // Avoid showing dashboard if they already have a more specific group link displayed
                const hasSpecificGroupLink = groupNavLinks.some(gnl => gnl.requiredGroup && hasGroup(gnl.requiredGroup));
                if (hasSpecificGroupLink && !hasRole('portal-admin')) { // portal-admin might still want to see it
                    // If user is e.g. in Marketing group, they see Marketing link, so maybe hide generic Dashboard
                    // unless they are portal-admin who might want to see all main sections.
                    // This logic is getting complex. Let's simplify: show if they have the role and no specific group page covers them, OR if they are portal-admin.
                }
            }
            // Simpler: if they have the role, show the link. Group pages are additive.
            if (!hasRole(link.requiredRole)) return null;

            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <link.icon className={cn("mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {mounted && isAuthenticated && userProfile ? (
            <>
              <div className="hidden sm:flex flex-col items-end text-sm">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Xin chào {userProfile.username}!</span>
                </div>
                {userProfile.roles && userProfile.roles.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Quyền: {userProfile.roles.join(', ')}
                  </div>
                )}
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
