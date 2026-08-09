/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import React from "react";

export default function TopBar({ userData, onLogout }: { userData: any, onLogout: () => void }) {
  return (
    <>
      {/* TopAppBar (Web) */}
      <header className="hidden md:flex justify-between items-center px-container-padding py-stack-sm w-full bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-bright overflow-hidden">
            {userData?.avatarUrl ? (
              <img className="object-cover w-full h-full" src={userData.avatarUrl} alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-light text-dark-slate font-bold">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-xl font-bold text-on-surface">FitManagementPlatform</span>
            <span className="text-sm text-primary">Member Badge</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button className="p-2 hover:bg-surface-bright/20 rounded-full text-on-surface-variant ml-4">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button onClick={onLogout} className="p-2 hover:bg-surface-bright/20 rounded-full text-red-400 hover:text-red-500">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex justify-between items-center px-container-padding py-4 w-full sticky top-0 z-50 bg-dark-slate/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-bright overflow-hidden border border-outline-variant/30 relative">
            {userData?.avatarUrl ? (
              <img className="object-cover w-full h-full" src={userData.avatarUrl} alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-light text-dark-slate font-bold">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border border-dark-slate"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-sm text-on-surface-variant">Chào buổi sáng,</span>
            <span className="font-headline-md text-lg text-on-surface -mt-1 truncate max-w-36">{userData?.fullName || 'Thành viên'}</span>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 bg-bento-bg border border-bento-border rounded-full text-red-400 hover:text-red-500 transition-colors">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </>
  );
}
