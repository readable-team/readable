type PageUrlSpec = {
  slug: string;

  parent?: {
    slug: string;
  } | null;

  category: {
    slug: string;
  };
};

type PageUrlFragment = {
  ' $$_PageUrl_publicPage'?: never;
};

export const pageUrl = (page: PageUrlFragment) => {
  const spec = page as PageUrlSpec;
  const fragments = [spec.category.slug, spec.parent?.slug, spec.slug].filter(Boolean);
  return `/${fragments.join('/')}`;
};
