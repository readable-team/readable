import Elysia from 'elysia';
import IPAddr from 'ipaddr.js';

export const ip = new Elysia({ name: 'ip' }).derive({ as: 'scoped' }, ({ request, server }) => {
  const xff = request.headers.get('x-forwarded-for');
  const ip =
    xff?.split(',').findLast((ip) => IPAddr.isValid(ip) && IPAddr.process(ip).range() === 'private') ??
    server?.requestIP(request)?.address ??
    '0.0.0.0';

  return { ip };
});
