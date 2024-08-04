type PageUrlSpec = {
  slug: string;

  content: {
    title: string;
  };
};

export const pageUrl = (spec: PageUrlSpec) => `/ko/${spec.slug}-${encodeURIComponent(spec.content.title)}`;
