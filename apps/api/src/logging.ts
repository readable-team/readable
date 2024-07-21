import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (level) => ({ level }),
  },
});
