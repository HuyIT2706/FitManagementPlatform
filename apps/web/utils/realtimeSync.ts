import { mutate } from 'swr';

export type SyncEventType =
  | 'PT_BIND_UPDATED'
  | 'PT_REQUEST_UPDATED'
  | 'PT_APPLICATION_UPDATED'
  | 'PROFILE_UPDATED'
  | 'MEAL_PLAN_UPDATED'
  | 'WORKOUT_UPDATED'
  | 'NOTIFICATION_RECEIVED';

const CHANNEL_NAME = 'nutricore_realtime_sync';

// Global BroadcastChannel instance
let broadcastChannel: BroadcastChannel | null = null;
const syncListeners = new Set<(type: SyncEventType) => void>();

export const subscribeSync = (listener: (type: SyncEventType) => void): (() => void) => {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
};

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        executeSync(event.data as SyncEventType);
      }
    };
  } catch (err) {
    console.warn('BroadcastChannel not supported or error:', err);
  }
}

export const executeSync = (type: SyncEventType): void => {
  // Notify custom subscribers
  syncListeners.forEach((fn) => {
    try {
      fn(type);
    } catch (err) {
      console.error('Error in sync listener:', err);
    }
  });
  switch (type) {
    case 'PT_BIND_UPDATED':
    case 'PT_REQUEST_UPDATED':
      mutate('/users/me');
      mutate('/pt/dashboard');
      mutate('/pt/students/requests');
      mutate('/notifications');
      mutate('/workout/assigned-meal-plan');
      mutate('/workout/assigned-workout-plan');
      break;
    case 'PT_APPLICATION_UPDATED':
      mutate('/users/me');
      mutate('/admin/pt-applications');
      mutate('/admin/stats');
      mutate('/notifications');
      break;
    case 'PROFILE_UPDATED':
      mutate('/users/me');
      mutate('/pt/profile');
      mutate('/admin/stats');
      break;
    case 'MEAL_PLAN_UPDATED':
      mutate('/workout/assigned-meal-plan');
      mutate('/pt/dashboard');
      mutate('/notifications');
      break;
    case 'WORKOUT_UPDATED':
      mutate('/workout/assigned-workout-plan');
      mutate('/pt/dashboard');
      mutate('/notifications');
      break;
    default:
      mutate('/users/me');
      mutate('/notifications');
      break;
  }
};

/**
 * Broadcasts a realtime synchronization event across all open tabs
 * and immediately triggers SWR revalidation on the current page.
 */
export const broadcastSync = (type: SyncEventType): void => {
  if (typeof window === 'undefined') return;

  // 1. Revalidate on the current tab immediately
  executeSync(type);

  // 2. Broadcast to other tabs in the browser
  try {
    broadcastChannel?.postMessage(type);
  } catch {
    // Fallback if BroadcastChannel fails: localStorage event
    try {
      localStorage.setItem('nutricore_sync_ping', `${type}_${Date.now()}`);
    } catch {
      // Storage set fallback failed silently
    }
  }
};

// Listen to storage event as fallback for cross-tab communication
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'nutricore_sync_ping' && e.newValue) {
      const type = e.newValue.split('_')[0] as SyncEventType;
      if (type) {
        executeSync(type);
      }
    }
  });
}
