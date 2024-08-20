import Elysia from 'elysia';
import IPAddr from 'ipaddr.js';
import * as R from 'remeda';

export const ip = new Elysia({ name: 'ip' }).derive({ as: 'scoped' }, ({ request, server }) => {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ip = R.pipe(
      xff,
      R.split(','),
      R.map((v) => v.trim()),
      R.filter((v) => IPAddr.isValid(v)),
      R.map((v) => IPAddr.process(v)),
      R.findLast((v) => v.range() !== 'private'),
    );

    if (ip) {
      return { ip: ip.toString() };
    }
  }

  const ip = server?.requestIP(request)?.address;
  if (ip) {
    return { ip: IPAddr.process(ip).toString() };
  }

  return { ip: '0.0.0.0' };
});
