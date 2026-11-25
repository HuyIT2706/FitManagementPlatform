import {
  formatBodyMetricDisplayDate,
  upsertRecentBodyMetric,
  type BodyMetricClient,
  type BodyMetricRecord,
} from './body-metric.util';

describe('upsertRecentBodyMetric', () => {
  const userId = 'user-1';

  function createMockClient(recentRecord: BodyMetricRecord | null): {
    client: BodyMetricClient;
    findFirst: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  } {
    const findFirst = jest.fn().mockResolvedValue(recentRecord);
    const update = jest.fn().mockImplementation(
      ({
        where,
        data,
      }: {
        where: { id: string };
        data: {
          weight: number;
          height?: number | null;
          bodyFat?: number | null;
          muscleMass?: number | null;
          recordedAt: Date;
        };
      }) =>
        Promise.resolve({
          id: where.id,
          userId,
          weight: data.weight,
          height: data.height ?? null,
          bodyFat: data.bodyFat ?? null,
          muscleMass: data.muscleMass ?? null,
          recordedAt: data.recordedAt,
        }),
    );
    const create = jest.fn().mockImplementation(
      ({
        data,
      }: {
        data: {
          userId: string;
          weight: number;
          height?: number | null;
          bodyFat?: number | null;
          muscleMass?: number | null;
          recordedAt?: Date;
        };
      }) =>
        Promise.resolve({
          id: 'metric-new',
          userId: data.userId,
          weight: data.weight,
          height: data.height ?? null,
          bodyFat: data.bodyFat ?? null,
          muscleMass: data.muscleMass ?? null,
          recordedAt: data.recordedAt ?? new Date(),
        }),
    );

    return {
      client: {
        bodyMetric: {
          findFirst,
          update,
          create,
        },
      },
      findFirst,
      update,
      create,
    };
  }

  it('creates a new bodyMetric when no record exists within 1 hour', async () => {
    const { client, update, create } = createMockClient(null);
    const now = new Date('2026-11-25T07:00:00.000Z');

    const result = await upsertRecentBodyMetric(client, userId, {
      weight: 68,
      height: 172,
      recordedAt: now,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId,
        weight: 68,
        height: 172,
        bodyFat: undefined,
        muscleMass: undefined,
        recordedAt: now,
      },
    });
    expect(update).not.toHaveBeenCalled();
    expect(result.id).toBe('metric-new');
  });

  it('merges into the existing bodyMetric when logged again within 1 hour', async () => {
    const earlier = new Date('2026-11-25T07:10:00.000Z');
    const later = new Date('2026-11-25T07:45:00.000Z');
    const { client, update, create } = createMockClient({
      id: 'metric-1',
      userId,
      weight: 68,
      height: 172,
      bodyFat: null,
      muscleMass: null,
      recordedAt: earlier,
    });

    const result = await upsertRecentBodyMetric(client, userId, {
      weight: 68,
      bodyFat: 18.5,
      muscleMass: 32.5,
      recordedAt: later,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'metric-1' },
      data: {
        weight: 68,
        height: 172,
        bodyFat: 18.5,
        muscleMass: 32.5,
        recordedAt: later,
      },
    });
    expect(create).not.toHaveBeenCalled();
    expect(result.bodyFat).toBe(18.5);
  });

  it('formats displayDate cleanly with Vietnam date and HH:mm time', () => {
    const utcDate = new Date('2026-11-25T07:35:00.000Z');
    const formatted = formatBodyMetricDisplayDate(utcDate);
    expect(formatted).toContain('25/11/2026');
    expect(formatted).toContain('14:35');
  });
});
