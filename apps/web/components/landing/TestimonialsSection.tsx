import React from 'react';
import TestimonialsMarquee from './TestimonialsMarquee';

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
          Đánh Giá Từ Cộng Đồng Tập Luyện
        </h2>
        <p className="text-zinc-600 text-sm sm:text-base">
          Lắng nghe câu chuyện thay đổi vóc dáng và thói quen dinh dưỡng từ những học viên và PT tiên phong.
        </p>
      </div>

      {/* 3D Horizontal Infinite Marquee Carousel (3 Cards Per Row on Desktop) */}
      <TestimonialsMarquee />
    </section>
  );
}
