'use client';

import React, { useState } from 'react';

export default function RoleSwitcher() {
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'pt' | 'admin'>('student');

  return (
    <section id="roles" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
      <div className="rounded-3xl bg-zinc-50/70 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h2 className="text-2xl font-extrabold text-black">
              Thiết kế riêng cho từng vai trò
            </h2>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1">
              Tối ưu hóa thao tác cho cả Người tập, Huấn luyện viên và Ban quản trị.
            </p>
          </div>

          {/* Role Pills */}
          <div className="inline-flex p-1 rounded-full bg-white shadow-xs">
            <button
              onClick={() => setActiveRoleTab('student')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRoleTab === 'student'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Học viên
            </button>
            <button
              onClick={() => setActiveRoleTab('pt')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRoleTab === 'pt'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Huấn luyện viên
            </button>
            <button
              onClick={() => setActiveRoleTab('admin')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeRoleTab === 'admin'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Quản trị viên
            </button>
          </div>
        </div>

        {/* Role Step Breakdown */}
        <div className="grid sm:grid-cols-3 gap-4 pt-6">
          {activeRoleTab === 'student' && (
            <>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Onboarding</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Tính toán BMR, TDEE, lượng thâm hụt calo và khai báo danh sách thực phẩm dị ứng chỉ sau 1 phút.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Log Ăn Bằng AI</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Chụp ảnh bữa ăn hoặc nói qua mic, xem ngay bảng dinh dưỡng và giữ chuỗi Streak kỷ luật mỗi ngày.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Tập Cùng PT</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Xem ảnh hướng dẫn bài tập, quét mã QR điểm danh buổi tập và xem biểu đồ InBody thay đổi thể hình.
                </p>
              </div>
            </>
          )}

          {activeRoleTab === 'pt' && (
            <>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Mời Học Viên</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Tùy chọn số buổi gói tập (12, 16, 24, 36...) và tạo mã QR để học viên quét liên kết ngay tại phòng tập.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Lịch Dạy & Check-in</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Quản lý toàn bộ ca dạy trên lưới lịch tháng, điểm danh trừ buổi tập an toàn chống gian lận.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Duyệt Bữa Ăn</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Chỉ định thực đơn, duyệt nhật ký ăn uống và theo dõi biến đổi cơ mỡ của từng học viên trên 1 bảng điều khiển.
                </p>
              </div>
            </>
          )}

          {activeRoleTab === 'admin' && (
            <>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Phê Duyệt PT</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Xem hồ sơ bằng cấp, chứng chỉ thể hình và phê duyệt quyền hoạt động huấn luyện viên trên hệ thống.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Thư Viện Thực Phẩm</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Quản trị danh mục thực phẩm Việt Nam và kho bài tập chuẩn kỹ thuật với hình ảnh minh họa chất lượng cao.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Thống Kê Nền Tảng</p>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  Theo dõi số lượng học viên, hiệu suất hoạt động của các PT và chỉ số tăng trưởng toàn hệ sinh thái.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
