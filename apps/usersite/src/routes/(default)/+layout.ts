import type { DefaultLayout_Query_Variables } from './$graphql';

export const _DefaultLayout_Query_Variables: DefaultLayout_Query_Variables = (event) => ({
  searchQuery: event.url.searchParams.get('q') || '',
});

export const _DefaultLayout_Query_Extensions = { cache: true };

// export const _DefaultLayout_Query_AfterLoad: DefaultLayout_Query_AfterLoad = (query, event) => {
//   if (!event.data.hostnameOverride && query.publicSite.url !== event.url.origin) {
//     event.setHeaders({
//       'Cache-Control': 'no-store',
//     });

//     redirect(
//       301,
//       new URL(`${event.url.pathname}${event.url.search}${event.url.hash}`, query.publicSite.url).toString(),
//     );
//   }
// };
