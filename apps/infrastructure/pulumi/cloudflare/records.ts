import * as cloudflare from '@pulumi/cloudflare';
import { zones } from '$cloudflare/zone';

new cloudflare.Record('send.rdbl.io|mx', {
  zoneId: zones.rdbl_io.id,
  type: 'MX',
  name: 'send.rdbl.io',
  value: 'feedback-smtp.ap-northeast-1.amazonses.com',
  priority: 10,
  comment: 'Resend',
});

new cloudflare.Record('send.rdbl.io|txt', {
  zoneId: zones.rdbl_io.id,
  type: 'TXT',
  name: 'send.rdbl.io',
  value: 'v=spf1 include:amazonses.com ~all',
  comment: 'Resend',
});

new cloudflare.Record('resend._domainkey.rdbl.io|txt', {
  zoneId: zones.rdbl_io.id,
  type: 'TXT',
  name: 'resend._domainkey.rdbl.io',
  value:
    'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1hPa7ndwo7BhmgN9gwGU/a2o2vQWl8OP5Lv/5hZmffMzi+dU5KBfMtZGhW7jvRkjF7NVo515hpZcZS4pQuViTOeUOfrPaZtVeHDWlIXqXCj0uncyAaGPx85B0uOz/fgTOjfK3SKas9oR83aM8y07WsHi20twTnON10g5ups3+EwIDAQAB',
  comment: 'Resend',
});

new cloudflare.Record('_dmarc.rdbl.io|txt', {
  zoneId: zones.rdbl_io.id,
  type: 'TXT',
  name: '_dmarc.rdbl.io',
  value: 'v=DMARC1; p=none;',
  comment: 'Resend',
});
