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
