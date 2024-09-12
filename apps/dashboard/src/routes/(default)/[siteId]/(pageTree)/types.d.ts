export type CategoryData = {
  __typename: 'Category';
  id: string;
  name: string;
  order: string;
  pages: PageData[];
  editing?: boolean; // 카테고리 이름 편집 중 여부
};

export type PageData = {
  __typename: 'Page';
  id: string;
  category: {
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
  categories: CategoryData[];
};
