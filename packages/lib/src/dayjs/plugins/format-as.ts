import type { PluginFunc } from 'dayjs';

declare module 'dayjs' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Dayjs {
    formatAsDate: () => string;
    formatAsDateTime: () => string;
    formatAsTime: () => string;
  }
}

export const formatAs: PluginFunc = (_, Dayjs) => {
  Dayjs.prototype.formatAsDate = function () {
    return this.format('YYYY. MM. DD');
  };

  Dayjs.prototype.formatAsDateTime = function () {
    return this.format('YYYY. MM. DD. HH:mm');
  };

  Dayjs.prototype.formatAsTime = function () {
    return this.format('HH:mm');
  };
};
