'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  Apple,
  Droplets,
  Dumbbell,
  UserPlus,
  Award,
  BellRing,
  Sparkles,
  X,
} from 'lucide-react';
import apiClient from '../../api/axios';
import { useNotifications } from '../../hooks/swr';
import { toast } from '../../utils/toast';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  getNotificationPermissionStatus,
  autoSyncPushSubscription,
} from '../../utils/pushNotification';
import type {
  NotificationItem,
  NotificationBellDropdownProps,
} from '../../interface';

const NotificationBellDropdown = ({
  buttonClassName,
}: NotificationBellDropdownProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useNotifications();
  const notifications = useMemo(() => data?.notifications || [], [data?.notifications]);
  const unreadCount = data?.unreadCount || 0;
  const prevNotificationsRef = useRef<string[] | null>(null);

  // Live Toast notification when a new unread item arrives
  useEffect(() => {
    if (!data?.notifications) return;
    const currentIds = data.notifications.map((n) => n.id);
    if (prevNotificationsRef.current !== null) {
      const newNotifs = data.notifications.filter(
        (n) => !prevNotificationsRef.current?.includes(n.id) && !n.isRead
      );
      if (newNotifs.length > 0) {
        const latest = newNotifs[0];
        if (latest) {
          toast.info(latest.message, latest.title);
        }
      }
    }
    prevNotificationsRef.current = currentIds;
  }, [data?.notifications]);

  useEffect(() => {
    registerServiceWorker();
    const status = getNotificationPermissionStatus();
    setPermissionStatus(status);
    if (status === 'granted') {
      autoSyncPushSubscription();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'UNREAD') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await mutate(
        (current) => {
          if (!current) return current;
          return {
            notifications: current.notifications.map((n) =>
              n.id === notif.id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, current.unreadCount - 1),
          };
        },
        false
      );

      try {
        await apiClient.patch(`/notifications/${notif.id}/read`);
      } catch {
        mutate();
      }
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          notifications: current.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        };
      },
      false
    );

    try {
      await apiClient.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      mutate();
    }
  };

  const handleEnablePush = async () => {
    const success = await subscribeToPushNotifications();
    if (success) {
      setPermissionStatus('granted');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return 'Gần đây';
    }
  };

  const renderNotifIcon = (type: string) => {
    switch (type) {
      case 'SESSION_DEDUCT':
      case 'PACKAGE_UPDATE':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-[#10b981] shrink-0">
            <CalendarCheck size={16} />
          </div>
        );
      case 'MEAL_REMINDER':
      case 'NUTRITION_ASSIGNED':
      case 'MEAL_REVIEW':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Apple size={16} />
          </div>
        );
      case 'WATER_REMINDER':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Droplets size={16} />
          </div>
        );
      case 'WORKOUT_REMINDER':
      case 'WORKOUT_ASSIGNED':
        return (
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/15 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Dumbbell size={16} />
          </div>
        );
      case 'PT_REQUEST':
      case 'STUDENT_REQUEST':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <UserPlus size={16} />
          </div>
        );
      case 'PT_APPLICATION':
      case 'PT_ACCEPTED':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Award size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white/80 shrink-0">
            <Bell size={16} />
          </div>
        );
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left" suppressHydrationWarning>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next) mutate();
            return next;
          });
        }}
        className={
          buttonClassName ||
          'w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 dark:bg-[#10b981]/10 border border-emerald-200 dark:border-[#10b981]/30 text-emerald-600 dark:text-[#10b981] hover:bg-emerald-100 dark:hover:bg-[#10b981]/20 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 relative'
        }
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200 border-2 border-white dark:border-[#090d0b]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            aria-hidden="true"
          />

          <div
            className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 mx-auto sm:mx-0 w-auto sm:w-[400px] max-w-[420px] sm:max-w-none bg-white dark:bg-[#121a15] backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[82vh]"
            suppressHydrationWarning
          >
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Thông Báo
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-emerald-600 dark:text-[#10b981] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    <span>Đã đọc hết</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer sm:hidden"
                  aria-label="Đóng thông báo"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

          {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
            <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-[#10b981] min-w-0">
                <BellRing size={15} className="shrink-0" />
                <span className="truncate text-[11px] font-medium">
                  Bật thông báo đẩy ra màn hình
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Bật ngay
              </button>
            </div>
          )}

          <div className="px-3.5 pt-2.5 pb-1.5 flex items-center gap-2 border-b border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          <div className="overflow-y-auto max-h-[50vh] divide-y divide-slate-100 dark:divide-white/5 [&&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400 dark:text-white/30">
                  <Sparkles size={18} />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-white/60">
                  {filter === 'UNREAD' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-white/40 max-w-[220px] mx-auto">
                  Các thông báo trừ buổi, lịch tập và dinh dưỡng sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group relative ${
                    !notif.isRead
                      ? 'bg-emerald-50/40 dark:bg-[#10b981]/[0.04]'
                      : 'bg-transparent'
                  }`}
                >
                  {renderNotifIcon(notif.type)}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h5
                        className={`text-xs font-bold truncate ${
                          !notif.isRead
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-white/80'
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 dark:text-white/40 shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-white/70 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )}
    </div>
  );
};

export default NotificationBellDropdown;
