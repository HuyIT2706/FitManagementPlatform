'use client';

import React from 'react';
import Image from 'next/image';
import LogoApp from '../../assets/imgs/logoApp.jpg';

export interface AppLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const AppLoading = ({
  message = 'Đang tải dữ liệu...',
  size = 'md',
  fullScreen = false,
}: AppLoadingProps) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const logoSize = isSm ? 'w-8 h-8' : isLg ? 'w-16 h-16' : 'w-12 h-12';
  const spinnerSize = isSm ? 'w-12 h-12' : isLg ? 'w-24 h-24' : 'w-16 h-16';

  const content = (
    <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4" suppressHydrationWarning>
      <div className={`relative flex items-center justify-center ${spinnerSize}`}>
        {/* Animated Outer Pulse / Spin Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#10b981]/25 animate-ping opacity-40" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#10b981] border-r-[#10b981] border-b-transparent border-l-transparent animate-spin" />

        {/* Inner Logo */}
        <div className={`relative ${logoSize} rounded-full overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0 animate-pulse`}>
          <Image
            src={LogoApp}
            alt="NutriCore Loading"
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>

      {message && (
        <p className="text-xs text-white/70 font-medium tracking-wide animate-pulse text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#090d0b] text-white flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default AppLoading;
