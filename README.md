# Greeting View Project

Chào mừng bạn đến với dự án Greeting View! Ứng dụng này bao gồm một backend API và một frontend được tích hợp với Keycloak để xác thực và ủy quyền.

## Cấu trúc dự án

```
Greeting-View/
├── backend/               # API Backend (Node.js/Express)
├── frontend/              # Frontend (Next.js)
├── docs/                  # Thư mục chứa các tài liệu hướng dẫn
│   ├── environment-setup.md # Hướng dẫn cài đặt biến môi trường
│   ├── keycloak-setup.md    # Hướng dẫn cài đặt và cấu hình Keycloak chi tiết
│   └── ssr-hydration-fixes.md # Ghi chú về SSR và Hydration trong Next.js
└── ... (các file và thư mục khác)
```

## Yêu cầu hệ thống

- Node.js v18+

## Hướng dẫn cài đặt và khởi chạy (Local Development)

### 1. Cài đặt Keycloak

Để ứng dụng hoạt động, bạn cần cài đặt và cấu hình Keycloak. Vui lòng tham khảo hướng dẫn chi tiết tại:
[Hướng Dẫn Cài Đặt Keycloak](./docs/keycloak-setup.md)

**Thông tin đăng nhập Keycloak (sau khi cài đặt theo hướng dẫn):**
- URL: http://localhost:8080
- Realm: `greeting-view`
- Admin credentials: `admin`/`admin` (hoặc theo cấu hình của bạn)

### 2. Cài đặt Backend

1.  Di chuyển đến thư mục `backend`:
    ```bash
    cd backend
    ```
2.  Cài đặt các dependencies:
    ```bash
    npm install
    ```
3.  Thiết lập biến môi trường:
    Sao chép file `.env.example` thành `.env` và cập nhật các giá trị nếu cần. Tham khảo [Hướng dẫn cài đặt biến môi trường](./docs/environment-setup.md) để biết thêm chi tiết.
    ```bash
    cp .env.example .env
    ```
4.  Khởi động server backend:
    ```bash
    npm run dev
    ```
    Backend API sẽ chạy tại `http://localhost:3001`.

### 3. Cài đặt Frontend

1.  Di chuyển đến thư mục `frontend`:
    ```bash
    cd frontend
    ```
2.  Cài đặt các dependencies:
    ```bash
    npm install
    ```
3.  Thiết lập biến môi trường:
    Sao chép file `../.env.example` (từ thư mục gốc của `Greeting-View`) thành `.env` trong thư mục `frontend` và cập nhật các giá trị nếu cần. Tham khảo [Hướng dẫn cài đặt biến môi trường](./docs/environment-setup.md).
    ```bash
    cp ../.env.example .env 
    # Hoặc tạo file .env thủ công với nội dung tương tự .env.example ở thư mục gốc
    ```
    Nội dung file `.env` cho frontend ví dụ:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:3001
    NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
    NEXT_PUBLIC_KEYCLOAK_REALM=greeting-view
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=greeting-view-frontend
    ```
4.  Khởi động server frontend:
    ```bash
    npm run dev
    ```
    Frontend sẽ chạy tại `http://localhost:9002`.

## Xử lý sự cố thường gặp

### Lỗi kết nối Backend hoặc Keycloak
- Đảm bảo Keycloak đã được khởi động và cấu hình đúng theo [hướng dẫn](./docs/keycloak-setup.md).
- Đảm bảo backend server đã khởi động và chạy tại `http://localhost:3001`.
- Kiểm tra các biến môi trường trong file `.env` của cả backend và frontend đã chính xác.
- Kiểm tra console log của backend và trình duyệt (frontend) để tìm thông báo lỗi chi tiết.

### Lỗi liên quan đến Next.js và Hydration
Tham khảo tài liệu [Xử lý lỗi Hydration trong Next.js](./docs/ssr-hydration-fixes.md) để biết các giải pháp.
