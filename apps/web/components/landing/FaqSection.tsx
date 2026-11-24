import React from 'react';
import FaqAccordion from './FaqAccordion';

export default function FaqSection() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-black">
          Câu Hỏi Thường Gặp
        </h2>
        <p className="text-zinc-600 text-xs sm:text-sm">
          Mọi điều bạn cần biết trước khi bắt đầu cùng NutriCore.
        </p>
      </div>

      <FaqAccordion />
    </section>
  );
}
