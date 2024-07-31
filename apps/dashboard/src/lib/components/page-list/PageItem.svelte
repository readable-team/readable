<script generics="T extends PageData" lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Chip, Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import { page } from '$app/stores';
  import PageList from './PageList.svelte';
  import type { ComponentProps } from 'svelte';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import type { PageData } from './types';

  type $$Props = {
    depth: number;
    item: T;
    openState: Record<string, boolean>;
    onPointerDown: (e: PointerEvent, item: T) => void;
    registerNode: (node: HTMLElement, item: T) => void;
  } & Omit<ComponentProps<PageList<T>>, 'depth' | 'items' | 'openState' | 'parent'>;

  export let depth: number;
  export let item: T;
  export let openState: Record<string, boolean>;
  export let onPointerDown: (e: PointerEvent, item: T) => void;
  export let registerNode: (node: HTMLElement, item: T) => void;
  export let getPageUrl: (pageId: string) => string;

  let elem: HTMLElement;

  onMount(() => {
    registerNode(elem, item);
  });

  let childrenListProps: ComponentProps<PageList<T>>;
  $: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { item, onPointerDown, ...rest } = $$props as $$Props;

    childrenListProps = {
      ...rest,
      depth: depth + 1,
      items: item.children as T[],
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
        height: '36px',
        alignItems: 'center',
      }),
    )}
  >
    <a
      class={flex({
        width: 'full',
        height: '34px',
        paddingX: '6px',
        flex: '1',
        alignItems: 'center',
        gap: '6px',
        color: 'text.secondary',
        _hover: {
          borderRadius: '6px',
          backgroundColor: 'neutral.10',
        },
        _selected: {
          borderRadius: '6px',
          backgroundColor: 'accent.10',
          color: 'text.accent',
        },
      })}
      aria-selected={item.id === $page.params.pageId ? 'true' : 'false'}
      draggable="false"
      href={getPageUrl(item.id)}
      role="tab"
    >
      <!-- NOTE: depth 0부터 최대 3 -->
      {#if depth < 3}
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
          on:click={(e) => {
            e.preventDefault();
            openState[item.id] = !openState[item.id];
          }}
        >
          <Icon icon={openState[item.id] ? ChevronDownIcon : ChevronRightIcon} size={16} />
        </button>
      {/if}
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
        <!-- FIXME: 제목을 표시해야 함 -->
        {item.id}
      </span>
      <button
        class={css({
          color: 'neutral.50',
        })}
        type="button"
      >
        <Icon icon={EllipsisIcon} size={16} />
      </button>
    </a>
  </div>

  {#if openState[item.id]}
    <PageList {...childrenListProps} />
  {/if}
</li>
