# Xử lý lỗi Hydration trong Next.js

## Vấn đề hydration mismatch (không khớp khi hydrate)

Trong ứng dụng Next.js, sự không khớp nhau giữa HTML được render bởi server (Server-Side Rendering - SSR) và HTML được tạo ra ở client (Client-Side Rendering - CSR) có thể dẫn đến lỗi hydration. Lỗi này thường hiển thị thông báo như:

```
Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
(Lỗi: Một cây DOM đã được hydrate nhưng một số thuộc tính của HTML được render từ server không khớp với các thuộc tính ở client.)
```

Hoặc các biến thể khác như `Text content does not match server-rendered HTML`, `Hydration failed because the initial UI does not match what was rendered on the server.`

### Nguyên nhân chính

Các nguyên nhân phổ biến của lỗi hydration bao gồm:

1.  **Browser Extensions (Tiện ích mở rộng trình duyệt)**: Các tiện ích mở rộng trình duyệt có thể sửa đổi DOM sau khi server render, ví dụ thêm các thuộc tính vào thẻ `<html>` hoặc `<body>`.
2.  **Phân nhánh logic server/client không đúng cách**: Sử dụng code kiểm tra môi trường như `if (typeof window !== 'undefined')` để render nội dung khác nhau giữa server và client mà không có cơ chế xử lý hydration phù hợp.
3.  **Giá trị ngẫu nhiên hoặc phụ thuộc thời gian**: Sử dụng `Date.now()`, `Math.random()`, hoặc các giá trị thay đổi giữa mỗi lần render có thể gây ra sự không khớp.
4.  **Nội dung động không nhất quán**: HTML được tạo ra khác nhau giữa server và client do logic điều kiện hoặc dữ liệu khác nhau. Ví dụ, dựa vào `localStorage` hoặc `window.innerWidth` để render giao diện ban đầu.
5.  **Các thuộc tính HTML không hợp lệ hoặc tự động sửa đổi**: Trình duyệt có thể tự sửa đổi cấu trúc HTML không hợp lệ (ví dụ: `<div>` bên trong `<p>`) hoặc các thư viện khác can thiệp vào DOM.
6.  **Sử dụng `useEffect` để thay đổi DOM ngay lập tức**: Nếu `useEffect` chạy và thay đổi DOM ngay sau lần render đầu tiên ở client, nó có thể xảy ra trước khi React hoàn tất việc so sánh, gây ra mismatch.

## Giải pháp đã áp dụng

Trong dự án Greeting-View, chúng ta đã áp dụng các giải pháp sau để khắc phục lỗi hydration:

### 1. Sử dụng `suppressHydrationWarning`

Trong `layout.tsx` (hoặc file layout gốc của bạn), chúng ta có thể thêm thuộc tính `suppressHydrationWarning={true}` vào thẻ `<html>` hoặc `<body>` nếu lỗi không khớp chủ yếu do các thuộc tính được thêm bởi browser extensions hoặc các lý do nhỏ không ảnh hưởng đến cấu trúc chính.

```tsx
// Ví dụ trong src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="font-body antialiased">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
```

Thuộc tính này giúp React bỏ qua cảnh báo hydration cho phần tử cụ thể đó và các phần tử con trực tiếp của nó. Nên sử dụng một cách thận trọng và chỉ khi bạn chắc chắn sự không khớp đó là nhỏ và chấp nhận được.

### 2. Kỹ thuật "Double Rendering" hoặc "Mounted State"

Đối với các component cần render nội dung khác nhau giữa server và client (ví dụ, component dựa vào `localStorage` hoặc thông tin chỉ có ở client), chúng ta sử dụng một state để theo dõi xem component đã được "mount" ở client hay chưa.

Trong `ClientLayoutWrapper.tsx` (ví dụ), chúng ta sử dụng kỹ thuật này để chỉ render `AuthProvider` ở phía client:

```tsx
// src/components/ClientLayoutWrapper.tsx (ví dụ)
"use client"; // Đánh dấu đây là Client Component

import { useState, useEffect, ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context'; // Đường dẫn tới AuthProvider của bạn
import { usePathname } from 'next/navigation';

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true); // Đặt isClient thành true sau khi component đã mount ở client
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register'; //Thêm các trang không cần AuthProvider
  
  if (isAuthPage) { // Nếu là trang login/register, không cần AuthProvider
    return <>{children}</>;
  }

  if (!isClient) { // Đang SSR hoặc chưa mount ở client
    return <>{children}</>; // Hoặc một loading indicator chung
  }

  // Chỉ bao bọc bằng AuthProvider khi không phải trang login/register và đã ở client
  return <AuthProvider>{children}</AuthProvider>;
}
```

Pattern này đảm bảo:
- Trong lần render đầu tiên (cả trên server và lần đầu ở client trước `useEffect`), `AuthProvider` (hoặc các phần tử phụ thuộc client khác) không được render.
- Sau khi component đã mount ở client và `useEffect` chạy, `isClient` được đặt thành `true`, component re-render và lúc này `AuthProvider` mới được bao gồm.

### 3. Kiểm tra môi trường trong hooks và logic

Khi viết các custom hooks hoặc logic có thể chạy trên cả server và client, luôn kiểm tra môi trường trước khi truy cập các API chỉ có ở client (như `localStorage`, `window`, `document`).

```typescript
// Ví dụ trong một custom hook hoặc utility function
const isBrowser = typeof window !== 'undefined';

export function getStoredToken() {
  if (isBrowser) {
    return localStorage.getItem('kc_token');
  }
  return null; // Trả về null hoặc giá trị mặc định khi ở server
}
```

### 4. Sử dụng `useEffect` cho các tác vụ chỉ client

Bất kỳ logic nào phụ thuộc vào môi trường client hoặc cần thay đổi DOM sau khi component đã hiển thị, nên được đặt trong `useEffect`.

```tsx
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Logic này chỉ chạy ở client sau khi component mount
    const clientOnlyData = window.innerWidth;
    // setData(clientOnlyData); // Ví dụ
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần sau khi mount

  return <div>{/* ... */}</div>;
}
```

## Nguyên tắc chung khi xử lý hydration

1.  **Ưu tiên Static Generation (SSG) hoặc Incremental Static Regeneration (ISR)**: Khi có thể, sử dụng SSG/ISR cho các trang không yêu cầu dữ liệu động theo từng request để giảm thiểu sự phức tạp của SSR.
2.  **Tránh truy cập API chỉ có ở client trong logic render ban đầu**: Không dùng `localStorage`, `window`, `document` trực tiếp trong phần render JSX trả về từ server.
3.  **Sử dụng `useEffect` để trì hoãn code phụ thuộc client**: Đặt các tác vụ này trong `useEffect` để chúng chỉ chạy sau khi component đã được mount ở client.
4.  **Sử dụng `suppressHydrationWarning` một cách thận trọng**: Chỉ dùng cho các trường hợp không khớp nhỏ, không thể tránh khỏi và không ảnh hưởng đến UI/UX.
5.  **Kỹ thuật "Mounted State" / "Double Rendering"**: Cho các component bắt buộc phải render khác nhau, hãy đảm bảo lần render đầu tiên (server và client) là giống hệt nhau.
6.  **Dynamic Imports cho Component chỉ Client**: Nếu một component hoàn toàn không có ý nghĩa trên server và chỉ dùng ở client, bạn có thể import động nó với tùy chọn `ssr: false`.
    ```tsx
    import dynamic from 'next/dynamic';

    const MyClientOnlyComponent = dynamic(() => import('../components/MyClientOnlyComponent'), {
      ssr: false,
      loading: () => <p>Loading component...</p> // Optional loading component
    });
    ```

## Tài liệu tham khảo

- [Next.js Documentation: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Documentation: Hydration Errors](https://react.dev/errors/hydration) (Link này có thể thay đổi, tìm "hydration" trên trang react.dev)
- [Understanding Hydration in React applications (Blog Post)](https://www.joshwcomeau.com/react/the-perils-of-rehydration/) (Bài viết rất hay của Josh W. Comeau giải thích về hydration)

# Ghi chú về vấn đề SSR và Hydration trong Next.js (Bản gốc)

(Phần này giữ nguyên cấu trúc từ file gốc của bạn, được điều chỉnh văn phong cho nhất quán)

Next.js sử dụng React Server Components và Server-Side Rendering (SSR), điều này có thể gây ra một số vấn đề khi kết hợp với các thư viện chủ yếu chạy ở client-side như Keycloak.js hoặc các logic xác thực dựa trên trạng thái client. Tài liệu này ghi lại các vấn đề chúng ta đã gặp và cách giải quyết.

## Vấn đề 1: Hydration Mismatch (Không khớp Hydration)

**Mô tả lỗi:** Các component được Next.js render trước trên server (SSR), sau đó "hydrate" (tái tạo trạng thái và gắn event listeners) trên client. Khi trạng thái ban đầu của component trên server khác với trên client (ví dụ: dữ liệu xác thực, thông tin lấy từ `localStorage`), React sẽ báo lỗi như `Text content does not match server-rendered HTML` hoặc các lỗi tương tự liên quan đến hydration.

**Giải pháp đã xem xét/áp dụng:**
1.  Sử dụng `suppressHydrationWarning={true}` trên thẻ `<html>` hoặc `<body>` (hoặc component cha gần nhất gây lỗi) để React bỏ qua các cảnh báo không khớp nhỏ.
2.  Triển khai mẫu "Mounted State" (tương tự "Double Rendering") để đảm bảo lần render đầu tiên trên server và client là giống nhau, sau đó mới render nội dung phụ thuộc client.

    ```tsx
    // Ví dụ cơ bản
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    if (!isClient) {
      // Render phiên bản đơn giản hoặc loading placeholder khi ở server hoặc lần đầu ở client
      return <SimplifiedVersionOrLoading />;
    }

    // Render phiên bản đầy đủ với chức năng client-side
    return <FullClientSideVersion />;
    ```

## Vấn đề 2: Truy cập API client trong quá trình server render

**Mô tả lỗi:** Các custom hooks hoặc component cố gắng truy cập các API chỉ có ở trình duyệt (ví dụ: `window`, `localStorage`, `document`) trong quá trình render phía server, gây ra lỗi vì các đối tượng này không tồn tại trong môi trường Node.js trên server.

**Giải pháp đã xem xét/áp dụng:**
1.  Kiểm tra môi trường trước khi truy cập các API này:

    ```tsx
    const fetchDataDependentOnClient = async () => {
      if (typeof window === 'undefined') {
        // Đang ở server, trả về dữ liệu mặc định, rỗng, hoặc không làm gì cả
        return initialOrEmptyData;
      }
      
      // Đang ở client, tiếp tục logic
      const dataFromLocalStorage = localStorage.getItem('myKey');
      // ...
    };
    ```

2.  Sử dụng `dynamic imports` với tùy chọn `{ ssr: false }` cho các component chỉ nên được render ở phía client:

    ```tsx
    import dynamic from 'next/dynamic';

    const ClientOnlyComponent = dynamic(
      () => import('./path/to/ClientSideComponent'),
      { ssr: false, loading: () => <p>Loading component...</p> }
    );
    ```

## Vấn đề 3: Hook Context không được bao bọc đúng cách hoặc sử dụng sớm

**Mô tả lỗi:** Lỗi như `useAuth must be used within an AuthProvider` (hoặc tương tự cho các context khác) xảy ra khi một component sử dụng hook (ví dụ `useAuth()`) nhưng nó không được render bên trong `AuthProvider` tương ứng, hoặc `AuthProvider` chưa sẵn sàng (ví dụ, đang trong quá trình SSR và `AuthProvider` phụ thuộc client).

**Giải pháp đã xem xét/áp dụng:**
1.  Cập nhật `ClientLayoutWrapper.tsx` (hoặc component layout chính) để chỉ bao bọc các trang/phần cần xác thực với `AuthProvider` và chỉ khi đã ở client (sử dụng kỹ thuật "Mounted State" như ở Vấn đề 1).

    ```tsx
    // Trong ClientLayoutWrapper.tsx
    export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
      const [isClient, setIsClient] = useState(false);
      const pathname = usePathname();
      
      useEffect(() => {
        setIsClient(true);
      }, []);

      const isAuthPage = pathname === '/login' || pathname === '/register'; //Thêm các trang không cần AuthProvider
      
      if (isAuthPage) { // Nếu là trang login/register, không cần AuthProvider
        return <>{children}</>;
      }

      if (!isClient) { // Đang SSR hoặc chưa mount ở client
        return <>{children}</>; // Hoặc một loading indicator chung
      }

      // Chỉ bao bọc bằng AuthProvider khi không phải trang login/register và đã ở client
      return <AuthProvider>{children}</AuthProvider>;
    }
    ```

2.  Trong các component sử dụng hook `useAuth`, có thể thêm một bước kiểm tra "mounted" hoặc try-catch nếu hook đó có thể được gọi trong một ngữ cảnh mà `AuthProvider` chưa tồn tại (ít phổ biến hơn nếu layout được quản lý tốt).

    ```tsx
    // Ví dụ trong một component
    function MyAuthenticatedComponent() {
      const [clientMounted, setClientMounted] = useState(false);
      
      useEffect(() => {
        setClientMounted(true);
      }, []);
      
      if (!clientMounted) {
        return <LoadingSpinner />; // Hoặc null, hoặc một UI chờ
      }
      
      // Giờ mới an toàn để gọi useAuth, giả sử AuthProvider đã được render ở cấp cao hơn
      try {
        const auth = useAuth(); 
        // Sử dụng auth object...
        if (!auth.isAuthenticated) return <RedirectToLogin />;
        return <div>Welcome, {auth.user?.name}</div>;
      } catch (error) {
        // Xử lý trường hợp useAuth() ném lỗi nếu không có Provider
        console.error("useAuth hook error, likely missing AuthProvider:", error);
        return <FallbackUI message="Authentication context not available." />;
      }
    }
    ```

3.  Cân nhắc việc sử dụng HOC (Higher-Order Component) `withAuth` cho các trang yêu cầu xác thực, HOC này có thể chứa logic kiểm tra client-side và hiển thị loading/redirect. Tuy nhiên, với App Router của Next.js, việc quản lý layout và Client Components thường được ưu tiên hơn.

## Tóm tắt các giải pháp

1.  Sử dụng kỹ thuật "Mounted State" (hoặc "Double Rendering") để giải quyết sự không khớp giữa SSR và CSR, đặc biệt với các context provider hoặc component phụ thuộc client.
2.  Thêm kiểm tra môi trường (`typeof window !== 'undefined'`) trước khi truy cập các API của trình duyệt.
3.  Sử dụng `useState(false)` và `useEffect(() => setTrue(true), [])` để trì hoãn việc render các phần phụ thuộc client cho đến sau khi quá trình hydration ban đầu hoàn tất.
4.  Phân biệt rõ ràng giữa các trang công khai (public) và các trang yêu cầu xác thực (protected) trong cấu trúc layout để áp dụng `AuthProvider` một cách hợp lý.
5.  Cẩn trọng khi gọi các custom hooks (đặc biệt là context hooks) trong các component có thể được render trên server; đảm bảo Provider luôn bao bọc chúng ở phía client. 