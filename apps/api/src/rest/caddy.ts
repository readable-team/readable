import { and, eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { db, first, SiteCustomDomains } from '@/db';
import { SiteCustomDomainState } from '@/enums';
import { env } from '@/env';

export const caddy = new Elysia({ prefix: '/caddy' });

caddy.get('/tls', async ({ query, error }) => {
  const domain = query['domain'];
  if (!domain) {
    return error(400);
  }

  if (domain === env.USERSITE_CNAME_HOST) {
    return '';
  }

  const siteCustomDomain = await db
    .select({ id: SiteCustomDomains.id })
    .from(SiteCustomDomains)
    .where(and(eq(SiteCustomDomains.domain, domain), eq(SiteCustomDomains.state, SiteCustomDomainState.ACTIVE)))
    .then(first);

  if (!siteCustomDomain) {
    return error(412);
  }

  return '';
});
