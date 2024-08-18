import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db, first, SiteCustomDomains } from '@/db';
import { SiteCustomDomainState } from '@/enums';
import { env } from '@/env';

export const caddy = new Hono().basePath('/caddy');

caddy.get('/tls', async (c) => {
  const domain = c.req.query('domain');
  if (!domain) {
    return c.text('', 400);
  }

  if (domain === env.USERSITE_CNAME_HOST) {
    return c.text('', 200);
  }

  const siteCustomDomain = await db
    .select({ id: SiteCustomDomains.id })
    .from(SiteCustomDomains)
    .where(and(eq(SiteCustomDomains.domain, domain), eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE)))
    .then(first);

  if (!siteCustomDomain) {
    return c.text('', 412);
  }

  return c.text('', 200);
});
