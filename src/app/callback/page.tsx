"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const isProcessingRef = useRef(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Nếu đã xử lý trong component này, không làm gì thêm
    if (hasProcessedRef.current) {
      return;
    }

    // Hàm xử lý callback
    async function handleCallback() {
      console.log("CallbackPage - handleCallback started");
      
      // Kiểm tra nếu đang xử lý, không thực hiện lại
      if (isProcessingRef.current) {
        console.log("CallbackPage - already processing, skipping");
        return;
      }
      
      // Kiểm tra nếu đã xử lý code này trước đó
      const code = searchParams.get('code');
      if (!code) {
        console.log("CallbackPage - no code found in URL");
        setError('Không nhận được mã xác thực từ Keycloak');
        setIsProcessing(false);
        return;
      }
      
      console.log("CallbackPage - processing code:", code.substring(0, 10) + "...");
      
      // Tạo một ID duy nhất cho code này
      const codeId = `auth_code_${code.substring(0, 10)}`;
      
      // Kiểm tra xem code này đã được xử lý chưa
      const processStatus = localStorage.getItem(codeId);
      if (processStatus === 'processing') {
        console.log('Code đang được xử lý bởi một yêu cầu khác');
        
        // Chờ một chút và kiểm tra xem đã có kết quả chưa
        const checkInterval = setInterval(() => {
          const currentStatus = localStorage.getItem(codeId);
          if (currentStatus === 'success' && localStorage.getItem('kc_token')) {
            clearInterval(checkInterval);
            
            // Đã có token, chuyển hướng người dùng
            const profile = JSON.parse(localStorage.getItem('kc_profile') || '{}');
            redirectBasedOnRole(profile);
          } else if (currentStatus === 'error') {
            clearInterval(checkInterval);
            setError('Đã xảy ra lỗi khi xử lý đăng nhập. Vui lòng thử lại.');
            setIsProcessing(false);
          }
        }, 500);
        
        return;
      } else if (processStatus === 'success') {
        console.log('Code này đã được xử lý thành công trước đó');
        
        // Kiểm tra xem có token không
        if (localStorage.getItem('kc_token')) {
          // Đã có token, chuyển hướng người dùng
          const profile = JSON.parse(localStorage.getItem('kc_profile') || '{}');
          redirectBasedOnRole(profile);
          return;
        }
      }
      
      // Đánh dấu code này đang được xử lý
      localStorage.setItem(codeId, 'processing');
      isProcessingRef.current = true;
      hasProcessedRef.current = true;
      
      try {
        console.log("Processing authentication callback with code:", code.substring(0, 10) + "...");
        
        // Kiểm tra xem backend có đang chạy không
        try {
          // Gửi request ping đến backend
          const pingResponse = await fetch('http://localhost:3001', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!pingResponse.ok) {
            throw new Error(`Backend không khả dụng. Status: ${pingResponse.status}`);
          }
        } catch (pingError) {
          console.error('Backend không khả dụng:', pingError);
          localStorage.setItem(codeId, 'error');
          throw new Error('Backend API không khả dụng. Vui lòng khởi động backend bằng script start-backend.bat và thử lại.');
        }
        
        // Gửi code đến backend để đổi lấy token
        const response = await fetch('http://localhost:3001/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code, 
            redirectUri: `${window.location.origin}/callback`
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          localStorage.setItem(codeId, 'error');
          throw new Error(`Lỗi khi xác thực với backend: ${errorData.message || response.statusText}. Chi tiết: ${JSON.stringify(errorData.error || {})}`);
        }
        
        const data = await response.json();
        console.log("Authentication successful, received data:", {
          hasAccessToken: !!data.access_token,
          hasRefreshToken: !!data.refresh_token,
          hasProfile: !!data.profile,
          roles: data.profile?.roles
        });
        
        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem('kc_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('kc_refresh_token', data.refresh_token);
        }
        
        // Đảm bảo profile có vai trò
        if (!data.profile.roles || data.profile.roles.length === 0) {
          console.log("No roles found in profile, adding default role: user");
          data.profile.roles = ['user'];
        }
        
        localStorage.setItem('kc_profile', JSON.stringify(data.profile));
        localStorage.setItem(codeId, 'success');
        
        // Chuyển hướng người dùng dựa trên vai trò
        console.log("Redirecting based on roles:", data.profile?.roles);
        redirectBasedOnRole(data.profile);
      } catch (err: any) {
        console.error('Lỗi xử lý callback:', err);
        localStorage.setItem(codeId, 'error');
        setError(err.message || 'Đã xảy ra lỗi khi xử lý đăng nhập. Vui lòng thử lại.');
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    }
    
    // Hàm chuyển hướng dựa trên vai trò
    function redirectBasedOnRole(profile: any) {
      console.log("CallbackPage - redirectBasedOnRole: Profile received:", JSON.stringify(profile));
      
      // Đánh dấu đã xử lý để tránh xử lý lại
      hasProcessedRef.current = true;
      
      // Xác định URL đích dựa trên vai trò
      let targetUrl = '/login';
      
      if (!profile || (!profile.roles && !profile.groups)) {
        console.log("No roles or groups found in profile, redirecting to login");
        window.location.replace('/login');
        return;
      }
      
      const roles = (profile.roles || []) as string[];
      const groups = (profile.groups || []).map((g: string) => g.startsWith('/') ? g.substring(1) : g) as string[];

      console.log("CallbackPage - redirectBasedOnRole: Effective Roles:", roles);
      console.log("CallbackPage - redirectBasedOnRole: Effective Groups:", groups);

      if (roles.includes('portal-admin')) {
        targetUrl = '/portal/admin';
      } else if (roles.includes('admin')) { // Giữ lại vai trò admin cũ nếu vẫn tồn tại
        targetUrl = '/admin';
      } else if (groups.includes('Marketing')) {
        targetUrl = '/portal/marketing';
      } else if (groups.includes('Engineering')) {
        targetUrl = '/portal/engineering';
      } else if (groups.includes('Finance')) {
        targetUrl = '/portal/finance';
      } else if (groups.includes('Partners')) {
        targetUrl = '/portal/partners';
      } else if (roles.includes('employee')) {
        targetUrl = '/portal/dashboard';
      } else if (roles.includes('user')) { // Catch-all for basic users without other specific roles/groups
        targetUrl = '/portal/dashboard';
      }
      
      console.log(`Redirecting to ${targetUrl}`);
      
      // Sử dụng window.location.replace thay vì href để tránh lưu trang callback trong history
      window.location.replace(targetUrl);
    }
    
    handleCallback();
    
    // Cleanup function
    return () => {
      isProcessingRef.current = false;
    };
  }, [searchParams, router]);
  
  // Sử dụng suppressHydrationWarning để tránh lỗi hydration
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4" suppressHydrationWarning>
      <div className="w-full max-w-md text-center" suppressHydrationWarning>
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" suppressHydrationWarning></div>
            <h2 className="text-xl font-semibold mb-2" suppressHydrationWarning>Đang xử lý đăng nhập...</h2>
            <p className="text-muted-foreground" suppressHydrationWarning>Vui lòng đợi trong giây lát.</p>
          </>
        ) : error ? (
          <>
            <div className="bg-destructive/10 p-4 rounded-lg mb-4" suppressHydrationWarning>
              <p className="text-destructive font-medium" suppressHydrationWarning>{error}</p>
            </div>
            <button 
              onClick={() => router.push('/login')} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              suppressHydrationWarning
            >
              Quay lại trang đăng nhập
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
} 