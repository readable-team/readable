export type CronFn = () => Promise<void>;

export type CronSpec = {
  pattern: string;
  fn: CronFn;
};

export const defineCron = (pattern: string, fn: CronFn): CronSpec => {
  return { pattern, fn };
};
