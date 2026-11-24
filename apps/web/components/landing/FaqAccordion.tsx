'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from './constants';

export default function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
        >
          <button
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-black text-sm hover:text-zinc-600 transition cursor-pointer"
          >
            <span>{item.q}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-black' : 'text-zinc-400'}`}
            />
          </button>
          {openFaq === idx && (
            <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
