import { TRPCError } from '@trpc/server';

export const first = <T>(arr: T[]): T | undefined => arr[0];
export const firstOrThrow = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }

  return arr[0];
};
