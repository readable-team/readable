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
    'google-site-verification=aVWE05YPOxEGxeH-X5NRyfb_IYilB3KL7QlN-xkFrU0',
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

new aws.route53.Record('k2._domainkey.rdbl.io', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'CNAME',
  name: 'k2._domainkey.rdbl.io',
  records: ['dkim2.mcsv.net'],
  ttl: 300,
});

new aws.route53.Record('k3._domainkey.rdbl.io', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'CNAME',
  name: 'k3._domainkey.rdbl.io',
  records: ['dkim3.mcsv.net'],
  ttl: 300,
});
