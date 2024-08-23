import { getClientAddress } from '@readable/lib';
import Elysia from 'elysia';

export const ip = new Elysia({ name: 'ip' }).derive({ as: 'scoped' }, ({ request, server }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ip: getClientAddress(request, server!) };
});
