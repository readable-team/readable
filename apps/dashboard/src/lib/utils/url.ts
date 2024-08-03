type PartialPageSpec = {
  slug: string;

  content: {
    title: string;
  };
};

export const buildPageFullSlug = (page: PartialPageSpec): string =>
  `${page.slug}-${encodeURIComponent(page.content.title)}`;
