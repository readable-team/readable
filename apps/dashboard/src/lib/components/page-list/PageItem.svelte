<script lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Chip, Icon } from '@readable/ui/components';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import { page } from '$app/stores';
  import { maxDepth } from './const';
  import PageList from './PageList.svelte';
  import type { ComponentProps } from 'svelte';
  import type { PageData, SectionData } from './types';

  type $$Props = {
    depth: number;
    item: PageData | SectionData;
    openState: Record<string, boolean>;
    onPointerDown: (e: PointerEvent, item: PageData | SectionData) => void;
    registerNode: (node: HTMLElement, item: (PageData | SectionData) & { depth: number }) => void;
  } & Omit<ComponentProps<PageList>, 'depth' | 'items' | 'openState' | 'parent'>;

  export let depth: number;
  export let item: PageData | SectionData;
  export let openState: Record<string, boolean>;
  export let onPointerDown: (e: PointerEvent, item: PageData | SectionData) => void;
  export let registerNode: (node: HTMLElement, item: (PageData | SectionData) & { depth: number }) => void;
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
      items: item.__typename === 'Section' ? item.pages : (item.children ?? []),
      parent: item,
    };
  }
</script>

<li
  bind:this={elem}
  class="dnd-item"
  aria-expanded={openState[item.id] ? 'true' : 'false'}
  aria-selected={item.id === $page.params.pageId ? 'true' : 'false'}
  role="treeitem"
  on:pointerdown={(e) => onPointerDown(e, item)}
>
  <div
    class={cx(
      'dnd-item-body',
      flex({
        'alignItems': 'center',
        'borderRadius': '6px',
        'height': '36px',
        '_hover': {
          backgroundColor: 'surface.secondary',
        },
        '&:has(a[aria-selected=true])': {
          backgroundColor: 'neutral.30',
        },
      }),
    )}
  >
    {#if depth < maxDepth}
      <button
        class={css({
          color: 'neutral.70',
          borderRadius: '2px',
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
        <Icon icon={openState[item.id] ? ChevronDownIcon : ChevronRightIcon} size={16} />
      </button>
    {/if}

    {#if item.__typename === 'Page'}
      <a
        class={flex({
          alignItems: 'center',
          gap: '6px',
          flex: '1',
          paddingX: '6px',
          color: 'text.secondary',
          width: 'full',
          height: '34px',
          truncate: true,
        })}
        aria-selected={item.id === $page.params.pageId ? 'true' : 'false'}
        draggable="false"
        href={getPageUrl(item)}
        role="tab"
      >
        {#if item.state === 'DRAFT'}
          <Chip>초안</Chip>
        {/if}
        <span
          class={css(
            cva({
              base: {
                truncate: true,
                flex: '1',
                textStyle: '15sb',
              },
              variants: {
                root: {
                  true: {
                    color: 'text.primary',
                  },
                },
              },
            }).raw({ root: item.parent?.id === null }),
          )}
        >
          {item.content.title}
        </span>
        <button
          class={css({
            borderRadius: '6px',
            color: 'neutral.50',
            _hover: {
              color: 'neutral.60',
              backgroundColor: 'neutral.40',
            },
          })}
          type="button"
        >
          <Icon icon={EllipsisIcon} size={24} />
        </button>
      </a>
    {:else}
      <!-- TODO -->
      <div>
        섹션명: {item.name}
      </div>
    {/if}
  </div>

  {#if openState[item.id] && depth < maxDepth}
    <PageList {...childrenListProps} />
  {/if}
</li>
