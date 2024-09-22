type PageUrlSpec = {
  slug: string;

  parent?: {
    slug: string;
  } | null;

  category: {
    slug: string;
  };

  site: {
    url: string;
  };
};

export const pageUrl = (spec: PageUrlSpec) => {
  const fragments = [spec.category.slug, spec.parent?.slug, spec.slug].filter(Boolean);
  return `${spec.site.url}/${fragments.join('/')}`;
};
