import IPAddr from 'ipaddr.js';
import * as R from 'remeda';
import type { Server } from 'bun';

export const getClientAddress = (request: Request, server: Server) => {
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
      return ip.toString();
    }
  }

  const ip = server.requestIP(request)?.address;
  if (ip) {
    return IPAddr.process(ip).toString();
  }

  return '0.0.0.0';
};
