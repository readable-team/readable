import { redirect } from '@sveltejs/kit';
import { ReadableError } from '@/errors';
import type { SiteLayout_Query_OnError, SiteLayout_Query_Variables } from './$graphql';

export const _SiteLayout_Query_Variables: SiteLayout_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
});

export const _SiteLayout_Query_OnError: SiteLayout_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.code === 'forbidden') {
    redirect(302, '/');
  }
};
