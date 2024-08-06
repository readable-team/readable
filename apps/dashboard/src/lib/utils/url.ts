type PartialPageSpec = {
  slug: string;

  content: {
    title: string;
  };

  site: {
    url: string;
  };
};

export const pageUrl = (page: PartialPageSpec): string =>
  `${page.site.url}/ko/${page.slug}-${encodeURIComponent(page.content.title)}`;
