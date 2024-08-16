export type SectionData = {
  __typename: 'Section';
  id: string;
  name: string;
  order: string;
  pages: PageData[];
};

export type PageData = {
  __typename: 'Page';
  id: string;
  section: {
    id: string;
  };
  order: string;
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
  __typename: 'VirtualRootPage';
  id: null;
  sections: SectionData[];
};
