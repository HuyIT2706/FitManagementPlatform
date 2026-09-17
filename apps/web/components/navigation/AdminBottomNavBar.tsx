"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShieldCheck, Users, Dumbbell } from "lucide-react";

const AdminBottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Tổng quan",
      href: "/admin",
      icon: BarChart3,
      isActive: pathname === "/admin",
    },
    {
      label: "Duyệt PT",
      href: "/admin/CoachReview",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/admin/CoachReview"),
    },
    {
      label: "Người dùng",
      href: "/admin/UserManagement",
      icon: Users,
      isActive: pathname.startsWith("/admin/UserManagement"),
    },
    {
      label: "Bài & Món",
      href: "/admin/ExerciseManagement",
      icon: Dumbbell,
      isActive: pathname.startsWith("/admin/ExerciseManagement"),
    },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex items-center justify-center">
        <nav className="w-full flex items-center justify-between rounded-full p-1.5 sm:p-2 shadow-2xl bg-white/95 dark:bg-[#121926]/90 backdrop-blur-xl border border-slate-200 dark:border-white/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-1.5 rounded-full transition-all duration-200 ${
                  item.isActive
                    ? "bg-green-light/15 text-green-light px-3.5 sm:px-4 py-2 font-bold shadow-xs"
                    : "w-10 h-10 shrink-0 flex items-center justify-center text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-100 dark:hover:bg-surface-bright/50"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.isActive && (
                  <span className="font-headline-md text-xs sm:text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed bottom nav on mobile screens */}
      <div className="h-28 md:hidden"></div>
    </>
  );
};

export default AdminBottomNavBar;
