import { redirect } from '@sveltejs/kit';
import { ReadableError } from '@/errors';
import type { SitePageLayout_Query_OnError, SitePageLayout_Query_Variables } from './$graphql';

export const _SitePageLayout_Query_Variables: SitePageLayout_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
});

export const _SitePageLayout_Query_OnError: SitePageLayout_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.message === 'forbidden') {
    redirect(302, `/`);
  }
};
