import * as aws from '@pulumi/aws';
import { zones } from '$aws/route53';

// spell-checker:words sesv2

const configurationSet = new aws.sesv2.ConfigurationSet('rdbl.io', {
  configurationSetName: 'rdbl_io',
});

const emailIdentity = new aws.sesv2.EmailIdentity('rdbl.io', {
  emailIdentity: 'rdbl.io',
  configurationSetName: configurationSet.configurationSetName,
});

new aws.sesv2.EmailIdentityMailFromAttributes('rdbl.io', {
  emailIdentity: emailIdentity.id,
  mailFromDomain: 'mail.rdbl.io',
});

emailIdentity.dkimSigningAttributes.tokens.apply((tokens) => {
  for (const token of tokens) {
    new aws.route53.Record(`${token}._domainkey.rdbl.io`, {
      zoneId: zones.rdbl_io.zoneId,
      type: 'CNAME',
      name: `${token}._domainkey.rdbl.io`,
      records: [`${token}.dkim.amazonses.com`],
      ttl: 300,
    });
  }
});

new aws.route53.Record('mail.rdbl.io|mx', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'MX',
  name: 'mail.rdbl.io',
  records: ['10 feedback-smtp.ap-northeast-2.amazonses.com'],
  ttl: 300,
});

new aws.route53.Record('mail.rdbl.io|txt', {
  zoneId: zones.rdbl_io.zoneId,
  type: 'TXT',
  name: 'mail.rdbl.io',
  records: ['v=spf1 include:amazonses.com ~all'],
  ttl: 300,
});
