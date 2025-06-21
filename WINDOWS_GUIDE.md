# Hướng dẫn chạy ứng dụng trên Windows

## Yêu cầu
- Docker Desktop đã được cài đặt và đang chạy
- PowerShell

## Các bước thực hiện

### 1. Khởi động Docker Desktop
- Tìm và mở Docker Desktop từ menu Start
- Đợi cho đến khi Docker Desktop khởi động hoàn tất (biểu tượng Docker ở thanh taskbar chuyển sang màu xanh)

### 2. Mở PowerShell với quyền Administrator
- Nhấn chuột phải vào menu Start
- Chọn "Windows PowerShell (Admin)" hoặc "Terminal (Admin)"
- Xác nhận UAC prompt nếu được yêu cầu

### 3. Di chuyển đến thư mục dự án
```powershell
cd F:\ATMMT_FINAL\Greeting-View
```

### 4. Dừng các container đang chạy (nếu có)
```powershell
docker-compose down
```

### 5. Xây dựng và khởi động các container
```powershell
docker-compose up -d --build
```

Lệnh này sẽ:
- Xây dựng lại các image Docker (--build)
- Khởi động các container ở chế độ detached (-d)

### 6. Kiểm tra trạng thái các container
```powershell
docker-compose ps
```

### 7. Xem logs (nếu cần)
```powershell
docker-compose logs -f
```

Để xem logs của một container cụ thể:
```powershell
docker-compose logs -f keycloak
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 8. Truy cập các dịch vụ
- Keycloak: http://localhost:8080
- Backend API: http://localhost:3001
- Frontend: http://localhost:9002

## Xử lý sự cố

### Lỗi "npm ci" khi build frontend
Nếu bạn gặp lỗi liên quan đến `npm ci` và `package-lock.json`, hãy đảm bảo rằng bạn đã sửa Dockerfile như sau:

1. Mở file `frontend/Dockerfile`
2. Thay thế dòng:
   ```
   RUN npm ci
   ```
   bằng:
   ```
   RUN npm install
   ```

3. Làm tương tự với `backend/Dockerfile`

### Lỗi về thư mục public
Nếu bạn gặp lỗi liên quan đến thư mục public như:
```
failed to solve: failed to compute cache key: failed to calculate checksum of ref klo26m4nu0luefszqlvki56w9::rz7nhpb0ths7hi01dpqk1ub2o: "/app/public": not found
```

Hãy thực hiện các bước sau:

1. Đảm bảo thư mục `frontend/public` tồn tại:
   ```powershell
   mkdir -p frontend/public
   ```

2. Tạo một file placeholder trong thư mục public:
   ```powershell
   echo "" > frontend/public/favicon.ico
   ```

3. Sử dụng script `run-as-admin.bat` để tự động tạo thư mục và file này

### Lỗi về cổng (port)
Nếu bạn gặp lỗi về cổng đã được sử dụng, hãy kiểm tra và dừng các ứng dụng đang sử dụng cổng 8080, 3001 hoặc 9002:

```powershell
# Kiểm tra các ứng dụng đang sử dụng cổng
netstat -ano | findstr :8080
netstat -ano | findstr :3001
netstat -ano | findstr :9002

# Dừng tiến trình theo PID (thay thế PID_NUMBER bằng số PID từ lệnh trên)
taskkill /PID PID_NUMBER /F
```

### Lỗi về quyền truy cập
Nếu bạn gặp lỗi về quyền truy cập, hãy đảm bảo rằng bạn đang chạy PowerShell với quyền Administrator.

### Lỗi Docker không chạy
Nếu Docker không chạy, hãy kiểm tra:
1. Docker Desktop đã được khởi động
2. WSL 2 đã được cài đặt và cấu hình đúng
3. Virtualization đã được bật trong BIOS

## Dừng ứng dụng
Khi bạn muốn dừng ứng dụng:

```powershell
docker-compose down
```

Nếu bạn muốn xóa hoàn toàn các volume và dữ liệu:

```powershell
docker-compose down -v
``` 