// spell-checker:ignore mcsv

import * as aws from '@pulumi/aws';

const createZone = (domain: string) => {
  return new aws.route53.Zone(domain, {
    name: domain,
  });
};

export const zones = {
  rdbl_io: createZone('rdbl.io'),
  rdbl_app: createZone('rdbl.app'),
  rdbl_ninja: createZone('rdbl.ninja'),
};

new aws.route53.Record('rdbl.io|txt', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'TXT',
  name: 'rdbl.io',
  records: [
    // spell-checker:disable-next-line
    'google-site-verification=zd13JhTsjRQJRm_gF8hI8Z28-sRjHL8PUJ5kAFDFrq0',
    'v=spf1 include:mail.stibee.com ~all',
  ],
  ttl: 300,
});

new aws.route53.Record('rdbl.io|mx', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'MX',
  name: 'rdbl.io',
  records: ['1 smtp.google.com'],
  ttl: 300,
});

new aws.route53.Record('stb._domainkey.rdbl.io', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'CNAME',
  name: 'stb._domainkey.rdbl.io',
  records: ['dkim.stibee.com'],
  ttl: 300,
});
