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
  // spell-checker:disable-next-line
  records: ['google-site-verification=aVWE05YPOxEGxeH-X5NRyfb_IYilB3KL7QlN-xkFrU0'],
  ttl: 300,
});

new aws.route53.Record('send.rdbl.io|mx', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'MX',
  name: 'send.rdbl.io',
  records: ['10 feedback-smtp.ap-northeast-1.amazonses.com'],
  ttl: 300,
});

new aws.route53.Record('send.rdbl.io|txt', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'TXT',
  name: 'send.rdbl.io',
  records: ['v=spf1 include:amazonses.com ~all'],
  ttl: 300,
});

new aws.route53.Record('resend._domainkey.rdbl.io|txt', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'TXT',
  name: 'resend._domainkey.rdbl.io',
  records: [
    'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1hPa7ndwo7BhmgN9gwGU/a2o2vQWl8OP5Lv/5hZmffMzi+dU5KBfMtZGhW7jvRkjF7NVo515hpZcZS4pQuViTOeUOfrPaZtVeHDWlIXqXCj0uncyAaGPx85B0uOz/fgTOjfK3SKas9oR83aM8y07WsHi20twTnON10g5ups3+EwIDAQAB',
  ],
  ttl: 300,
});
