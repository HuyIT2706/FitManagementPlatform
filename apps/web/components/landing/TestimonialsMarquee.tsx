/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from './constants';

export default function TestimonialsMarquee() {
  return (
    <div className="relative overflow-hidden py-4" style={{ perspective: '1200px' }}>
      {/* Left fade gradient */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
      {/* Right fade gradient */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-white via-white/80 to-transparent" />

      {/* Marquee Track with 3 cards visible side-by-side on desktop */}
      <div
        className="marquee-track flex gap-6 py-6"
        style={{
          animation: 'marquee-scroll 36s linear infinite',
          width: 'max-content',
        }}
      >
        {/* Duplicate cards for seamless infinite loop */}
        {[...TESTIMONIALS, ...TESTIMONIALS].map((review, i) => (
          <div
            key={i}
            className="relative w-[310px] sm:w-[350px] lg:w-[360px] shrink-0 p-7 rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-5 cursor-pointer select-none overflow-hidden"
            style={{
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              transformStyle: 'preserve-3d',
              transform:
                i % 3 === 0
                  ? 'perspective(1000px) rotateY(3deg) translateZ(0px)'
                  : i % 3 === 1
                  ? 'perspective(1000px) rotateY(0deg) translateZ(10px)'
                  : 'perspective(1000px) rotateY(-3deg) translateZ(0px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                'perspective(1000px) rotateY(0deg) translateY(-8px) translateZ(30px) scale(1.025)';
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 25px 45px -12px rgba(0,0,0,0.12), 0 10px 20px -8px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              const idx3 = i % 3;
              (e.currentTarget as HTMLDivElement).style.transform =
                idx3 === 0
                  ? 'perspective(1000px) rotateY(3deg) translateZ(0px)'
                  : idx3 === 1
                  ? 'perspective(1000px) rotateY(0deg) translateZ(10px)'
                  : 'perspective(1000px) rotateY(-3deg) translateZ(0px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
          >
            {/* 3D Top Light Sheen */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent pointer-events-none" />
            {/* 3D Watermark Quote */}
            <span className="absolute top-4 right-6 text-5xl font-serif text-zinc-100 font-black select-none pointer-events-none leading-none">
              “
            </span>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                  {review.tag}
                </span>
              </div>
              <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed italic line-clamp-5">
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-zinc-100 flex items-center gap-3.5">
              <img
                src={review.avatar}
                alt={review.name}
                loading="lazy"
                decoding="async"
                className="w-11 h-11 rounded-full object-cover shadow-xs"
              />
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-black">{review.name}</h4>
                <p className="text-[11px] text-zinc-600 mt-0.5">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
