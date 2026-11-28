import { describe, expect, it } from 'vitest';
import { parseSseBuffer } from './sseParser';
import {
  mapNotificationTypeToSyncEvent,
  markNotificationToasted,
} from './realtimeSync';

describe('notificationStream & realtimeSync helpers', () => {
  it('parses complete SSE events, ignores comments, and preserves trailing remainder', () => {
    const chunk =
      ': ping\r\n\r\n' +
      'event: connected\r\ndata: {"userId":"pt-1"}\r\n\r\n' +
      'event: notification\ndata: {"event":"notification","type":"STUDENT_REQUEST"}\n\n' +
      'event: sync\ndata: {"event":"sync"';

    const result = parseSseBuffer(chunk);

    expect(result.events).toEqual([
      { event: 'connected', data: '{"userId":"pt-1"}' },
      {
        event: 'notification',
        data: '{"event":"notification","type":"STUDENT_REQUEST"}',
      },
    ]);
    expect(result.remainder).toBe('event: sync\ndata: {"event":"sync"');
  });

  it('maps PT bind and student request notifications to PT_REQUEST_UPDATED', () => {
    expect(mapNotificationTypeToSyncEvent('STUDENT_REQUEST')).toBe(
      'PT_REQUEST_UPDATED',
    );
    expect(mapNotificationTypeToSyncEvent('PT_REQUEST_CANCELLED')).toBe(
      'PT_REQUEST_UPDATED',
    );
    expect(mapNotificationTypeToSyncEvent('PT_ACCEPTED')).toBe(
      'PT_REQUEST_UPDATED',
    );
    expect(mapNotificationTypeToSyncEvent('PT_APPLICATION')).toBe(
      'PT_APPLICATION_UPDATED',
    );
    expect(mapNotificationTypeToSyncEvent('UNKNOWN_TYPE')).toBe(
      'NOTIFICATION_RECEIVED',
    );
  });

  it('deduplicates notification toast IDs across bell instances', () => {
    const id = `notif-${Date.now()}`;
    expect(markNotificationToasted(id)).toBe(true);
    expect(markNotificationToasted(id)).toBe(false);
    expect(markNotificationToasted('')).toBe(false);
  });
});
