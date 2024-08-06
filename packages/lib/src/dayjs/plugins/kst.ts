import type { PluginFunc } from 'dayjs';

declare module 'dayjs' {
  export function kst(date?: ConfigType, format?: string): Dayjs;

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Dayjs {
    kst: (options?: { keepLocalTime: boolean }) => Dayjs;
  }
}

export const kst: PluginFunc = (_, Dayjs, dayjs) => {
  dayjs.kst = (date, format) => {
    return format ? dayjs.tz(date, format, 'Asia/Seoul') : dayjs.tz(date, 'Asia/Seoul');
  };

  Dayjs.prototype.kst = function (options) {
    return this.tz('Asia/Seoul', options?.keepLocalTime);
  };
};
