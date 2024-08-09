import * as cloudflare from '@pulumi/cloudflare';
import { account } from '$cloudflare/account';

const createZone = (domain: string) => {
  const zone = new cloudflare.Zone(domain, {
    accountId: account.id,
    zone: domain,
  });

  new cloudflare.ZoneSettingsOverride(domain, {
    zoneId: zone.id,
    settings: {
      // SSL/TLS - Overview
      ssl: 'strict',

      // SSL/TLS - Edge Certificates
      alwaysUseHttps: 'on',
      automaticHttpsRewrites: 'on',
      securityHeader: {
        enabled: true,
        maxAge: 15_552_000,
        includeSubdomains: true,
        preload: true,
        nosniff: true,
      },

      // Speed - Optimization - Content Optimization
      earlyHints: 'on',
      rocketLoader: 'on',

      // Speed - Optimization - Protocol Optimization
      http3: 'on',
      zeroRtt: 'on',

      // Caching - Configuration
      browserCacheTtl: 0,
    },
  });

  new cloudflare.Argo(domain, {
    zoneId: zone.id,
    smartRouting: 'on',
  });

  new cloudflare.TieredCache(domain, {
    zoneId: zone.id,
    cacheType: 'smart',
  });

  return zone;
};

export const zones = {
  rdbl_io: createZone('rdbl.io'),
  rdbl_ninja: createZone('rdbl.ninja'),
  rdbl_app: createZone('rdbl.app'),
};
