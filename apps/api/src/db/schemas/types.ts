import dayjs from 'dayjs';
import { customType } from 'drizzle-orm/pg-core';

export const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'bytea',
  toDriver: (value) => value,
  fromDriver: (value) => value,
});

export const datetime = customType<{ data: dayjs.Dayjs; driverData: string }>({
  dataType: () => 'timestamp with time zone',
  fromDriver: (value) => dayjs(value),
  toDriver: (value) => value.toISOString(),
});

export const jsonb = customType<{ data: unknown; driverData: unknown }>({
  dataType: () => 'jsonb',
  toDriver: (value) => JSON.stringify(value),
  fromDriver: (value) => value,
});
