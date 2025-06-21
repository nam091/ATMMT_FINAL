# Greeting View

Ứng dụng Greeting View với Keycloak, Backend và Frontend.

## Cấu trúc dự án

```
Greeting-View/
├── backend/               # API Backend (Node.js/Express)
├── frontend/              # Frontend (Next.js)
├── docker-compose.yml     # Cấu hình Docker Compose
├── realm-export.json      # Cấu hình Realm Keycloak
├── run-as-admin.bat       # Script khởi động Docker với quyền admin (Windows)
├── start-docker.bat       # Script khởi động Docker (Windows)
├── view-logs.bat          # Script xem logs Docker (Windows)
├── fix-public-dir.bat     # Script sửa lỗi thư mục public (Windows)
└── WINDOWS_GUIDE.md       # Hướng dẫn chi tiết cho Windows
```

## Yêu cầu

- Docker và Docker Compose
- Node.js v18+ (cho phát triển local)

## Khởi động dự án

### Sử dụng Docker (Khuyến nghị)

1. Đảm bảo Docker Desktop đang chạy
2. Mở Command Prompt hoặc PowerShell
3. Di chuyển đến thư mục dự án:
   ```
   cd đường-dẫn-đến/Greeting-View
   ```

4. **Quan trọng**: Nếu đây là lần đầu tiên chạy hoặc bạn gặp lỗi về thư mục public, hãy chạy script sửa lỗi:
   ```
   fix-public-dir.bat
   ```

5. Chạy script khởi động với quyền admin (khuyến nghị):
   ```
   run-as-admin.bat
   ```
   
   Hoặc sử dụng script thông thường:
   ```
   start-docker.bat
   ```
   
   Hoặc sử dụng lệnh Docker Compose trực tiếp:
   ```
   docker-compose up -d --build
   ```

6. Truy cập các dịch vụ:
   - Keycloak: http://localhost:8080
   - Backend API: http://localhost:3001
   - Frontend: http://localhost:9002

7. Để xem logs:
   ```
   view-logs.bat
   ```
   Hoặc:
   ```
   docker-compose logs -f
   ```

### Phát triển local (không sử dụng Docker)

#### Backend

1. Di chuyển đến thư mục backend:
   ```
   cd backend
   ```
2. Cài đặt dependencies:
   ```
   npm install
   ```
3. Khởi động server:
   ```
   npm run dev
   ```

#### Frontend

1. Di chuyển đến thư mục frontend:
   ```
   cd frontend
   ```
2. Cài đặt dependencies:
   ```
   npm install
   ```
3. Khởi động server:
   ```
   npm run dev
   ```

## Thông tin đăng nhập Keycloak

- URL: http://localhost:8080
- Realm: greeting-view
- Admin: admin/admin

## Xử lý sự cố

### Không thể khởi động Docker

1. Kiểm tra Docker Desktop đang chạy
2. Kiểm tra các cổng 8080, 3001, và 9002 không bị sử dụng bởi ứng dụng khác
3. Xem logs Docker:
   ```
   view-logs.bat
   ```
   Hoặc:
   ```
   docker-compose logs -f
   ```

### Lỗi khi build frontend

#### Lỗi về biến môi trường trong Next.js:

1. Đảm bảo file `.env.local` đã được tạo trong thư mục `frontend` với nội dung:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=greeting-view
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=greeting-view-frontend
   ```

2. Sử dụng script `run-as-admin.bat` để tự động tạo file này

#### Lỗi về thư mục public:

Nếu bạn gặp lỗi liên quan đến thư mục public như:
```
failed to solve: failed to compute cache key: failed to calculate checksum of ref klo26m4nu0luefszqlvki56w9::rz7nhpb0ths7hi01dpqk1ub2o: "/app/public": not found
```

Hãy chạy script sửa lỗi:
```
fix-public-dir.bat
```

### Không thể truy cập Keycloak

1. Đảm bảo Keycloak đã khởi động hoàn toàn (có thể mất 1-2 phút)
2. Kiểm tra logs Keycloak:
   ```
   docker-compose logs -f keycloak
   ```

### Không thể truy cập Frontend hoặc Backend

1. Kiểm tra logs của các container:
   ```
   docker-compose logs -f frontend
   docker-compose logs -f backend
   ```
2. Đảm bảo Keycloak đã khởi động hoàn toàn trước khi truy cập Frontend hoặc Backend
