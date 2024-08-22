import { defineCron } from './types';

export const TestCron = defineCron('* * * * *', async () => {
  // do something
});
