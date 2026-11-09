# NutriCore (FitManagementPlatform) - Production Deployment, HTTPS & Backup Guide

Tài liệu hướng dẫn triển khai hệ thống trên máy chủ thực tế (VPS/Cloud Server) với Docker Compose, cấu hình chứng chỉ SSL/HTTPS tự động (Nginx + Let's Encrypt), quy trình CI/CD và cơ chế sao lưu/phục hồi dữ liệu định kỳ.

---

## 1. Kiến trúc Triển khai Production (Mục 6)

Hệ thống vận hành qua `docker-compose.prod.yml` bao gồm 6 container nằm trong mạng nội bộ `nutricore_net`:

| Service | Container Name | Vai trò |
|---|---|---|
| `nginx` | `fit_nginx_prod` | Reverse Proxy (Ports 80/443), chấm dứt TLS/HTTPS, HSTS, nén Gzip & Rate Limiting API. |
| `certbot` | `fit_certbot_prod` | Tự động kiểm tra và gia hạn chứng chỉ SSL Let's Encrypt mỗi 12 giờ. |
| `web` | `fit_web_prod` | Ứng dụng Next.js 16 (PWA/SSR), chỉ lắng nghe nội bộ `127.0.0.1:3000`. |
| `backend` | `fit_backend_prod` | NestJS 11 REST API + AI Vision + Meal Planner, chỉ lắng nghe nội bộ `127.0.0.1:3100`. |
| `postgres` | `fit_db_prod` | PostgreSQL 15 lưu trữ dữ liệu bền vững (`pgdata_prod`), không mở port ra Internet. |
| `db-backup` | `fit_db_backup_prod` | Dịch vụ sao lưu tự động hàng ngày lúc nửa đêm (`@daily`), lưu xoay vòng 7 ngày / 4 tuần / 6 tháng. |

---

## 2. Hướng dẫn Cài đặt & Cấu hình HTTPS (SSL/TLS)

### Bước 1: Trỏ DNS tên miền về IP máy chủ VPS
Cấu hình các bản ghi **A Record** trỏ về IP Public của máy chủ:
- `@` -> `<IP_VPS>`
- `www` -> `<IP_VPS>`
- `api` -> `<IP_VPS>`

### Bước 2: Chuẩn bị biến môi trường
Tạo file `.env` ở thư mục gốc và trong `apps/backend/.env`, `apps/web/.env`:
```env
DOMAIN=nutricore.example.com
CERTBOT_EMAIL=admin@nutricore.example.com
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mat-khau-manh>
POSTGRES_DB=fit_management_db
```

### Bước 3: Cấp phát chứng chỉ HTTPS lần đầu
Chạy script khởi tạo Let's Encrypt (tạo dummy cert tạm để Nginx khởi động, xác thực ACME Webroot và tải chứng chỉ thật):
```bash
chmod +x scripts/*.sh
./scripts/init-letsencrypt.sh
```

### Bước 4: Khởi chạy toàn bộ hệ thống Production
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Sau bước này:
- Web App truy cập qua: `https://<DOMAIN>` (HTTP 80 tự động chuyển hướng 301 sang HTTPS 443)
- Backend API truy cập qua: `https://api.<DOMAIN>` hoặc `https://<DOMAIN>/api/`

---

## 3. Cơ chế Tự động Sao lưu & Phục hồi Dữ liệu

### 3.1. Sao lưu tự động (3 lớp bảo vệ)
1. **Docker Sidecar (`db-backup`)**: Tự động chạy `pg_dump` mỗi ngày và lưu file nén tại `./backups/` theo chính sách xoay vòng (7 bản ngày, 4 bản tuần, 6 bản tháng).
2. **GitHub Actions Scheduled Cloud Backup (`.github/workflows/db-backup.yml`)**: Tự động chạy Cron hàng ngày lúc `02:00 UTC` (09:00 sáng giờ VN), nén `.sql.gz`, tạo mã kiểm tra `SHA-256`, lưu trên GitHub Artifacts (30 ngày) và hỗ trợ đồng bộ lên AWS S3 / Cloudflare R2.
3. **Script vận hành thủ công / Crontab Host**:
   - Linux/macOS: `./scripts/backup-db.sh` (hỗ trợ gửi thông báo Webhook Discord/Slack).
   - Windows Server: `.\scripts\backup-db.ps1`.

### 3.2. Phục hồi dữ liệu khẩn cấp (Disaster Recovery)
```bash
./scripts/restore-db.sh ./backups/nutricore_db_YYYYMMDD_HHMMSS.sql.gz
```
Script sẽ tự động kiểm tra checksum `SHA-256`, kiểm tra tính toàn vẹn file `gzip` và yêu cầu xác nhận trước khi khôi phục.

---

## 4. Quy trình Kiểm thử Tự động (Mục 5)

### Unit & Integration Tests (Jest + Vitest)
Chạy toàn bộ bộ test cho cả Backend (NestJS/Jest) và Web (Vitest):
```bash
npm test
```
Hoặc chạy riêng từng workspace:
```bash
npm test -w backend
npm test -w web
```

### End-to-End (E2E) Tests với Playwright
Chạy giả lập trình duyệt Chromium kiểm tra các luồng nghiệp vụ quan trọng (Đăng nhập, Dinh dưỡng, PT Management):
```bash
npm run test:e2e -w apps/web
```

---

## 5. Thiết lập GitHub Secrets cho CI/CD (`.github/workflows/ci.yml`)

Để bật tính năng tự động triển khai (CD) lên VPS và tự động Backup Cloud mỗi khi push lên nhánh `main`, hãy cấu hình các Secrets trong **GitHub Repository Settings -> Secrets and variables -> Actions**:

- **Secrets:**
  - `DATABASE_URL`: Chuỗi kết nối PostgreSQL cho Cloud Backup workflow.
  - `VPS_HOST`: Địa chỉ IP hoặc Domain máy chủ Production.
  - `VPS_USER`: Tài khoản SSH (ví dụ `ubuntu` hoặc `root`).
  - `VPS_SSH_KEY`: Private SSH Key để GitHub Actions truy cập VPS.
  - `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: *(Tùy chọn)* Lưu backup lên S3/Cloudflare R2.
- **Variables:**
  - `VPS_APP_DIR`: Thư mục chứa mã nguồn trên VPS (mặc định `/opt/nutricore`).
  - `ENABLE_DOCKER_PUSH`: Đặt `true` để đẩy Docker image lên GHCR.
  - `ENABLE_VPS_DEPLOY`: Đặt `true` để tự động SSH triển khai lên VPS khi push vào nhánh `main`.
  - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
