import React from "react";
import Link from "next/link";

interface BottomNavBarProps {
  activeTab: 'diary' | 'workout' | 'history' | 'profile';
}

const BottomNavBar = ({ activeTab }: BottomNavBarProps) => {
  return (
    <>
      <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex items-center justify-center gap-3">
        <nav className="flex items-center justify-between rounded-full p-2 shadow-lg bg-white/10 backdrop-blur-xl border border-white/20">
          
          <Link href="/home" prefetch={true} className={`flex items-center gap-2 rounded-full transition-colors ${activeTab === 'diary' ? 'bg-green-light/10 text-green-light px-4 py-2' : 'w-10 h-10 shrink-0 justify-center text-on-surface-variant/40 hover:bg-surface-bright/10'}`}>
            <span className="material-symbols-outlined" style={activeTab === 'diary' ? { fontVariationSettings: "'FILL' 1" } : {}}>style</span>
            {activeTab === 'diary' && <span className="font-headline-md text-lg">Nhật ký</span>}
          </Link>

          <div className="flex items-center">
            <Link href="/training" prefetch={true} className={`flex items-center gap-2 rounded-full transition-colors ${activeTab === 'workout' ? 'bg-green-light/10 text-green-light px-4 py-2' : 'w-10 h-10 justify-center text-on-surface-variant/40 hover:bg-surface-bright/10'}`}>
              <span className="material-symbols-outlined" style={activeTab === 'workout' ? { fontVariationSettings: "'FILL' 1" } : {}}>directions_run</span>
              {activeTab === 'workout' && <span className="font-headline-md text-lg">Tập luyện</span>}
            </Link>
            
            <Link href="/history" prefetch={true} className={`flex items-center gap-2 rounded-full transition-colors ${activeTab === 'history' ? 'bg-green-light/10 text-green-light px-4 py-2' : 'w-10 h-10 justify-center text-on-surface-variant/40 hover:bg-surface-bright/10'}`}>
              <span className="material-symbols-outlined" style={activeTab === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
              {activeTab === 'history' && <span className="font-headline-md text-lg">Lịch sử</span>}
            </Link>
            
            <Link href="/profile" prefetch={true} className={`flex items-center gap-2 rounded-full transition-colors ${activeTab === 'profile' ? 'bg-green-light/10 text-green-light px-4 py-2' : 'w-10 h-10 justify-center text-on-surface-variant/40 hover:bg-surface-bright/10'}`}>
              <span className="material-symbols-outlined" style={activeTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
              {activeTab === 'profile' && <span className="font-headline-md text-lg">Tôi</span>}
            </Link>
          </div>
        </nav>
        
        <button className="w-14 h-14 shrink-0 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(102,200,28,0.4)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl font-bold">add</span>
        </button>
      </div>
      {/* Add space for fixed bottom nav on mobile */}
      <div className="h-32 md:hidden"></div>
    </>
  );
};

export default BottomNavBar;
