# Xử lý lỗi Hydration trong Next.js

## Vấn đề hydration mismatch

Trong ứng dụng Next.js, sự không khớp nhau giữa HTML được render bởi server (Server-Side Rendering - SSR) và HTML được tạo ra ở client (Client-Side Rendering - CSR) có thể dẫn đến lỗi hydration. Lỗi này thường hiển thị thông báo như:

```
Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

### Nguyên nhân chính

Các nguyên nhân phổ biến của lỗi hydration bao gồm:

1. **Browser Extensions**: Tiện ích mở rộng trình duyệt thêm thuộc tính vào DOM
2. **Phân nhánh server/client**: Code kiểu `if (typeof window !== 'undefined')`
3. **Giá trị ngẫu nhiên/thời gian**: Sử dụng `Date.now()` hoặc `Math.random()`
4. **Nội dung động**: HTML được tạo khác nhau giữa server và client
5. **Các thuộc tính tự động**: Thuộc tính được thêm vào bởi trình duyệt sau khi tải DOM

## Giải pháp đã áp dụng

Trong dự án Greeting-View, chúng ta đã áp dụng các giải pháp sau để khắc phục lỗi hydration:

### 1. Sử dụng suppressHydrationWarning

Trong `layout.tsx`, chúng ta đã thêm thuộc tính `suppressHydrationWarning` vào thẻ body:

```tsx
<body className="font-body antialiased" suppressHydrationWarning={true}>
  <ClientLayoutWrapper>
    {children}
  </ClientLayoutWrapper>
  <Toaster />
</body>
```

Thuộc tính này giúp React bỏ qua cảnh báo hydration cho phần tử cụ thể (và con cháu trực tiếp của nó).

### 2. Double Rendering Pattern

Trong `ClientLayoutWrapper.tsx`, chúng ta sử dụng kỹ thuật "Double Rendering":

```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  // Trả về phiên bản đơn giản khi đang ở phía server
  return <>{children}</>;
}

// Rendering đầy đủ với context providers ở phía client
return <AuthProvider>{children}</AuthProvider>;
```

Pattern này đảm bảo:
- Trong lần render đầu tiên (server và client), không có AuthProvider
- Sau khi hydration xong (useEffect chạy), render lại với AuthProvider

### 3. Kiểm tra môi trường trong hooks

Trong `keycloak.ts` và `auth-context.tsx`, chúng ta đã thêm kiểm tra môi trường để tránh truy cập APIs chỉ có ở client (như localStorage, window) khi đang ở server:

```tsx
// Kiểm tra môi trường chạy
const isBrowser = typeof window !== 'undefined';

// Sử dụng trong các hàm
if (isBrowser) {
  // Code chỉ chạy ở client
  localStorage.getItem('...');
}
```

### 4. Mounted state trong AuthProvider

Trong `auth-context.tsx`, chúng ta đã thêm `mounted` state để theo dõi trạng thái của AuthContext:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <>{children}</>;
}
```

Giải pháp này đảm bảo AuthContext chỉ được thiết lập ở phía client, sau khi component đã được mount.

## Nguyên tắc chung khi xử lý hydration

1. **Ưu tiên Static Generation**: Khi có thể, ưu tiên sử dụng Static Generation thay vì SSR
2. **Tránh truy cập API chỉ có ở client**: Ví dụ localStorage, window, document
3. **Sử dụng useEffect để trì hoãn code phụ thuộc client**: Chỉ thực hiện trong useEffect
4. **Sử dụng suppressHydrationWarning một cách thận trọng**: Chỉ khi cần thiết
5. **Double Rendering Pattern**: Render nội dung đơn giản ở server, nội dung đầy đủ ở client

## Tài liệu tham khảo

- [Next.js Documentation: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Documentation: Hydration](https://react.dev/reference/react-dom/hydrate)
- [Hydration Mismatch in React](https://react.dev/link/hydration-mismatch)

# Ghi chú về vấn đề SSR và Hydration trong Next.js

NextJS sử dụng React Server Components và Server-Side Rendering, điều này có thể gây ra một số vấn đề khi kết hợp với các thư viện client-side như Keycloak. Tài liệu này ghi lại các vấn đề chúng ta đã gặp và cách giải quyết.

## Vấn đề 1: Hydration Mismatch

**Mô tả lỗi:** Các component hỗ trợ SSR của Next.js được render trước trên server, sau đó "hydrate" trên client. Khi trạng thái ban đầu của component trên server khác với client (ví dụ: dữ liệu xác thực), React sẽ báo lỗi `Text content does not match server-rendered HTML`.

**Giải pháp:**
1. Sử dụng `suppressHydrationWarning` trong component cha (body) để ngăn cảnh báo
2. Triển khai mẫu "Double Rendering" để tránh sự không khớp:

```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  // Render phiên bản đơn giản hoặc loading placeholder khi ở server
  return <SimplifiedVersion />;
}

// Render phiên bản đầy đủ với chức năng client-side
return <FullVersion />;
```

## Vấn đề 2: Truy cập API trong quá trình server render

**Mô tả lỗi:** Các hooks truy cập API cố gắng gọi API trong quá trình render server, gây lỗi vì không có khả năng truy cập API từ server.

**Giải pháp:**
1. Kiểm tra môi trường trước khi gọi API:

```tsx
const fetchData = async () => {
  if (typeof window === 'undefined') {
    return initialData; // Dữ liệu mặc định hoặc rỗng khi ở server
  }
  
  // Tiếp tục gọi API khi ở client
  const response = await api.get('/endpoint');
  return response.data;
};
```

2. Sử dụng dynamic imports với `{ ssr: false }` cho các component chỉ hoạt động trên client:

```tsx
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

## Vấn đề 3: Hook Context không được bao bọc đúng cách

**Mô tả lỗi:** Lỗi `useAuth must be used within an AuthProvider` xảy ra khi component sử dụng hook `useAuth` nhưng không được bao bọc trong `AuthProvider`.

**Giải pháp:**
1. Cập nhật `ClientLayoutWrapper` để chỉ bao bọc các trang cần xác thực với `AuthProvider`:

```tsx
export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kiểm tra xem đường dẫn hiện tại có phải là trang login hay không
  const isLoginPage = pathname === '/login';
  
  // Nếu đang ở trang login, không cần bao bọc bằng AuthProvider
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isClient) {
    // Trả về phiên bản đơn giản khi đang ở server
    return <>{children}</>;
  }

  // Chỉ bao bọc bằng AuthProvider khi không phải trang login và đã ở client
  return <AuthProvider>{children}</AuthProvider>;
}
```

2. Sửa đổi các component sử dụng `useAuth` để xử lý trường hợp hook chưa sẵn sàng:

```tsx
function SafeAuthComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hiển thị loading khi chưa mount
  if (!mounted) {
    return <LoadingSpinner />;
  }
  
  try {
    const auth = useAuth();
    // Sử dụng auth...
  } catch (error) {
    console.error("Error using useAuth", error);
    return <FallbackUI />;
  }
}
```

3. Loại bỏ HOC `withAuth` và sử dụng hook trực tiếp cho các trang người dùng đã đăng nhập.

## Tóm tắt các giải pháp

1. Sử dụng double rendering pattern để giải quyết sự không khớp giữa SSR và CSR
2. Thêm kiểm tra môi trường (`typeof window !== 'undefined'`) trước khi gọi API
3. Sử dụng `useState` và `useEffect` để theo dõi trạng thái mounted
4. Xử lý khác biệt giữa trang công khai (public) và trang yêu cầu xác thực
5. Sử dụng try-catch khi gọi hook trong component có thể được render trên server 