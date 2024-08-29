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
