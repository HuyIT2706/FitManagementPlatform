export interface BodyMetricRecord {
  id: string;
  userId: string;
  weight: number;
  height: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  recordedAt: Date;
}

export interface BodyMetricClient {
  bodyMetric: {
    findFirst(args: {
      where: {
        userId: string;
        recordedAt: { gte: Date; lte: Date };
      };
      orderBy: { recordedAt: 'desc' };
    }): Promise<BodyMetricRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        weight: number;
        height?: number | null;
        bodyFat?: number | null;
        muscleMass?: number | null;
        recordedAt: Date;
      };
    }): Promise<BodyMetricRecord>;
    create(args: {
      data: {
        userId: string;
        weight: number;
        height?: number | null;
        bodyFat?: number | null;
        muscleMass?: number | null;
        recordedAt?: Date;
      };
    }): Promise<BodyMetricRecord>;
  };
}

export interface UpsertBodyMetricInput {
  weight: number;
  height?: number | null;
  bodyFat?: number | null;
  muscleMass?: number | null;
  recordedAt?: Date;
}

export const BODY_METRIC_MERGE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Records a body metric measurement, merging updates made within the same
 * 1-hour window into the existing entry instead of creating duplicate history rows.
 */
export async function upsertRecentBodyMetric(
  client: BodyMetricClient,
  userId: string,
  input: UpsertBodyMetricInput,
  windowMs: number = BODY_METRIC_MERGE_WINDOW_MS,
): Promise<BodyMetricRecord> {
  const recordedAt = input.recordedAt ?? new Date();
  const windowStart = new Date(recordedAt.getTime() - windowMs);
  const windowEnd = new Date(recordedAt.getTime() + windowMs);

  const recent = await client.bodyMetric.findFirst({
    where: {
      userId,
      recordedAt: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    orderBy: { recordedAt: 'desc' },
  });

  if (recent) {
    return client.bodyMetric.update({
      where: { id: recent.id },
      data: {
        weight: input.weight,
        height: input.height !== undefined ? input.height : recent.height,
        bodyFat: input.bodyFat !== undefined ? input.bodyFat : recent.bodyFat,
        muscleMass:
          input.muscleMass !== undefined ? input.muscleMass : recent.muscleMass,
        recordedAt,
      },
    });
  }

  return client.bodyMetric.create({
    data: {
      userId,
      weight: input.weight,
      height: input.height !== undefined ? input.height : undefined,
      bodyFat: input.bodyFat !== undefined ? input.bodyFat : undefined,
      muscleMass: input.muscleMass !== undefined ? input.muscleMass : undefined,
      recordedAt,
    },
  });
}

/**
 * Formats a timestamp in Vietnam local time with date and HH:mm for historical tables.
 */
export function formatBodyMetricDisplayDate(date: Date): string {
  const datePart = date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const timePart = date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} • ${timePart}`;
}
