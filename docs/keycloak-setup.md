# Hướng Dẫn Cấu Hình Keycloak Chi Tiết

## Mục lục

1. [Giới thiệu về Keycloak](#giới-thiệu-về-keycloak)
2. [Kiến trúc tích hợp](#kiến-trúc-tích-hợp)
3. [Cài đặt Keycloak với Docker](#cài-đặt-keycloak-với-docker)
4. [Cấu hình Realm](#cấu-hình-realm)
5. [Quản lý vai trò (Roles)](#quản-lý-vai-trò-roles)
6. [Tạo và cấu hình Clients](#tạo-và-cấu-hình-clients)
7. [Quản lý người dùng](#quản-lý-người-dùng)
8. [Cấu hình Token Claims](#cấu-hình-token-claims)
9. [Cấu hình CORS](#cấu-hình-cors)
10. [Lấy Public Key và Client Secrets](#lấy-public-key-và-client-secrets)
11. [Xác thực và phân quyền](#xác-thực-và-phân-quyền)
12. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)
13. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Giới thiệu về Keycloak

Keycloak là một giải pháp quản lý danh tính và truy cập mã nguồn mở, cung cấp Single Sign-On (SSO), quản lý người dùng, và phân quyền cho các ứng dụng web và API. Keycloak hỗ trợ các chuẩn mở như OAuth 2.0, OpenID Connect và SAML.

### Lợi ích chính của Keycloak:

- **Single Sign-On (SSO)**: Người dùng đăng nhập một lần để truy cập nhiều ứng dụng
- **Bảo mật**: Hỗ trợ hai yếu tố xác thực, mã hóa mật khẩu...
- **Phân quyền**: Kiểm soát truy cập dựa trên vai trò (RBAC)
- **Dễ tích hợp**: Hỗ trợ nhiều ngôn ngữ và framework
- **Tùy chỉnh cao**: Có thể thay đổi giao diện, luồng xác thực...

## Kiến trúc tích hợp

Dưới đây là kiến trúc đơn giản của hệ thống Greeting-View tích hợp với Keycloak:

```
┌─────────────┐      ┌───────────┐      ┌───────────┐
│  Frontend   │ ◄──► │  Backend  │ ◄──► │ Keycloak  │
│  (Next.js)  │      │ (Express) │      │  Server   │
└─────────────┘      └───────────┘      └───────────┘
                                             ▲
                                             │
                                             ▼
                                        ┌───────────┐
                                        │PostgreSQL │
                                        │ Database  │
                                        └───────────┘
```

### Luồng xác thực:

1. Người dùng truy cập Frontend và nhấn "Đăng nhập"
2. Frontend chuyển hướng người dùng đến trang đăng nhập Keycloak
3. Người dùng đăng nhập thành công trên Keycloak
4. Keycloak tạo token và chuyển hướng người dùng quay lại Frontend
5. Frontend lưu trữ token và sử dụng để gọi Backend API
6. Backend API xác thực token với Keycloak và kiểm tra quyền

## Cài đặt Keycloak với Docker

Cách đơn giản nhất để cài đặt Keycloak là sử dụng Docker Compose:

1. Kiểm tra `docker-compose.yml` đã bao gồm:
   ```yaml
   keycloak:
     image: quay.io/keycloak/keycloak:22.0.5
     ports:
       - "8080:8080"
     environment:
       - KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN:-admin}
       - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
       - KC_DB=postgres
       - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
       - KC_DB_USERNAME=${POSTGRES_USER:-keycloak}
       - KC_DB_PASSWORD=${POSTGRES_PASSWORD:-keycloak}
     command: ["start-dev"]
     depends_on:
       - postgres
   
   postgres:
     image: postgres:14
     ports:
       - "5432:5432"
     environment:
       - POSTGRES_USER=${POSTGRES_USER:-keycloak}
       - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-keycloak}
       - POSTGRES_DB=${POSTGRES_DB:-keycloak}
     volumes:
       - postgres-data:/var/lib/postgresql/data
   ```

2. Khởi động dịch vụ:
   ```bash
   docker-compose up -d
   ```

3. Kiểm tra trạng thái:
   ```bash
   docker-compose ps
   ```

4. Kiểm tra log nếu gặp vấn đề:
   ```bash
   docker-compose logs -f keycloak
   ```

## Cấu hình Realm

### Khái niệm Realm

Realm là một khái niệm quan trọng trong Keycloak, tương đương với một không gian làm việc riêng biệt có cấu hình và người dùng riêng. Mỗi ứng dụng hoặc nhóm ứng dụng nên sử dụng một realm riêng.

### Các bước tạo Realm mới:

1. Truy cập Admin Console (http://localhost:8080/admin) và đăng nhập với tài khoản admin

2. Trên menu bên trái, click vào dropdown tên realm hiện tại (thường là "master")

3. Click nút "Create Realm"

4. Điền thông tin realm mới:
   - Name: `greeting-view`
   - Bật "Enabled"
   - (Tùy chọn) Thêm mô tả
   - (Tùy chọn) Tải lên biểu tượng cho realm

5. Click "Create"

### Cấu hình Realm Settings:

1. Di chuyển đến "Realm Settings" trong menu trái
2. Tab "General":
   - Display name: Greeting-View
   - User-managed access: OFF (Mặc định)

3. Tab "Login":
   - User registration: OFF (nếu không muốn cho phép người dùng tự đăng ký)
   - Forgot password: ON (cho phép đặt lại mật khẩu)
   - Remember me: ON

4. Tab "Tokens":
   - Default Signature Algorithm: RS256
   - Access Token Lifespan: 5 Minutes (mặc định)
   - Giữ các giá trị còn lại mặc định

5. Lưu các thay đổi

## Quản lý vai trò (Roles)

### Tạo Realm Roles:

1. Trong menu bên trái của realm `greeting-view`, chọn "Realm roles"
2. Click "Create role"
3. Tạo vai trò đầu tiên:
   - Name: `admin`
   - Description: `Quyền quản trị`
   - Click "Save"

4. Tạo vai trò thứ hai:
   - Name: `teacher`
   - Description: `Quyền giáo viên`
   - Click "Save"

5. Tạo vai trò thứ ba:
   - Name: `student`
   - Description: `Quyền học sinh`
   - Click "Save"

### Tạo Composite Roles (Tùy chọn):

Nếu muốn một vai trò kế thừa quyền từ vai trò khác, bạn có thể tạo Composite Role:

1. Mở một vai trò (ví dụ: `admin`)
2. Chuyển đến tab "Composite Roles"
3. Bật "Composite Roles"
4. Chọn các vai trò con muốn thêm vào vai trò này
5. Click "Add selected" và "Save"

## Tạo và cấu hình Clients

### Khái niệm Client

Trong Keycloak, Client đại diện cho một ứng dụng hoặc dịch vụ mà người dùng có thể đăng nhập. Mỗi client có cấu hình và mã định danh riêng.

### Tạo Client cho Backend:

1. Trong menu bên trái, chọn "Clients"
2. Click "Create client"
3. Step 1: Điền thông tin client mới:
   - Client type: `OpenID Connect`
   - Client ID: `greeting-view-backend`
   - Để trống "Name" và "Description" (tùy chọn)
   - Click "Next"

4. Step 2: Cấu hình Client:
   - Client authentication: `ON` (client is confidential)
   - Authorization: `OFF`
   - Authentication flow:
     - Standard flow: OFF
     - Direct access grants: ON
     - Service accounts roles: ON
   - Click "Next"

5. Step 3: Cấu hình Login:
   - Valid redirect URIs: `http://localhost:3001/*`
   - Web origins: `+` (chấp nhận tất cả) hoặc `http://localhost:3001`
   - Click "Save"

### Tạo Client cho Frontend:

1. Trong menu bên trái, chọn "Clients"
2. Click "Create client"
3. Step 1: Điền thông tin client mới:
   - Client type: `OpenID Connect`
   - Client ID: `greeting-view-frontend`
   - Để trống "Name" và "Description" (tùy chọn)
   - Click "Next"

4. Step 2: Cấu hình Client:
   - Client authentication: `OFF` (public client)
   - Authorization: `OFF`
   - Authentication flow:
     - Standard flow: ON
     - Implicit flow: OFF
     - Direct access grants: OFF
   - Click "Next"

5. Step 3: Cấu hình Login:
   - Root URL: `http://localhost:9002` (tùy chọn)
   - Home URL: `http://localhost:9002` (tùy chọn)
   - Valid redirect URIs: `http://localhost:9002/*`
   - Web origins: `http://localhost:9002`
   - Click "Save"

### Cấu hình Frontend Client:

Sau khi tạo Frontend Client, thực hiện các cấu hình bổ sung:

1. Đi đến tab "Settings"
2. Đảm bảo các cài đặt sau:
   - Access Type: public
   - Standard Flow Enabled: ON
   - Implicit Flow Enabled: OFF
   - Direct Access Grants Enabled: OFF
   - Service Accounts Enabled: OFF
   - Authorization Enabled: OFF
   - Consent Required: OFF
3. Click "Save"

## Quản lý người dùng

### Tạo người dùng Admin:

1. Trong menu bên trái, chọn "Users"
2. Click "Add user"
3. Điền thông tin người dùng:
   - Username: `admin_user`
   - Email: `admin@example.com`
   - First name: `Admin`
   - Last name: `User`
   - Bật "Email verified" (để không cần xác thực email)
   - Click "Create"

4. Sau khi tạo, mở tab "Credentials"
5. Click "Set password"
6. Nhập mật khẩu và xác nhận
7. Tắt "Temporary" để người dùng không phải đổi mật khẩu khi đăng nhập lần đầu
8. Click "Save"
9. Xác nhận bằng cách click "Set Password" trong hộp thoại hiện ra

10. Đi đến tab "Role mappings"
11. Trong phần "Realm roles", chọn vai trò `admin` từ danh sách "Available roles"
12. Click "Assign" để thêm vai trò

### Tạo người dùng Teacher:

1. Lặp lại các bước tạo người dùng với thông tin:
   - Username: `teacher_user`
   - Email: `teacher@example.com`
   - First name: `Teacher`
   - Last name: `User`
   
2. Đặt mật khẩu như hướng dẫn trên
3. Gán vai trò `teacher` trong tab "Role mappings"

### Tạo người dùng Student:

1. Lặp lại các bước tạo người dùng với thông tin:
   - Username: `student_user`
   - Email: `student@example.com`
   - First name: `Student`
   - Last name: `User`
   
2. Đặt mật khẩu như hướng dẫn trên
3. Gán vai trò `student` trong tab "Role mappings"

## Cấu hình Service Account cho Backend Client

Backend client cần quyền để xác thực và phân quyền:

1. Trở lại "Clients" trong menu bên trái
2. Chọn client `greeting-view-backend`
3. Đi đến tab "Service Account Roles"
4. Trong phần "Realm roles", thêm các vai trò `admin`, `teacher`, và `student` cho Service Account
5. Click "Assign"

## Cấu hình Token Claims

Token Claims là thông tin được nhúng trong token, giúp ứng dụng biết về người dùng và quyền của họ.

### Thêm Realm Roles vào Token:

1. Trong menu bên trái, chọn "Client scopes"
2. Tìm scope cho backend client (thường là `greeting-view-backend-dedicated`)
3. Click vào scope này
4. Đi đến tab "Mappers"
5. Click "Configure a new mapper"
6. Chọn "User Realm Role"
7. Điền thông tin:
   - Name: `realm-roles`
   - Token Claim Name: `roles` (hoặc `realm_access.roles`)
   - Claim JSON Type: `String`
   - Bật "Add to ID token" và "Add to access token"
   - Click "Save"

### Kiểm tra Token:

1. Đi đến "Clients" > `greeting-view-frontend` > "Client scopes"
2. Click vào scope mặc định
3. Tab "Evaluate"
4. Chọn một user và click "Evaluate"
5. Kiểm tra tab "Generated Access Token" để xem claim `roles` đã được thêm chưa

## Cấu hình CORS

Cross-Origin Resource Sharing (CORS) cần được cấu hình để Frontend có thể gọi Backend API và Keycloak:

1. Trong menu bên trái, chọn "Realm settings"
2. Mở tab "Security Defenses"
3. Cuộn xuống phần "CORS"
4. Thêm các origins:
   ```
   http://localhost:3001
   http://localhost:9002
   ```
5. Click "Save"

## Lấy Public Key và Client Secrets

### Lấy Public Key của Realm:

1. Trong menu bên trái, chọn "Realm settings"
2. Mở tab "Keys"
3. Tìm key type "RSA" và algorithm "RS256"
4. Click vào "Public key"
5. Copy giá trị hiển thị
6. Lưu giá trị này vào biến môi trường `KEYCLOAK_PUBLIC_KEY` trong file `.env` của backend

### Lấy Client Secret của Backend:

1. Đi đến "Clients" > `greeting-view-backend`
2. Mở tab "Credentials"
3. Copy giá trị "Client secret"
4. Lưu vào biến môi trường `KEYCLOAK_SECRET` trong các file `.env` của backend và Docker

## Xác thực và phân quyền

### Các loại Token:
- **Access Token**: Sử dụng để truy cập tài nguyên (thời gian sống ngắn)
- **Refresh Token**: Dùng để lấy Access Token mới khi hết hạn (thời gian sống dài)
- **ID Token**: Chứa thông tin về danh tính người dùng

### Quy trình xác thực:

1. Người dùng click "Đăng nhập" trên Frontend
2. Chuyển hướng đến trang đăng nhập Keycloak
3. Người dùng nhập thông tin đăng nhập
4. Keycloak xác thực thông tin
5. Chuyển hướng người dùng về Frontend với mã xác thực
6. Frontend đổi mã xác thực lấy token
7. Frontend lưu trữ token và sử dụng cho các yêu cầu API
8. Backend xác thực token với Keycloak
9. Backend kiểm tra quyền và trả về dữ liệu

### Quy trình làm mới token:

1. Frontend phát hiện token hết hạn
2. Gửi refresh token đến Keycloak
3. Nhận token mới từ Keycloak
4. Cập nhật token trong localStorage

### Kiểm tra quyền:

Backend sử dụng middleware Keycloak-connect để kiểm tra quyền:

```javascript
// Bảo vệ route cho admin
app.get('/api/admin-data', keycloak.protect('realm:admin'), (req, res) => {
  // Only admin can access
});

// Bảo vệ route cho giáo viên
app.get('/api/teacher-data', keycloak.protect('realm:teacher'), (req, res) => {
  // Only teacher can access
});
```

Frontend sử dụng React Context để kiểm tra quyền:

```javascript
// Kiểm tra trong component
const { hasRole } = useAuth();

if (hasRole('admin')) {
  // Hiển thị nội dung chỉ dành cho admin
}
```

## Xử lý lỗi thường gặp

1. **CORS Issues**:
   - Lỗi: "Access to XMLHttpRequest has been blocked by CORS policy"
   - Giải pháp: Kiểm tra cấu hình CORS trong Realm Settings

2. **Invalid Token**:
   - Lỗi: "Token verification failed"
   - Giải pháp: Kiểm tra Public Key, thời hạn token, và cấu hình client

3. **Unauthorized**:
   - Lỗi: "Not authorized to access this resource"
   - Giải pháp: Kiểm tra vai trò đã được gán cho người dùng và mapper đã được cấu hình đúng

4. **Redirect URI Issues**:
   - Lỗi: "Invalid redirect URI" hoặc "Redirect URI doesn't match"
   - Giải pháp: Đảm bảo URI chính xác trong cấu hình client

5. **Invalid Client**:
   - Lỗi: "Invalid client or Invalid client credentials"
   - Giải pháp: Kiểm tra Client ID và Client Secret

## Tài liệu tham khảo

- [Keycloak Official Documentation](https://www.keycloak.org/documentation)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Securing Applications with Keycloak](https://www.keycloak.org/docs/latest/securing_apps/)
- [Keycloak REST API Documentation](https://www.keycloak.org/docs/latest/rest-api/)
