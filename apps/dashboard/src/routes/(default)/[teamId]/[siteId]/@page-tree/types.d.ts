export type CategoryData = {
  __typename: 'Category';
  id: string;
  slug: string;
  name: string;
  order: string;
  pages: PageData[];
  recursivePageCount: number;
  editing?: boolean; // 카테고리 이름 편집 중 여부
};

export type PageData = {
  __typename: 'Page';
  id: string;
  slug: string;
  category: {
    id: string;
    slug: string;
  };
  order: string;
  recursiveChildCount: number;
  title: string;
  parent?:
    | {
        id: string;
        slug: string;
      }
    | undefined
    | null;
  state: 'DELETED' | 'DRAFT' | 'PUBLISHED';
  children?: PageData[];
};

export type VirtualRootPageData = {
  __typename: 'VirtualRootPage';
  id: null;
  categories: CategoryData[];
};
