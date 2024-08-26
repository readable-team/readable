<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Menu, MenuItem } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import DotIcon from '~icons/lucide/dot';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { invokeAlert } from '$lib/components/invoke-alert';
  import { maxDepth } from './const';
  import PageList from './PageList.svelte';
  import type { ComponentProps } from 'svelte';
  import type { CategoryData, PageData } from './types';

  type $$Props = {
    depth: number;
    item: PageData | CategoryData;
    openState: Record<string, boolean>;
    onPointerDown: (e: PointerEvent, item: PageData | CategoryData) => void;
    registerNode: (node: HTMLElement, item: (PageData | CategoryData) & { depth: number }) => void;
  } & Omit<ComponentProps<PageList>, 'depth' | 'items' | 'openState' | 'parent'>;

  export let depth: number;
  export let item: PageData | CategoryData;
  export let openState: Record<string, boolean>;
  export let onPointerDown: (e: PointerEvent, item: PageData | CategoryData) => void;
  export let registerNode: (node: HTMLElement, item: (PageData | CategoryData) & { depth: number }) => void;
  export let getPageUrl: (page: PageData) => string;

  let elem: HTMLElement;

  $: registerNode(elem, {
    ...item,
    depth,
  });

  let childrenListProps: ComponentProps<PageList>;
  $: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { item, onPointerDown, ...rest } = $$props as $$Props;

    childrenListProps = {
      ...rest,
      depth: depth + 1,
      items: item.__typename === 'Category' ? item.pages : (item.children ?? []),
      parent: item,
    };
  }

  const deleteCategory = graphql(`
    mutation PageTree_DeleteCategory_Mutation($input: DeleteCategoryInput!) {
      deleteCategory(input: $input) {
        id
      }
    }
  `);

  const deletePage = graphql(`
    mutation PageTree_DeletePage_Mutation($input: DeletePageInput!) {
      deletePage(input: $input) {
        id
      }
    }
  `);

  const duplicatePage = graphql(`
    mutation PageTree_DuplicatePage_Mutation($input: DuplicatePageInput!) {
      duplicatePage(input: $input) {
        id
      }
    }
  `);
</script>

<li
  bind:this={elem}
  class="dnd-item"
  aria-expanded={openState[item.id] || item.__typename === 'Category' ? 'true' : 'false'}
  aria-selected={item.id === $page.params.pageId ? 'true' : 'false'}
  role="treeitem"
  on:pointerdown={(e) => onPointerDown(e, item)}
>
  <div
    class={cx(
      'dnd-item-body',
      'group',
      flex({
        'alignItems': 'center',
        'borderRadius': '6px',
        'height': '32px',
        'paddingX': '4px',
        'gap': '2px',
        '_hover': {
          backgroundColor: 'neutral.20',
        },
        '&:has(button[aria-expanded=true])': {
          backgroundColor: 'neutral.20',
        },
        '&:has(a[aria-selected=true])': {
          backgroundColor: 'neutral.20',
          color: 'text.primary',
        },
        'paddingLeft': depth === 2 ? '20px' : '4px',
      }),
    )}
  >
    {#if item.__typename !== 'Category'}
      {#if depth < maxDepth}
        <button
          class={css({
            color: 'neutral.50',
            borderRadius: '2px',
            padding: '4px',
            _hover: {
              backgroundColor: 'neutral.30',
            },
          })}
          aria-expanded={openState[item.id] ? 'true' : 'false'}
          type="button"
          on:click={() => {
            openState[item.id] = !openState[item.id];
          }}
        >
          <Icon icon={openState[item.id] ? ChevronDownIcon : ChevronRightIcon} size={14} />
        </button>
      {:else}
        <div class={css({ color: 'neutral.50', padding: '4px' })}>
          <Icon icon={DotIcon} size={14} />
        </div>
      {/if}
    {/if}

    {#if item.__typename === 'Page'}
      <a
        class={flex({
          alignItems: 'center',
          gap: '4px',
          flex: '1',
          color: 'text.secondary',
          width: 'full',
          truncate: true,
          _selected: {
            color: 'text.primary',
          },
        })}
        aria-selected={item.id === $page.params.pageId ? 'true' : 'false'}
        draggable="false"
        href={getPageUrl(item)}
        role="tab"
      >
        {#if item.state === 'DRAFT'}
          <div
            class={flex({
              alignItems: 'center',
              justifyContent: 'center',
              paddingX: '4px',
              paddingY: '2px',
              backgroundColor: 'neutral.30',
              color: 'text.secondary',
              textStyle: '11b',
              borderRadius: '3px',
            })}
          >
            미발행
          </div>
        {/if}
        <span
          class={css({
            truncate: true,
            flex: '1',
            textStyle: '14m',
          })}
        >
          {item.content.title}
        </span>
        <Menu disableAutoUpdate offset={2} placement="bottom-start">
          <div
            slot="button"
            class={css(
              {
                display: 'none',
                _groupHover: {
                  display: 'block',
                },
                borderRadius: '2px',
                padding: '4px',
                color: 'neutral.50',
                _hover: {
                  backgroundColor: 'neutral.30',
                },
              },
              open && { display: 'block' },
            )}
            let:open
          >
            <Icon icon={EllipsisIcon} size={14} />
          </div>
          <MenuItem on:click={() => duplicatePage({ pageId: item.id })}>
            <span>복제</span>
          </MenuItem>
          <MenuItem
            variant="danger"
            on:click={() =>
              invokeAlert({
                title: '페이지 삭제',
                content: '페이지를 삭제하시겠습니까?',
                actionText: '삭제',
                action: () => deletePage({ pageId: item.id }),
              })}
          >
            <span>삭제</span>
          </MenuItem>
        </Menu>
      </a>
    {:else}
      <!-- 섹션 (카테고리) -->
      <div
        class={flex({
          paddingX: '8px',
          paddingY: '4px',
          textStyle: '13b',
          color: 'text.secondary',
          truncate: true,
          flex: '1',
        })}
      >
        {item.name}
      </div>
      <div
        class={flex({
          display: 'none',
          _groupHover: {
            display: 'flex',
          },
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Menu disableAutoUpdate placement="bottom-start">
          <button
            slot="button"
            class={css({
              display: 'none',
              _groupHover: {
                display: 'block',
              },
              borderRadius: '2px',
              padding: '4px',
              color: 'neutral.50',
              _hover: {
                backgroundColor: 'neutral.30',
              },
            })}
            type="button"
          >
            <Icon icon={EllipsisIcon} size={14} />
          </button>
          <MenuItem on:click={() => alert('TODO')}>
            <span>이름 변경</span>
          </MenuItem>
          <MenuItem
            variant="danger"
            on:click={() =>
              invokeAlert({
                title: '카테고리 삭제',
                content: '카테고리를 삭제하시겠습니까?',
                actionText: '삭제',
                action: () => deleteCategory({ categoryId: item.id }),
              })}
          >
            <span>삭제</span>
          </MenuItem>
        </Menu>
      </div>
    {/if}
  </div>

  {#if (openState[item.id] && depth < maxDepth) || item.__typename === 'Category'}
    <PageList {...childrenListProps} />
  {/if}
</li>
