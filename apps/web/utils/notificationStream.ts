'use client';

import { mutate } from 'swr';
import { API_BASE_URL, getValidAccessToken } from '../api/axios';
import type { NotificationItem } from '../interface';
import { toast } from './toast';
import {
  broadcastSync,
  mapNotificationTypeToSyncEvent,
  markNotificationToasted,
  type SyncEventType,
} from './realtimeSync';
import { parseSseBuffer } from './sseParser';

interface NotificationsSnapshot {
  notifications: NotificationItem[];
  unreadCount: number;
}

interface RealtimeStreamPayload {
  event?: 'notification' | 'sync';
  notification?: NotificationItem;
  syncType?: SyncEventType;
  type?: string;
}

function handleRealtimeEvent(eventName: string, rawData: string): void {
  if (eventName === 'connected') return;

  let payload: RealtimeStreamPayload;
  try {
    payload = JSON.parse(rawData) as RealtimeStreamPayload;
  } catch {
    return;
  }

  if (eventName === 'notification' && payload.notification) {
    const notif = payload.notification;

    void mutate<NotificationsSnapshot>(
      '/notifications',
      (current) => {
        if (!current) {
          return { notifications: [notif], unreadCount: notif.isRead ? 0 : 1 };
        }
        if (current.notifications.some((item) => item.id === notif.id)) {
          return current;
        }
        return {
          notifications: [notif, ...current.notifications].slice(0, 30),
          unreadCount: current.unreadCount + (notif.isRead ? 0 : 1),
        };
      },
      { revalidate: true },
    );

    if (!notif.isRead && markNotificationToasted(notif.id)) {
      toast.info(notif.message, notif.title);
    }

    broadcastSync(mapNotificationTypeToSyncEvent(notif.type || payload.type));
    return;
  }

  if (eventName === 'sync' && payload.syncType) {
    broadcastSync(payload.syncType);
  }
}

export function startNotificationStream(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let disposed = false;
  let activeController: AbortController | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let retryDelayMs = 1500;
  let hasConnectedOnce = false;

  const scheduleReconnect = (delayMs?: number) => {
    if (disposed || reconnectTimer) return;
    const waitMs = delayMs ?? retryDelayMs;
    retryDelayMs = Math.min(retryDelayMs * 2, 15000);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, waitMs);
  };

  const connect = async (forceRefresh = false): Promise<void> => {
    if (disposed) return;

    const token = await getValidAccessToken(forceRefresh);
    if (!token || disposed) return;

    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.status === 401 && !forceRefresh) {
        await connect(true);
        return;
      }

      if (!response.ok || !response.body) {
        scheduleReconnect();
        return;
      }

      if (hasConnectedOnce) {
        void mutate('/notifications');
        void mutate('/users/me');
        void mutate('/pt/dashboard');
        void mutate('/workout/assigned-meal-plan');
        void mutate('/workout/assigned-workout-plan');
      }
      hasConnectedOnce = true;
      retryDelayMs = 1500;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!disposed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseBuffer(buffer);
        buffer = parsed.remainder;

        for (const frame of parsed.events) {
          handleRealtimeEvent(frame.event, frame.data);
        }
      }

      if (!disposed) {
        scheduleReconnect(1500);
      }
    } catch (err: unknown) {
      if (disposed || (err instanceof Error && err.name === 'AbortError')) {
        return;
      }
      scheduleReconnect();
    }
  };

  void connect();

  return () => {
    disposed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    activeController?.abort();
    activeController = null;
  };
}
