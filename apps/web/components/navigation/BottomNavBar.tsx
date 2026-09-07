import React from "react";
import Link from "next/link";

interface BottomNavBarProps {
  activeTab: 'diary' | 'workout' | 'history' | 'profile';
}

const BottomNavBar = ({ activeTab }: BottomNavBarProps) => {
  return (
    <>
      <div className="md:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-sm sm:max-w-md z-50 flex items-center justify-center gap-2 sm:gap-3">
        <nav className="flex-1 flex items-center justify-between rounded-full p-1.5 sm:p-2 shadow-2xl bg-[#121620]/90 backdrop-blur-xl border border-white/20">
          
          <Link href="/home" prefetch={true} className={`flex items-center gap-1.5 rounded-full transition-all ${activeTab === 'diary' ? 'bg-green-light/15 text-green-light px-3 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_10px_rgba(102,200,28,0.2)]' : 'w-9 h-9 sm:w-10 sm:h-10 shrink-0 justify-center text-on-surface-variant/50 hover:bg-surface-bright/20 hover:text-white'}`}>
            <span className="material-symbols-outlined text-xl sm:text-2xl" style={activeTab === 'diary' ? { fontVariationSettings: "'FILL' 1" } : {}}>style</span>
            {activeTab === 'diary' && <span className="font-headline-md text-xs sm:text-sm font-bold truncate">Nhật ký</span>}
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link href="/training" prefetch={true} className={`flex items-center gap-1.5 rounded-full transition-all ${activeTab === 'workout' ? 'bg-green-light/15 text-green-light px-3 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_10px_rgba(102,200,28,0.2)]' : 'w-9 h-9 sm:w-10 sm:h-10 shrink-0 justify-center text-on-surface-variant/50 hover:bg-surface-bright/20 hover:text-white'}`}>
              <span className="material-symbols-outlined text-xl sm:text-2xl" style={activeTab === 'workout' ? { fontVariationSettings: "'FILL' 1" } : {}}>directions_run</span>
              {activeTab === 'workout' && <span className="font-headline-md text-xs sm:text-sm font-bold truncate">Tập luyện</span>}
            </Link>
            
            <Link href="/history" prefetch={true} className={`flex items-center gap-1.5 rounded-full transition-all ${activeTab === 'history' ? 'bg-green-light/15 text-green-light px-3 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_10px_rgba(102,200,28,0.2)]' : 'w-9 h-9 sm:w-10 sm:h-10 shrink-0 justify-center text-on-surface-variant/50 hover:bg-surface-bright/20 hover:text-white'}`}>
              <span className="material-symbols-outlined text-xl sm:text-2xl" style={activeTab === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
              {activeTab === 'history' && <span className="font-headline-md text-xs sm:text-sm font-bold truncate">Lịch sử</span>}
            </Link>
            
            <Link href="/profile" prefetch={true} className={`flex items-center gap-1.5 rounded-full transition-all ${activeTab === 'profile' ? 'bg-green-light/15 text-green-light px-3 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_10px_rgba(102,200,28,0.2)]' : 'w-9 h-9 sm:w-10 sm:h-10 shrink-0 justify-center text-on-surface-variant/50 hover:bg-surface-bright/20 hover:text-white'}`}>
              <span className="material-symbols-outlined text-xl sm:text-2xl" style={activeTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
              {activeTab === 'profile' && <span className="font-headline-md text-xs sm:text-sm font-bold truncate">Tôi</span>}
            </Link>
          </div>
        </nav>
        
        <Link
          href="/add-meal"
          prefetch={true}
          aria-label="Thêm bữa ăn nhanh"
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_15px_rgba(102,200,28,0.45)] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl font-extrabold">add</span>
        </Link>
      </div>
      {/* Add space for fixed bottom nav on mobile */}
      <div className="h-24 sm:h-28 md:hidden"></div>
    </>
  );
};

export default BottomNavBar;
