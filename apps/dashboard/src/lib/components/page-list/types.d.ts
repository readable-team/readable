export type PageData = {
  id: string;
  order: string;
  slug: string;
  content: {
    title: string;
  };
  parent?:
    | {
        id: string;
      }
    | undefined
    | null;
  state: 'DELETED' | 'DRAFT' | 'PUBLISHED';
  children?: PageData[];
};

export type VirtualRootPageData = {
  id: null;
  children: PageData[];
};
