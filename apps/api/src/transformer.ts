import dayjs from 'dayjs';
import { parse, stringify } from 'devalue';

export const transformer = {
  serialize: (object: unknown) =>
    stringify(object, {
      Dayjs: (value) => dayjs.isDayjs(value) && value.toISOString(),
    }),

  deserialize: (object: string) =>
    parse(object, {
      Dayjs: (value) => dayjs(value),
    }),
};
