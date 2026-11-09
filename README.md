# NutriCore — FitManagementPlatform

Nền tảng quản lý dinh dưỡng, tập luyện và huấn luyện viên cá nhân (PT) toàn diện, tích hợp AI Computer Vision nhận diện món ăn, thuật toán AI Meal Planner, PWA & Mobile Capacitor Android, hệ thống kiểm thử tự động và quy trình CI/CD Production.

---

## Kiến trúc Monorepo

- `apps/web`: Next.js 16 (App Router, Tailwind CSS, PWA, Capacitor Android)
- `apps/backend`: NestJS 11 REST API (Prisma ORM, JWT Auth, AI Vision, Smart Meal Planner)
- `packages/db`: Prisma Schema & Migrations (PostgreSQL)
- `packages/types`: TypeScript Shared Interfaces & DTO Contracts
- `packages/ui`: Shared UI Components
- `deploy/`: Cấu hình Nginx HTTPS Reverse Proxy & Hướng dẫn Triển khai Production
- `scripts/`: Scripts tự động sao lưu/phục hồi PostgreSQL và cấp phát chứng chỉ SSL

---

## Tính năng chính

1. **AI Computer Vision:** Chụp ảnh bữa ăn nhận diện thực phẩm và tính toán tự động Calo & Macro (Protein, Carbs, Fat).
2. **Smart AI Meal Planner:** Thuật toán chia bữa ăn & cân đối thực đơn đạt chuẩn 100% Protein, 95% Carbs, 90% Fat theo TDEE, mục tiêu và danh sách dị ứng/bệnh lý.
3. **PT & Gym Analytics:** Biểu đồ theo dõi dinh dưỡng, doanh thu, tiến độ học viên, chỉ định thực đơn và tính macro thời gian thực theo từng bữa.
4. **PWA & Mobile Native:** Tối ưu Responsive Mobile & đóng gói Capacitor Android APK.
5. **Kiểm thử Tự động (Unit Test + E2E):** Jest (Backend), Vitest (Web Utils) và Playwright (E2E UI).
6. **CI/CD, HTTPS & Backup Tự động:** GitHub Actions pipeline, Docker Compose Production với Nginx TLS 1.2/1.3, Let's Encrypt Certbot gia hạn tự động và hệ thống Backup Database định kỳ.

---

## Lệnh Phát triển & Kiểm thử

```bash
# Cài đặt thư viện toàn Monorepo
npm install

# Khởi chạy môi trường Development
npm run dev

# Kiểm tra Code Quality (Lint & Type-Check)
npm run lint
npm run check-types

# Chạy toàn bộ Unit & Integration Tests (Jest + Vitest)
npm test

# Chạy End-to-End Tests với Playwright
npm run test:e2e
```

---

## Triển khai Production (HTTPS, CI/CD & Database Backup)

Xem hướng dẫn chi tiết tại [deploy/DEPLOYMENT.md](./deploy/DEPLOYMENT.md).

