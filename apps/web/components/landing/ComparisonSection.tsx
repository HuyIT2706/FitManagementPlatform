import React from 'react';

export default function ComparisonSection() {
  return (
    <section id="comparison" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-black">
          Bảng So Sánh NutriCore vs Cách Làm Thủ Công
        </h2>
        <p className="text-zinc-600 text-xs sm:text-sm">
          Xem sự khác biệt rõ rệt giữa phương pháp đo lường truyền thống và nền tảng thông minh NutriCore.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80">
              <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-600 font-bold w-1/3">
                Tiêu chí
              </th>
              <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-600 font-bold w-1/3">
                Phương pháp truyền thống
              </th>
              <th className="py-4 px-6 text-xs uppercase tracking-wider text-black font-extrabold w-1/3 bg-zinc-100/50">
                NutriCore AI Platform
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
            <tr>
              <td className="py-4 px-6 font-bold text-black">1. Ghi nhận bữa ăn</td>
              <td className="py-4 px-6 text-zinc-600">
                Cân tiểu ly từng lạng, tra cứu Excel mỏi mắt.
              </td>
              <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                Chụp 1 tấm ảnh hoặc nói 1 câu tự nhiên (1s).
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-black">2. Cân bằng dinh dưỡng Macro</td>
              <td className="py-4 px-6 text-zinc-600">
                Tính nhẩm cảm tính, thường xuyên thiếu Protein.
              </td>
              <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                Thuật toán Knapsack Heuristic chuẩn hóa Macro.
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-black">3. Tương tác với Huấn luyện viên</td>
              <td className="py-4 px-6 text-zinc-600">
                Nhắn tin Zalo rời rạc, trôi tin, khó theo dõi.
              </td>
              <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                Đồng bộ 1 chạm qua mã QR, lịch tập trực tiếp.
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-black">4. Đánh giá sự tiến bộ</td>
              <td className="py-4 px-6 text-zinc-600">
                Chỉ nhìn số ký thông thường, không rõ cơ hay mỡ.
              </td>
              <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                Biểu đồ InBody Stock Chart & Thanh trượt Before/After.
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-black">5. Bảo mật dữ liệu cá nhân</td>
              <td className="py-4 px-6 text-zinc-600">
                Dữ liệu vóc dáng dễ bị chia sẻ công khai.
              </td>
              <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                Mã hóa đầu cuối AES-256-GCM chuẩn quân đội.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
