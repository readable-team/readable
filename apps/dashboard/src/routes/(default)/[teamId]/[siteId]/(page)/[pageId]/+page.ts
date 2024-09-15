import { redirect } from '@sveltejs/kit';
import { ReadableError } from '@/errors';
import type { PagePage_Query_OnError, PagePage_Query_Variables } from './$graphql';

export const _PagePage_Query_Variables: PagePage_Query_Variables = ({ params }) => ({
  siteId: params.siteId,
  pageId: params.pageId,
});

export const _PagePage_Query_OnError: PagePage_Query_OnError = async (error) => {
  if (error instanceof ReadableError && error.message === 'forbidden') {
    redirect(302, '/');
  }
};
