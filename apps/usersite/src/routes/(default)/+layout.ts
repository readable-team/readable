import { redirect } from '@sveltejs/kit';
import type { DefaultLayout_Query_AfterLoad, DefaultLayout_Query_Variables } from './$graphql';
import type { LayoutLoad } from './$types';

export const _DefaultLayout_Query_Variables: DefaultLayout_Query_Variables = ({ url, data }) => ({
  hostname: data.hostnameOverride ?? url.hostname,
});

export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = (query, event) => {
  if (!event.data.hostnameOverride && query.publicSite.url !== event.url.origin) {
    event.setHeaders({
      'Cache-Control': 'no-store',
    });

    redirect(
      301,
      new URL(`${event.url.pathname}${event.url.search}${event.url.hash}`, query.publicSite.url).toString(),
    );
  }
};

export const load: LayoutLoad = async ({ url, data }) => ({
  hostname: data.hostnameOverride ?? url.hostname,
});
