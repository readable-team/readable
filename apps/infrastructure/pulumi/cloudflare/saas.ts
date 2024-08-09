import * as cloudflare from '@pulumi/cloudflare';
import { zones } from '$cloudflare/zone';

new cloudflare.CustomHostnameFallbackOrigin('rdbl.io', {
  zoneId: zones.rdbl_io.id,
  origin: 'usersite.rdbl.io',
});

new cloudflare.CustomHostnameFallbackOrigin('rdbl.ninja', {
  zoneId: zones.rdbl_ninja.id,
  origin: 'usersite.rdbl.ninja',
});

new cloudflare.Record('cname.rdbl.io|cname', {
  zoneId: zones.rdbl_io.id,
  type: 'CNAME',
  name: 'cname.rdbl.io',
  value: 'usersite.rdbl.io',
  proxied: true,
});

new cloudflare.Record('cname.rdbl.ninja|cname', {
  zoneId: zones.rdbl_ninja.id,
  type: 'CNAME',
  name: 'cname.rdbl.ninja',
  value: 'usersite.rdbl.ninja',
  proxied: true,
});
