# Hướng dẫn Tích hợp Keycloak với LDAP từ A-Z

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để cài đặt một máy chủ OpenLDAP bằng Docker, tạo dữ liệu mẫu bằng Apache Directory Studio, và cấu hình Keycloak để xác thực người dùng thông qua LDAP (User Federation).

## Mục lục
- [Hướng dẫn Tích hợp Keycloak với LDAP từ A-Z](#hướng-dẫn-tích-hợp-keycloak-với-ldap-từ-a-z)
  - [Mục lục](#mục-lục)
  - [Phần 1: Cài đặt và Khởi tạo LDAP Server bằng Docker](#phần-1-cài-đặt-và-khởi-tạo-ldap-server-bằng-docker)
    - [Bước 1.1: Tạo file `docker-compose.yml`](#bước-11-tạo-file-docker-composeyml)
    - [Bước 1.2: Khởi động Server](#bước-12-khởi-động-server)
  - [Phần 2: Tạo Dữ liệu Mẫu trên LDAP bằng Apache Directory Studio](#phần-2-tạo-dữ-liệu-mẫu-trên-ldap-bằng-apache-directory-studio)
    - [Bước 2.1: Kết nối tới Server](#bước-21-kết-nối-tới-server)
    - [Bước 2.2: Tạo Cấu trúc Thư mục (OU)](#bước-22-tạo-cấu-trúc-thư-mục-ou)
    - [Bước 2.3: Tạo Người dùng (User) Ví dụ](#bước-23-tạo-người-dùng-user-ví-dụ)
    - [Bước 2.4: Tạo Nhóm (Group) và Thêm Thành viên](#bước-24-tạo-nhóm-group-và-thêm-thành-viên)
  - [Phần 3: Tích hợp LDAP với Keycloak (User Federation)](#phần-3-tích-hợp-ldap-với-keycloak-user-federation)
    - [Bước 3.1: Tạo Provider](#bước-31-tạo-provider)
    - [Bước 3.2: Cấu hình Kết nối](#bước-32-cấu-hình-kết-nối)
    - [Bước 3.3: Cấu hình Tìm kiếm](#bước-33-cấu-hình-tìm-kiếm)
  - [Phần 4: Cấu hình Mappers để Đồng bộ Dữ liệu](#phần-4-cấu-hình-mappers-để-đồng-bộ-dữ-liệu)
    - [Bước 4.1: Tạo các Mapper cho Thuộc tính Người dùng](#bước-41-tạo-các-mapper-cho-thuộc-tính-người-dùng)
    - [Bước 4.2: Tạo Mapper cho Nhóm](#bước-42-tạo-mapper-cho-nhóm)
  - [Phần 5: Đồng bộ và Kiểm tra Đăng nhập](#phần-5-đồng-bộ-và-kiểm-tra-đăng-nhập)
    - [Bước 5.1: Chạy Đồng bộ](#bước-51-chạy-đồng-bộ)
    - [Bước 5.2: Kiểm tra Kết quả](#bước-52-kiểm-tra-kết-quả)
    - [Bước 5.3: Đăng nhập Thử](#bước-53-đăng-nhập-thử)

---

## Phần 1: Cài đặt và Khởi tạo LDAP Server bằng Docker

Cách nhanh nhất để có một LDAP server cho môi trường phát triển là sử dụng Docker.

### Bước 1.1: Tạo file `docker-compose.yml`

Tạo một file tên là `docker-compose.yml` với nội dung sau. File này sẽ định nghĩa một dịch vụ OpenLDAP.

```yaml
services:
  openldap:
    image: osixia/openldap:latest
    container_name: openldap-server
    ports:
      - "389:389"  # Cổng LDAP
      - "636:636"  # Cổng LDAPS (SSL)
    environment:
      - LDAP_ORGANISATION=KMA-AT19
      - LDAP_DOMAIN=at19.com
      - LDAP_ADMIN_PASSWORD=YourSecurePassword! # <-- THAY BẰNG MẬT KHẨU PHỨC TẠP CỦA BẠN
    volumes:
      - ldap_data:/var/lib/ldap
      - ldap_config:/etc/ldap/slapd.d

volumes:
  ldap_data:
  ldap_config:
```

**Lưu ý quan trọng:** Thay thế `YourSecurePassword!` bằng một mật khẩu thực tế và an toàn.

### Bước 1.2: Khởi động Server

Mở một cửa sổ dòng lệnh (terminal) trong thư mục chứa file `docker-compose.yml`.

Chạy lệnh sau để dừng và xóa các môi trường cũ (nếu có) để đảm bảo một khởi đầu sạch sẽ:
```bash
docker-compose down --volumes
```

Khởi động LDAP server ở chế độ nền:
```bash
docker-compose up -d
```

Sau vài giây, bạn đã có một LDAP server đang chạy với domain gốc là `dc=at19,dc=com`.

---

## Phần 2: Tạo Dữ liệu Mẫu trên LDAP bằng Apache Directory Studio

Chúng ta sẽ dùng công cụ miễn phí Apache Directory Studio để thao tác với dữ liệu trên LDAP server.

### Bước 2.1: Kết nối tới Server

1.  Mở Apache Directory Studio.
2.  Tạo một kết nối mới (`File > New... > LDAP Connection`).
3.  Điền thông tin kết nối và xác thực:
    *   **Hostname**: `localhost`, **Port**: `389`
    *   **Bind DN**: `cn=admin,dc=at19,dc=com`
    *   **Bind Password**: Mật khẩu bạn đã đặt trong file `docker-compose.yml`.
4.  Kết nối thành công, bạn sẽ thấy cây thư mục với gốc là `dc=at19,dc=com`.

### Bước 2.2: Tạo Cấu trúc Thư mục (OU)

1.  Nhấn chuột phải vào `dc=at19,dc=com` > `New` > `New Entry...`.
2.  Tạo một entry mới với `Object Class` là `organizationalUnit` và `ou` là `people`.
3.  Lặp lại quá trình để tạo thêm một OU nữa với `ou` là `groups`.

### Bước 2.3: Tạo Người dùng (User) Ví dụ

1.  Nhấn chuột phải vào `ou=people,dc=at19,dc=com` > `New` > `New Entry...`.
2.  Tạo entry mới với các `Object Class` sau: `top`, `person`, `organizationalPerson`, `inetOrgPerson`.
3.  Đặt `uid` là `testuser`.
4.  Điền các thuộc tính (Attributes) cho người dùng:
    *   `cn`: Test User
    *   `sn`: User
    *   `givenName`: Test
    *   `mail`: testuser@at19.com
    *   `userPassword`: Đặt một mật khẩu cho người dùng này, ví dụ `test1234`.

### Bước 2.4: Tạo Nhóm (Group) và Thêm Thành viên

1.  Nhấn chuột phải vào `ou=groups,dc=at19,dc=com` > `New` > `New Entry...`.
2.  Tạo entry mới với `Object Class` là `top` và `groupOfNames`.
3.  Đặt `cn` là `teachers`.
4.  Thêm thuộc tính `member` với giá trị là DN đầy đủ của người dùng đã tạo ở trên: `uid=testuser,ou=people,dc=at19,dc=com`.

---

## Phần 3: Tích hợp LDAP với Keycloak (User Federation)

Bây giờ, chúng ta sẽ cấu hình Keycloak để đọc dữ liệu từ LDAP server.

### Bước 3.1: Tạo Provider

1.  Trong Keycloak Admin Console, chọn Realm của bạn.
2.  Đi tới `User Federation` > `Add provider` > chọn `ldap`.

### Bước 3.2: Cấu hình Kết nối

| Cài đặt           | Giá trị                         |
| ------------------ | ------------------------------- |
| **Vendor**         | Other (hoặc để trống)           |
| **Connection URL** | `ldap://localhost:389`          |
| **Users DN**       | `ou=people,dc=at19,dc=com`      |
| **Bind Type**      | `simple`                        |
| **Bind DN**        | `cn=admin,dc=at19,dc=com`       |
| **Bind Credentials**| Mật khẩu admin LDAP của bạn   |

Sau khi điền, hãy dùng nút **Test connection** và **Test authentication** để xác nhận.

### Bước 3.3: Cấu hình Tìm kiếm

| Cài đặt                  | Giá trị       |
| ------------------------ | ------------- |
| **Edit Mode**            | `READ_ONLY`   |
| **Username LDAP attribute**| `uid`         |
| **RDN LDAP attribute**   | `uid`         |
| **UUID LDAP attribute**  | `entryUUID`   |
| **Search Scope**         | `Subtree`     |

Nhấn **Save** để lưu lại cấu hình.

---

## Phần 4: Cấu hình Mappers để Đồng bộ Dữ liệu

Mappers dịch thông tin từ LDAP sang Keycloak. Hãy vào tab `Mappers` của provider LDAP bạn vừa tạo.

### Bước 4.1: Tạo các Mapper cho Thuộc tính Người dùng

Nhấn `Add mapper` và tạo các mapper sau với `Mapper Type` là `user-attribute-ldap-mapper`:

*   **First Name**:
    *   User Model Attribute: `firstName`
    *   LDAP Attribute: `givenName`
*   **Last Name**:
    *   User Model Attribute: `lastName`
    *   LDAP Attribute: `sn`
*   **Email**:
    *   User Model Attribute: `email`
    *   LDAP Attribute: `mail`

### Bước 4.2: Tạo Mapper cho Nhóm

1.  Nhấn `Add mapper`.
2.  Cấu hình như sau:
    *   **Name**: `Group Mapper`
    *   **Mapper Type**: `group-ldap-mapper`
    *   **LDAP Groups DN**: `ou=groups,dc=at19,dc=com`
    *   **Group Name LDAP Attribute**: `cn`
    *   **Group Object Classes**: `groupOfNames`
    *   **Membership LDAP Attribute**: `member`
    *   **Mode**: `LDAP_ONLY`
3.  Nhấn **Save**.

---

## Phần 5: Đồng bộ và Kiểm tra Đăng nhập

### Bước 5.1: Chạy Đồng bộ

1.  Quay lại tab `Settings` của provider LDAP.
2.  Từ menu `Action` ở góc trên bên phải, chọn `Synchronize all users`.

### Bước 5.2: Kiểm tra Kết quả

1.  Vào mục `Users` từ menu chính. Bạn sẽ thấy `testuser` đã xuất hiện. Nhấn vào để xem chi tiết, các trường First Name, Last Name, Email sẽ được điền.
2.  Vào mục `Groups`. Bạn sẽ thấy nhóm `teachers`. Nhấn vào để xem thành viên, bạn sẽ thấy `testuser` trong đó.

### Bước 5.3: Đăng nhập Thử

1.  Mở một cửa sổ trình duyệt ẩn danh.
2.  Truy cập ứng dụng của bạn và đăng nhập qua Keycloak.
3.  Sử dụng tài khoản LDAP:
    *   **Username**: `testuser`
    *   **Password**: Mật khẩu của `testuser` (`test1234` trong ví dụ này).

Nếu đăng nhập thành công, bạn đã hoàn tất toàn bộ quá trình tích hợp.
