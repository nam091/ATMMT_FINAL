# Hướng dẫn Cài đặt Biến Môi trường

Tài liệu này giải thích cách thiết lập các biến môi trường (environment variables) cho ứng dụng Greeting-View trong các kịch bản phát triển (development) và triển khai (deployment) khác nhau.

## Tổng quan về các File Môi trường

Dự án sử dụng ba file môi trường chính:

1.  **Môi trường Frontend** - `.env` (sao chép từ `.env.example`) trong thư mục gốc của dự án.  
    Chứa cấu hình cho frontend Next.js.

2.  **Môi trường Backend** - `.env` (sao chép từ `.env.example`) trong thư mục `backend/`.  
    Chứa cấu hình cho backend Express.

3.  **Môi trường Docker** - `.env` (sao chép từ `.env.docker`) trong thư mục gốc của dự án.  
    Chứa cấu hình cho toàn bộ Docker Compose stack.

## Thiết lập cho Phát triển Local (Local Development)

### Cài đặt Frontend (Next.js)

1.  Sao chép file ví dụ:
    ```bash
    cp .env.example .env
    ```

2.  Cập nhật các biến nếu cần:
    - `NEXT_PUBLIC_API_URL`: URL của backend API của bạn (mặc định: http://localhost:3001)
    - `NEXT_PUBLIC_KEYCLOAK_URL`: URL của Keycloak server của bạn (mặc định: http://localhost:8080)
    - `NEXT_PUBLIC_KEYCLOAK_REALM`: Tên Keycloak realm của bạn (mặc định: greeting-view)
    - `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: Frontend client ID (mặc định: greeting-view-frontend)
    - Các cài đặt bổ sung có thể được tùy chỉnh nếu cần.

3.  Khởi động frontend:
    ```bash
    npm run dev
    ```

### Cài đặt Backend (Express)

1.  Di chuyển đến thư mục backend:
    ```bash
    cd backend
    ```

2.  Sao chép file ví dụ:
    ```bash
    cp .env.example .env
    ```

3.  Cập nhật các biến nếu cần:
    - `KEYCLOAK_URL`: URL của Keycloak server của bạn
    - `KEYCLOAK_REALM`: Tên Keycloak realm của bạn
    - `KEYCLOAK_CLIENT_ID`: Backend client ID
    - `KEYCLOAK_SECRET`: Client secret từ Keycloak
    - `SESSION_SECRET`: Secret cho mã hóa session

4.  Khởi động backend:
    ```bash
    npm run dev
    ```

## Môi trường Production

Đối với việc triển khai production, các file môi trường tương tự nên được thiết lập với:

- Các URL production thay vì `localhost`
- Các URL HTTPS thay vì HTTP
- Các secrets phù hợp cho production
- Các cài đặt bảo mật bổ sung

**Không bao giờ commit các file `.env` thực tế chứa secrets lên version control.** Các file `.env.example` và `.env.docker` chỉ dùng làm mẫu (templates).

## Cài đặt Keycloak Realm

Sau khi khởi động Keycloak, bạn sẽ cần thiết lập realm:

1.  Truy cập Keycloak tại http://localhost:8080
2.  Tạo một realm mới tên là "greeting-view"
3.  Tạo hai clients:
    -   `greeting-view-frontend` (public)
    -   `greeting-view-backend` (confidential, với service account)
4.  Tạo các roles: admin, teacher, student (Hoặc các roles mới theo kế hoạch của bạn như `employee`, `portal-admin`, etc.)
5.  Cấu hình client secrets trong các file `.env` của bạn.

Tham khảo [tài liệu Keycloak](https://www.keycloak.org/documentation) (Keycloak documentation) để biết hướng dẫn cài đặt chi tiết. (Hoặc tốt hơn, tham khảo file `keycloak-setup.md` trong thư mục `docs` của dự án này). 