import { ApiError } from '@/errors';

export const first = <T>(arr: T[]): T | undefined => arr[0];
export const firstOrThrow = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new ApiError({ code: 'not_found' });
  }

  return arr[0];
};
