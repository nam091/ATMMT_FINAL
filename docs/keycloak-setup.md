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

Keycloak là một giải pháp quản lý danh tính và truy cập (identity and access management) mã nguồn mở, cung cấp Single Sign-On (SSO), quản lý người dùng, và phân quyền cho các ứng dụng web và API. Keycloak hỗ trợ các chuẩn mở như OAuth 2.0, OpenID Connect và SAML.

### Lợi ích chính của Keycloak:

- **Single Sign-On (SSO)**: Người dùng đăng nhập một lần để truy cập nhiều ứng dụng.
- **Bảo mật (Security)**: Hỗ trợ xác thực hai yếu tố (two-factor authentication), mã hóa mật khẩu...
- **Phân quyền (Authorization)**: Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC).
- **Dễ tích hợp (Easy Integration)**: Hỗ trợ nhiều ngôn ngữ và framework.
- **Tùy chỉnh cao (Highly Customizable)**: Có thể thay đổi giao diện (themes), luồng xác thực (authentication flows)...

## Kiến trúc tích hợp

Dưới đây là kiến trúc đơn giản của hệ thống Greeting-View tích hợp với Keycloak:

```
┌─────────────┐      ┌───────────┐      ┌───────────┐
│  Frontend   │ ◄──► │  Backend  │ ◄──► │ Keycloak  │
│  (Next.js)  │      │ (Express) │      │  Server   │
└─────────────┘      └───────────┘      └───────────┘

```

### Luồng xác thực (Authentication Flow):

1. Người dùng truy cập Frontend và nhấn "Đăng nhập".
2. Frontend chuyển hướng người dùng đến trang đăng nhập Keycloak.
3. Người dùng đăng nhập thành công trên Keycloak.
4. Keycloak tạo token và chuyển hướng người dùng quay lại Frontend.
5. Frontend lưu trữ token và sử dụng để gọi Backend API.
6. Backend API xác thực token với Keycloak và kiểm tra quyền (permissions).

## Cấu hình Realm

### Khái niệm Realm

Realm là một khái niệm quan trọng trong Keycloak, tương đương với một không gian làm việc (tenant) riêng biệt, có cấu hình người dùng, roles, và clients riêng. Mỗi ứng dụng hoặc một nhóm ứng dụng liên quan nên sử dụng một realm riêng để đảm bảo sự cô lập.

### Các bước tạo Realm mới:

1. Truy cập Keycloak Admin Console (thường là http://localhost:8080, sau đó click vào "Administration Console") và đăng nhập bằng tài khoản admin (ví dụ: `admin`/`admin` như cấu hình trong `docker-compose.yml`).

2. Sau khi đăng nhập, bạn sẽ ở trong realm `master`. Trên menu bên trái, click vào dropdown tên realm hiện tại (là "master").

3. Click nút "Create Realm".

4. Điền thông tin cho realm mới:
   - Name: `greeting-view` (hoặc tên realm bạn đã định nghĩa trong file `.env`).
   - Đảm bảo "Enabled" đang được bật (ON).
   - (Tùy chọn) Thêm "Display name" và "HTML Display name" nếu muốn hiển thị tên thân thiện hơn trên UI.
   - (Tùy chọn) Tải lên biểu tượng (logo) cho realm.

5. Click "Create".

### Cấu hình Realm Settings:

Sau khi tạo realm, bạn sẽ tự động được chuyển vào realm mới đó.

1. Di chuyển đến "Realm settings" trong menu bên trái.
2. Tab "General":
   - Kiểm tra "Display name", "HTML Display name" nếu đã đặt.
   - "User-managed access": Để `OFF` (Mặc định), trừ khi bạn có nhu cầu cụ thể cho phép người dùng tự quản lý quyền truy cập tài nguyên của họ.

3. Tab "Login":
   - "User registration": `OFF` (nếu bạn không muốn cho phép người dùng tự đăng ký tài khoản). `ON` nếu muốn.
   - "Forgot password": `ON` (cho phép người dùng sử dụng tính năng quên mật khẩu).
   - "Remember me": `ON` (cho phép người dùng duy trì đăng nhập).
   - "Login with email": Cân nhắc bật `ON` nếu muốn người dùng đăng nhập bằng email thay vì username.

4. Tab "Tokens":
   - "Default Signature Algorithm": Giữ nguyên `RS256` (khuyến nghị).
   - "Access Token Lifespan": Thời gian sống của access token (ví dụ: `5 minutes`).
   - "Access Token Lifespan For Implicit Flow": Thời gian sống access token cho implicit flow.
   - "Client login timeout": Thời gian client chờ login.
   - "Refresh Token Max Reuse": Số lần refresh token có thể được tái sử dụng.
   - "SSO Session Idle": Thời gian nhàn rỗi tối đa cho một SSO session.
   - "SSO Session Max": Thời gian sống tối đa cho một SSO session.
   - "Offline Session Idle": Thời gian nhàn rỗi tối đa cho một offline session.
   - "Offline Session Max Limited": Bật `ON` nếu muốn giới hạn thời gian sống tối đa của offline session.
   - "Client Session Idle": Thời gian nhàn rỗi tối đa cho một client session.
   - "Client Session Max": Thời gian sống tối đa cho một client session.
   (Giữ các giá trị mặc định hoặc điều chỉnh theo yêu cầu bảo mật và trải nghiệm người dùng của bạn).

5. Lưu các thay đổi nếu có.

## Tạo và cấu hình Clients (Clients)

### Khái niệm Client

Trong Keycloak, Client đại diện cho một ứng dụng hoặc dịch vụ mà người dùng có thể đăng nhập vào hoặc nó cần tương tác với Keycloak (ví dụ: để xác thực token). Mỗi client có cấu hình và mã định danh (Client ID) riêng.

### Tạo Client cho Backend:

1.  Trong menu bên trái của realm `greeting-view` (đảm bảo bạn đang ở đúng realm), chọn "Clients".
2.  Click "Create client" ở phía trên bên phải.
3.  **Step 1: General Settings**
    *   Client type: Để mặc định là `OpenID Connect`.
    *   Client ID: `greeting-view-backend` (hoặc tên client ID bạn đã định nghĩa trong file `.env` của backend).
    *   Name: (Tùy chọn) `Greeting View Backend`
    *   Description: (Tùy chọn) `Backend API for Greeting View`
    *   Click "Next".

4.  **Step 2: Capability config**
    *   Client authentication: `ON` (quan trọng, vì backend là một confidential client).
    *   Authorization: Để `OFF` (trừ khi bạn muốn sử dụng tính năng "Fine-Grained Authorization" của Keycloak).
    *   Authentication flow:
        *   Standard flow: `OFF` (backend không tự điều hướng người dùng đi đăng nhập).
        *   Direct access grants: `ON` (cho phép backend đổi username/password lấy token, ít dùng hơn với confidential client, nhưng có thể cần cho một số kịch bản).
        *   Service accounts roles: `ON` (cho phép backend có service account riêng để giao tiếp với Keycloak).
        *   OAuth 2.0 Device Authorization Grant: `OFF`
        *   OIDC CIBA Grant: `OFF`
    *   Click "Next".

5.  **Step 3: Login settings** (Một số mục có thể không quá quan trọng với client `bearer-only` như backend, nhưng nên cấu hình để đầy đủ)
    *   Root URL: (Để trống hoặc điền `http://localhost:3001` nếu backend có URL gốc)
    *   Home URL: (Để trống)
    *   Valid redirect URIs: `http://localhost:3001/*` (Mặc dù backend không dùng redirect, việc thêm một URI hợp lệ là cần thiết. Dấu `*` cho phép mọi path con).
    *   Valid post logout redirect URIs: (Để trống hoặc `http://localhost:3001/*`)
    *   Web origins: `+` (để chấp nhận tất cả cho dễ, hoặc cụ thể hơn là `http://localhost:9002` nếu backend chỉ được gọi từ frontend này, và `http://localhost:3001` nếu có kịch bản backend tự gọi mình). An toàn hơn là chỉ định rõ các origin được phép.
    *   Admin URL: (Để trống)
    *   Click "Save".

### Cấu hình Backend Client (Sau khi tạo):

Sau khi client `greeting-view-backend` được tạo, bạn sẽ được đưa đến trang chi tiết của client.

1.  Tab "Settings":
    *   Access Type: Sẽ tự động là `confidential` vì bạn đã bật "Client authentication".
    *   Kiểm tra lại "Valid Redirect URIs" và "Web Origins".
    *   "Implicit Flow Enabled": `OFF`.
    *   "Service Accounts Enabled": Phải là `ON`.

2.  Tab "Credentials":
    *   Tại đây bạn sẽ tìm thấy "Client secret". **Copy giá trị này** và lưu vào biến môi trường `KEYCLOAK_SECRET` trong file `.env` của backend.

3.  Tab "Service Account Roles":
    *   Đây là nơi bạn gán vai trò (roles) cho service account của backend client này. Ví dụ, nếu backend cần quyền gọi một số API của Keycloak, bạn có thể gán các roles tương ứng ở đây (ví dụ: `query-users`, `manage-clients` từ client `realm-management`). Đối với việc xác thực token người dùng thông thường thì không cần gán roles đặc biệt ở đây.

### Tạo Client cho Frontend:

1.  Trong menu bên trái, chọn "Clients".
2.  Click "Create client".
3.  **Step 1: General Settings**
    *   Client type: `OpenID Connect`.
    *   Client ID: `greeting-view-frontend` (hoặc tên client ID bạn đã định nghĩa trong file `.env` của frontend).
    *   Name: (Tùy chọn) `Greeting View Frontend`
    *   Click "Next".

4.  **Step 2: Capability config**
    *   Client authentication: `OFF` (quan trọng, vì frontend là một public client, không thể giữ secret an toàn).
    *   Authorization: `OFF`.
    *   Authentication flow:
        *   Standard flow: `ON` (frontend sẽ sử dụng authorization code flow).
        *   Implicit flow: `OFF` (ít được khuyến khích hơn standard flow).
        *   Direct access grants: `OFF`.
    *   Click "Next".

5.  **Step 3: Login settings**
    *   Root URL: `http://localhost:9002` (URL gốc của ứng dụng frontend).
    *   Home URL: `http://localhost:9002` (Trang chủ của frontend).
    *   Valid redirect URIs:
        *   `http://localhost:9002/*` (Cho phép mọi path con, bao gồm cả trang callback, ví dụ `http://localhost:9002/callback`)
        *   Hoặc cụ thể hơn: `http://localhost:9002/callback` (Nếu bạn biết chính xác URI callback).
    *   Valid post logout redirect URIs:
        *   `http://localhost:9002/*` (Sau khi logout, người dùng sẽ được chuyển về đây).
    *   Web origins: `http://localhost:9002` (Chỉ cho phép JavaScript từ origin này tương tác với Keycloak). Dấu `+` cũng được nhưng `http://localhost:9002` là an toàn hơn.
    *   Click "Save".

### Cấu hình Frontend Client (Sau khi tạo):

1.  Sau khi tạo, vào tab "Settings" của client `greeting-view-frontend`.
2.  Đảm bảo các cài đặt sau (hầu hết sẽ được đặt đúng dựa trên lựa chọn ở "Capability config"):
    *   Access Type: `public`.
    *   Standard Flow Enabled: `ON`.
    *   Implicit Flow Enabled: `OFF`.
    *   Direct Access Grants Enabled: `OFF`.
    *   Service Accounts Enabled: `OFF`.
    *   Authorization Enabled: `OFF`.
    *   "Consent Required": `OFF` (nếu bạn không muốn người dùng phải thấy màn hình chấp thuận (consent screen) mỗi lần ứng dụng yêu cầu scope mới. Để `ON` nếu muốn tăng cường minh bạch).
3.  Lưu lại nếu có thay đổi.

## Quản lý vai trò (Roles)

### Tạo Realm Roles:

Realm roles là các vai trò được định nghĩa ở cấp độ realm và có thể được gán cho bất kỳ người dùng hoặc client nào trong realm đó. Đây là nơi bạn sẽ định nghĩa các vai trò như `employee`, `portal-admin`, `can-publish-news` v.v...

1.  Trong menu bên trái của realm `greeting-view`, chọn "Realm roles".
2.  Click "Create role".
3.  Tạo các vai trò theo kế hoạch của bạn. Ví dụ:
    *   Name: `employee`
    *   Description: (Tùy chọn) `Vai trò cơ bản cho tất cả nhân viên`
    *   Click "Save".
4.  Lặp lại để tạo các vai trò khác: `portal-admin`, `can-publish-news`, `can-write-docs`, `can-view-reports`.

### Tạo Client Roles (Tùy chọn):

Client roles là các vai trò chỉ có ý nghĩa trong phạm vi của một client cụ thể. Ít dùng hơn realm roles cho các kịch bản phân quyền chung. Nếu bạn có các quyền rất đặc thù cho `greeting-view-backend` hoặc `greeting-view-frontend` mà không áp dụng cho toàn realm, bạn có thể tạo chúng ở đây (trong mục "Clients" -> chọn client -> tab "Roles").

### Tạo Composite Roles (Vai trò tổng hợp - Tùy chọn):

Nếu bạn muốn một vai trò kế thừa các quyền từ các vai trò khác (ví dụ: `portal-admin` có thể tự động bao gồm tất cả các quyền của `employee` và thêm các quyền quản trị khác).

1.  Mở một vai trò đã tạo (ví dụ: `portal-admin`).
2.  Chuyển đến tab "Composite Roles".
3.  Bật switch `Associated roles` (nếu chưa bật).
4.  Chọn `Assign roles` , sau đó lọc theo `realm roles`
5.  Tìm và chọn các vai trò con (ví dụ: `employee`, và các vai trò quản trị cụ thể khác nếu muốn) mà bạn muốn `portal-admin` kế thừa.
6.  Click `Add selected` để thêm chúng vào danh sách `Assigned Roles` (hoặc `Effective Roles`).
7.  Lưu ý: Việc sử dụng groups để gán một tập hợp các roles thường linh hoạt hơn composite roles trong nhiều trường hợp. 

## Quản lý Nhóm (Groups)

Nhóm là cách để quản lý quyền cho một tập hợp người dùng. Bạn gán roles cho group, và tất cả thành viên của group đó sẽ thừa hưởng các roles đó.

1.  Trong menu bên trái của realm `greeting-view`, chọn "Groups".
2.  Click `Create group`.
3.  Tạo các group theo kế hoạch: `Engineering`, `Marketing`, `Finance`, `Partners`.
    *   Name: `Engineering`
    *   Click `Save`.
4.  Sau khi tạo group, chọn group đó từ danh sách.
5.  Đi đến tab `Role Mappings` và ấn `Assign roles`.
6.  Trong phần `Available Roles`, chọn các roles bạn muốn gán cho group này (ví dụ: cho group `Engineering`, chọn `employee` và `can-write-docs`).
7.  Click `Assign`.
8.  Lặp lại cho các group khác (`Marketing` với `employee`, `can-publish-news`; `Finance` với `employee`, `can-view-reports`).

## Cấu hình Token Claims

Token Claims là thông tin được nhúng trong token, giúp ứng dụng biết về người dùng và quyền của họ.

### Thêm Realm Roles vào Token:

1. Trong menu bên trái, chọn "Client scopes"
2. Tìm scope cho backend client (thường là `greeting-view-backend-scope`)
3. Click vào scope này
4. Đi đến tab `Mappers`
5. Click `Configure a new mapper`
6. Chọn `User Realm Role`
7. Điền thông tin:
   - Name: `realm-roles`
   - Token Claim Name: `realm_access.roles`
   - Claim JSON Type: `String`
   - Bật `Add to ID token` và `Add to access token`
   - Click `Save`

### Kiểm tra Token:

1. Đi đến `Clients` > `greeting-view-frontend` > `Client scopes`
2. Click vào scope mặc định
3. Tab `Evaluate`
4. Chọn một user và click `Evaluate`
5. Kiểm tra tab `Generated Access Token` để xem claim `realm_access.roles` đã được thêm chưa

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

1. Trong menu bên trái, chọn `Realm settings`
2. Mở tab `Keys`
3. Tìm key type `RSA` và algorithm `RS256`
4. Click vào `Public key`
5. Copy giá trị hiển thị
6. Lưu giá trị này vào biến môi trường `KEYCLOAK_PUBLIC_KEY` trong file `.env` của backend

### Lấy Client Secret của Backend:

1. Đi đến `Clients` > `greeting-view-backend`
2. Mở tab `Credentials`
3. Copy giá trị `Client secret`
4. Lưu vào biến môi trường `KEYCLOAK_SECRET` trong các file `.env` của backend và Docker

## Xác thực và phân quyền

### Các loại Token:
- **Access Token**: Sử dụng để truy cập tài nguyên (thời gian sống ngắn)
- **Refresh Token**: Dùng để lấy Access Token mới khi hết hạn (thời gian sống dài)
- **ID Token**: Chứa thông tin về danh tính người dùng

### Quy trình xác thực:

1. Người dùng click `Đăng nhập` trên Frontend
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

## Quản lý người dùng (Users)

### Tạo người dùng ví dụ (theo kế hoạch của bạn):

**Người dùng 1: `nhanvien_marketing_A` (Thuộc nhóm Marketing)**

1.  Trong menu bên trái, chọn "Users".
2.  Click "Add user" (hoặc "Create user").
3.  Điền thông tin người dùng:
    *   Username: `nhanvien_marketing_A`
    *   Email: (Tùy chọn) `nhanvien_a@techcorp.com`
    *   First name: (Tùy chọn) `NhanVienA`
    *   Last name: (Tùy chọn) `Marketing`
    *   "Email verified": Bật `ON` (để không cần bước xác thực email).
    *   Click "Create" (hoặc "Save").

4.  Sau khi tạo, người dùng sẽ xuất hiện trong danh sách. Click vào username để mở trang chi tiết.
5.  Tab "Credentials":
    *   Click "Set password" (hoặc nút tương tự).
    *   Nhập mật khẩu (ví dụ: `password123`) và xác nhận.
    *   Tắt "Temporary" (nếu có) để người dùng không phải đổi mật khẩu khi đăng nhập lần đầu.
    *   Click "Save" (hoặc "Set Password").

6.  Tab "Groups":
    *   Trong phần "Available Groups" (hoặc tương tự), chọn nhóm `Marketing`.
    *   Click "Join" (hoặc nút tương tự) để thêm người dùng vào nhóm. Người dùng này sẽ tự động thừa hưởng các roles `employee` và `can-publish-news` từ nhóm `Marketing`.

**Người dùng 2: `admin_B` (Thuộc nhóm Engineering, có thêm vai trò `portal-admin`)**

1.  Tạo người dùng `admin_B` tương tự như trên.
    *   Username: `admin_B`
    *   Email: `admin_user_nhom12@gmail.com`
    *   First name: `Admin`
    *   Last name: `User`
2.  Đặt mật khẩu cho `password123`.
3.  Tab "Groups": Thêm `admin_B` vào nhóm `Engineering`. (Sẽ thừa hưởng `employee`, `can-write-docs`).
4.  Tab "Role Mappings":
    *   Ngoài các roles được thừa hưởng từ group, bạn cần gán trực tiếp vai trò `portal-admin`.
    *   Trong phần "Available Roles", tìm và chọn `portal-admin`.
    *   Click "Add selected" (hoặc "Assign").

**Người dùng 3: `freelancer_C` (Đăng nhập qua GitHub, thuộc nhóm Partners, có vai trò `employee` hạn chế)**
*   Việc tạo người dùng này sẽ phức tạp hơn nếu bạn muốn tự động hóa qua Identity Brokering (đăng nhập qua GitHub).
*   **Cách đơn giản ban đầu:** Tạo thủ công người dùng `freelancer_C`.
    *   Đặt mật khẩu.
    *   Tab "Groups": Thêm vào nhóm `Partners` (nếu đã tạo nhóm này và gán vai trò `employee` cho nhóm `Partners`).
    *   Hoặc Tab "Role Mappings": Gán trực tiếp vai trò `employee`.
*   **Nâng cao:** Cấu hình "Identity Providers" trong Keycloak để cho phép đăng nhập bằng GitHub. Sau đó, tạo "Identity Provider Mappers" để tự động gán role `employee` và thêm vào group `Partners` khi người dùng đăng nhập lần đầu qua GitHub. Phần này nằm ngoài phạm vi hướng dẫn cơ bản này.

## Cấu hình Token Claims (Thông tin trong Token)

Token Claims là các thông tin (thuộc tính) được nhúng vào bên trong access token hoặc ID token. Các ứng dụng (backend, frontend) sẽ đọc các claims này để biết thông tin về người dùng và quyền hạn của họ.

### Thêm Realm Roles vào Access Token:

Quan trọng là các vai trò của người dùng (ví dụ: `employee`, `portal-admin`) phải có trong access token để backend có thể kiểm tra quyền.

1.  Trong menu bên trái, chọn "Client Scopes". Keycloak có các client scope mặc định (ví dụ: `email`, `profile`, `roles`).
2.  Tìm và chọn client scope có tên liên quan đến `roles` (thường là `roles` hoặc một scope được tạo sẵn có chức năng tương tự). Nếu không có, bạn có thể tạo một scope mới hoặc sửa scope mặc định.
    *   Giả sử chúng ta dùng scope `roles` (thường đã có sẵn). Click vào nó.
3.  Đi đến tab "Mappers" của scope đó.
4.  Mặc định, Keycloak thường đã có sẵn một mapper để thêm realm roles vào token. Tìm mapper có kiểu (Type) là "User Realm Role" và thường có tên như "realm roles" hoặc "roles".
    *   Nếu không có, click "Add mapper" -> "By configuration" -> chọn "User Realm Role".
5.  Cấu hình mapper này (hoặc tạo mới):
    *   Name: `realm_access_roles` (hoặc một tên gợi nhớ)
    *   Mapper Type: `User Realm Role`
    *   Token Claim Name: `realm_access.roles` (Đây là claim chuẩn mà `keycloak-connect` và nhiều thư viện khác mong đợi. Nó sẽ tạo một object `realm_access` chứa một array `roles`). Hoặc có thể là `resource_access.<client_id>.roles` nếu bạn dùng client roles và mapper tương ứng.
    *   Claim JSON Type: `String` (Mặc dù roles là một mảng, từng role name là String. Keycloak sẽ xử lý thành mảng JSON).
    *   Multivalued: `ON` (Vì một người dùng có thể có nhiều roles).
    *   Add to ID token: Bật `ON` nếu frontend cần đọc roles từ ID token.
    *   Add to access token: **Bật `ON` (Rất quan trọng)** để backend có thể đọc roles từ access token.
    *   Add to userinfo: Bật `ON` nếu muốn roles xuất hiện ở UserInfo endpoint.
    *   Click "Save".

6.  **Gán Client Scope cho Client**: Đảm bảo client scope này (ví dụ: `roles`) được gán cho cả client `greeting-view-backend` và `greeting-view-frontend`.
    *   Đi đến "Clients" -> chọn client (ví dụ `greeting-view-frontend`).
    *   Tab "Client Scopes".
    *   Trong phần "Available client scopes" (hoặc tương tự), tìm scope `roles` và click "Add" (hoặc "Assign"). Nó sẽ chuyển sang "Assigned default client scopes" (hoặc "Assigned optional client scopes").
    *   Lặp lại cho client `greeting-view-backend`.

### Kiểm tra Token (Tùy chọn nâng cao):

Bạn có thể dùng các công cụ như [jwt.io](https://jwt.io/) để giải mã access token và xem các claims bên trong, hoặc dùng tab "Evaluate" trong Client Scopes của Keycloak.
1.  Trong Keycloak Admin Console, đi đến "Clients" -> chọn `greeting-view-frontend` -> Tab "Client Scopes".
2.  Ở đây thường có các mục như "Setup" và "Evaluate".
3.  Tab "Evaluate" (hoặc tên tương tự tùy phiên bản):
    *   Chọn một User.
    *   Chọn Scope (đảm bảo scope chứa mapper roles của bạn được chọn).
    *   Click "Evaluate".
    *   Xem phần "Generated Access Token" hoặc "Generated ID Token" đã được giải mã. Kiểm tra xem claim `realm_access.roles` (hoặc claim bạn đã đặt tên) có chứa đúng các vai trò của người dùng đó không.

## Cấu hình CORS (Cross-Origin Resource Sharing)

CORS cần được cấu hình để Frontend (chạy ở `http://localhost:9002`) có thể gọi các API của Keycloak (chạy ở `http://localhost:8080`) và Backend API (chạy ở `http://localhost:3001`).

*   **Keycloak CORS:** Backend (`keycloak-connect`) sẽ tự động xử lý CORS cho các endpoint của Keycloak mà nó bảo vệ. Tuy nhiên, nếu frontend trực tiếp gọi các endpoint của Keycloak (ví dụ: để lấy `.well-known/openid-configuration`), bạn có thể cần cấu hình Web Origins trong client `greeting-view-frontend` như đã làm ở trên.
*   **Backend API CORS:** Backend Express của bạn cần có middleware `cors` để cho phép request từ frontend.
    ```javascript
    // Trong file index.js hoặc app.js của backend
    const cors = require('cors');
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:9002', // Lấy từ .env
      credentials: true // Nếu bạn cần gửi cookie hoặc authorization headers
    }));
    ```
    Biến `FRONTEND_URL` đã có trong file `.env` của backend của bạn.

## Lấy Public Key và Client Secrets

### Lấy Public Key của Realm:

Backend (`keycloak-connect`) cần public key của realm để xác thực chữ ký của JWT token.

1.  Trong Keycloak Admin Console, đảm bảo bạn đang ở trong realm `greeting-view`.
2.  Đi đến "Realm settings" -> tab "Keys".
3.  Trong bảng "Keys", tìm dòng có Provider là `rsa-generated` (hoặc tương tự, thường là key active cho việc ký token) và Algorithm là `RS256`.
4.  Ở cột "Actions" (hoặc có thể là một nút/icon), click vào "Public key".
5.  Một popup sẽ hiển thị public key dạng PEM. **Copy toàn bộ nội dung này, bao gồm cả `-----BEGIN PUBLIC KEY-----` và `-----END PUBLIC KEY-----`**.
6.  Dán giá trị này vào biến môi trường `KEYCLOAK_PUBLIC_KEY` trong file `.env` của backend. (Lưu ý: một số cách cấu hình `keycloak-connect` có thể không cần public key trực tiếp nếu nó có thể lấy từ JWKS URI của Keycloak, nhưng việc cung cấp qua `.env` là một cách rõ ràng). Kiểm tra file `keycloak-config.js` của bạn xem nó có sử dụng `KEYCLOAK_PUBLIC_KEY` không. Nếu không, `keycloak-connect` sẽ tự lấy từ server. File `.env` của bạn có `KEYCLOAK_PUBLIC_KEY`, vậy nên bạn cần lấy nó.

### Lấy Client Secret của Backend:

Đã thực hiện ở bước cấu hình Backend Client (Tab "Credentials" của client `greeting-view-backend`). Giá trị này được lưu vào `KEYCLOAK_SECRET` trong file `.env` của backend.

## Xác thực và phân quyền (Recap)

### Các loại Token:
- **Access Token**: Sử dụng để truy cập các tài nguyên được bảo vệ (API endpoints). Có thời gian sống ngắn. Chứa thông tin về quyền (roles, scopes).
- **Refresh Token**: Dùng để yêu cầu một Access Token mới khi Access Token cũ hết hạn, mà không cần người dùng đăng nhập lại. Có thời gian sống dài hơn.
- **ID Token**: Chứa thông tin về danh tính của người dùng đã xác thực (ví dụ: username, email). Được dùng bởi client (frontend) để biết người dùng là ai.

### Quy trình xác thực (Authorization Code Flow):

1.  Người dùng click "Đăng nhập" trên Frontend.
2.  Frontend chuyển hướng trình duyệt đến trang đăng nhập của Keycloak.
3.  Người dùng nhập thông tin đăng nhập (username, password) trên trang của Keycloak.
4.  Keycloak xác thực thông tin. Nếu thành công, Keycloak tạo một `authorization code` và chuyển hướng trình duyệt người dùng về `redirect_uri` của Frontend, kèm theo `code` đó.
5.  Frontend (thường là ở trang callback) nhận được `authorization code`. Nó gửi `code` này (cùng với `client_id` và đôi khi `client_secret` cho public client, nhưng thường không cần) đến token endpoint của Keycloak.
6.  Keycloak xác thực `code`, và nếu hợp lệ, trả về một bộ tokens (Access Token, Refresh Token, ID Token) cho Frontend.
7.  Frontend lưu trữ các tokens này (thường là trong `localStorage` hoặc `sessionStorage`, hoặc bộ nhớ an toàn hơn) và sử dụng Access Token để đính kèm vào header (`Authorization: Bearer <access_token>`) của các yêu cầu gửi đến Backend API.
8.  Backend API (được bảo vệ bởi `keycloak-connect`) nhận được request, trích xuất Access Token, và xác thực token này (kiểm tra chữ ký với public key của realm, kiểm tra thời hạn, issuer, audience...).
9.  Nếu token hợp lệ, `keycloak-connect` sẽ gắn thông tin từ token (bao gồm grant và roles) vào đối tượng `req.kauth`. Backend sau đó kiểm tra quyền (roles) nếu cần, và xử lý request.

### Quy trình làm mới token (Token Refresh):

1.  Frontend phát hiện Access Token sắp hết hạn hoặc đã hết hạn (ví dụ, bằng cách kiểm tra claim `exp` hoặc khi nhận lỗi 401 từ backend).
2.  Frontend gửi Refresh Token (mà nó đã lưu trước đó) đến token endpoint của Keycloak (cùng với `client_id` và `grant_type=refresh_token`).
3.  Keycloak xác thực Refresh Token. Nếu hợp lệ, nó trả về một bộ Access Token mới (và có thể cả Refresh Token mới).
4.  Frontend cập nhật các tokens đã lưu.

### Kiểm tra quyền (Authorization):

Backend sử dụng middleware `keycloak.protect()` từ `keycloak-connect` để kiểm tra quyền:

```javascript
// Bảo vệ route, yêu cầu người dùng phải có vai trò 'portal-admin'
app.get('/api/admin-data', keycloak.protect('portal-admin'), (req, res) => {
  // Chỉ người dùng có vai trò 'portal-admin' mới truy cập được
});

// Bảo vệ route, yêu cầu người dùng phải có vai trò 'employee'
app.get('/api/some-employee-resource', keycloak.protect('employee'), (req, res) => {
  // Chỉ 'employee' mới truy cập được
});

// Nếu không truyền role, keycloak.protect() chỉ kiểm tra đã xác thực hay chưa
app.get('/api/any-logged-in-user', keycloak.protect(), (req, res) => {
  // Bất kỳ ai đăng nhập thành công đều truy cập được
});
```
Bạn cũng có thể sử dụng `role-middleware.js` của mình (`hasRole`, `hasAnyRole`) nếu muốn có logic tùy chỉnh hoặc thông báo lỗi khác.

Frontend có thể kiểm tra quyền dựa trên roles trong token (nếu đã lấy và giải mã) để ẩn/hiện các phần tử UI:

```javascript
// Ví dụ trong một React component, giả sử bạn có hàm `hasRole` từ auth context
const { hasRole } = useAuth(); // Giả định bạn có một AuthContext cung cấp hàm này

if (hasRole('portal-admin')) {
  // Hiển thị nút "Quản lý Người dùng"
}
```

## Xử lý lỗi thường gặp (Troubleshooting)

1.  **Lỗi CORS (CORS Issues)**:
    *   Lỗi thường thấy: "Access to XMLHttpRequest at '...' from origin 'http://localhost:9002' has been blocked by CORS policy..."
    *   Giải pháp:
        *   Backend: Đảm bảo middleware `cors` được cấu hình đúng để chấp nhận request từ `FRONTEND_URL`.
        *   Keycloak: Kiểm tra "Web Origins" trong cấu hình client `greeting-view-frontend` đã bao gồm `http://localhost:9002`.

2.  **Token không hợp lệ (Invalid Token)**:
    *   Lỗi từ backend: "Token verification failed", "Unauthorized", 401.
    *   Giải pháp:
        *   Đảm bảo `KEYCLOAK_PUBLIC_KEY` trong `.env` của backend là chính xác (nếu `keycloak-connect` không tự lấy từ JWKS URI).
        *   Kiểm tra thời hạn (lifespan) của token trong Keycloak Realm Settings -> Tokens. Có thể token hết hạn quá nhanh.
        *   Kiểm tra `issuer` và `audience` (nếu có cấu hình `verifyTokenAudience` trong `keycloak-connect`).
        *   Đảm bảo client ID (`resource` trong cấu hình `keycloak-connect`) khớp với client ID của backend trong Keycloak.

3.  **Không được phép (Unauthorized / Forbidden)**:
    *   Lỗi từ backend: "Access denied", 403.
    *   Giải pháp:
        *   Kiểm tra người dùng đã được gán đúng role(s) trong Keycloak (trực tiếp hoặc qua group).
        *   Kiểm tra mapper "User Realm Role" (hoặc tương tự) đã được cấu hình đúng trong Client Scopes để đưa roles vào `realm_access.roles` của token.
        *   Kiểm tra logic `keycloak.protect('some-role')` hoặc `hasRole('some-role')` ở backend đang kiểm tra đúng tên role.

4.  **Lỗi URI chuyển hướng (Redirect URI Issues)**:
    *   Lỗi từ Keycloak: "Invalid parameter: redirect_uri", "Invalid redirect_uri".
    *   Giải pháp: Đảm bảo "Valid redirect URIs" trong cấu hình client `greeting-view-frontend` ở Keycloak (ví dụ: `http://localhost:9002/*` hoặc `http://localhost:9002/callback`) khớp chính xác với `redirect_uri` mà frontend gửi khi bắt đầu luồng đăng nhập và khi đổi code lấy token.

5.  **Client không hợp lệ (Invalid Client)**:
    *   Lỗi từ Keycloak: "Invalid client_id", "Invalid client credentials".
    *   Giải pháp:
        *   Kiểm tra `KEYCLOAK_CLIENT_ID` trong các file `.env` (backend, frontend) khớp với Client ID đã cấu hình trong Keycloak.
        *   Đối với backend (confidential client), kiểm tra `KEYCLOAK_SECRET` trong `.env` của backend khớp với Client Secret từ tab "Credentials" của client `greeting-view-backend` trong Keycloak.

## Tài liệu tham khảo

- [Keycloak Official Documentation](https://www.keycloak.org/documentation)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Securing Applications and Services Guide (cho keycloak-connect)](https://www.keycloak.org/docs/latest/securing_apps/)
- [Keycloak REST API Documentation](https://www.keycloak.org/docs/latest/rest-api/)
