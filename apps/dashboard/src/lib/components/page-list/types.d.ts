// FIXME: 서버에서 쓰는 타입 받아오기?
export type PageData = {
  id: string;
  text: string;
  parentId: string | null;
  children?: PageData[];
  order: string;
  open: boolean;
  state: 'DRAFT' | 'IDK' | 'FIXME';
};

export type VirtualRootPageData = {
  id: 'root';
  children: PageData[];
};
