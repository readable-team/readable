<script lang="ts">
  import Wrapper from './Wrapper.svelte';

  type Page = {
    id: string;
    name: string;
    children: Page[];
  };

  let pages: Page[] = [
    {
      id: 'root',
      name: 'root',
      children: [
        { id: 'page1', name: 'page1', children: [] },
        {
          id: 'page2',
          name: 'page2',
          children: [
            { id: 'child1', name: 'child1', children: [{ id: 'grandchild1', name: 'grandchild1', children: [] }] },
            { id: 'child2', name: 'child2', children: [{ id: 'grandchild2', name: 'grandchild2', children: [] }] },
          ],
        },
        { id: 'page3', name: 'page3', children: [] },
      ],
    },
  ];

  let selectedPageIndexPath: number[] = [0];

  const setSelectedPage = (indexPath: number[]) => {
    selectedPageIndexPath = indexPath;
  };

  const removePageByIndexPath = (selectedPageIndexPath: number[], oldIndex: number) => {
    if (selectedPageIndexPath.length === 0) return;

    let current = pages;

    for (const element of selectedPageIndexPath) {
      current = current[element].children;
    }

    const removedItems = current.splice(oldIndex, 1);

    return removedItems.length > 0 ? removedItems[0] : undefined;
  };

  const findPageById = (pages: Page[], id: string): Page | undefined => {
    for (const page of pages) {
      if (page.id === id) {
        return page;
      }

      const found = findPageById(page.children, id);
      if (found) {
        return found;
      }
    }

    return undefined;
  };

  const movePageToNewPosition = (parentId: string, item: Page, pos: number) => {
    const parent = findPageById(pages, parentId);

    if (parent) {
      parent.children.splice(pos, 0, item);
    }
  };

  const onDragEnd = (parentId: string, oldIndex: number, pos: number) => {
    if (!selectedPageIndexPath) return;

    const item = removePageByIndexPath(selectedPageIndexPath, oldIndex);

    if (item) {
      movePageToNewPosition(parentId, item, pos);
    }

    pages = pages;
    selectedPageIndexPath = [0];
  };
</script>

<Wrapper {onDragEnd} page={pages[0]} {setSelectedPage} bind:selectedPageIndexPath />
