<script generics="T extends PageData" lang="ts">
  import { css, cva, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import PlusIcon from '~icons/lucide/plus';
  import PageItem from './PageItem.svelte';
  import type { PageData, VirtualRootPageData } from './types';

  type DraggingState = {
    item: T;
    elem: HTMLElement;
    ghost: HTMLElement;
    event: PointerEvent;
    pointerId: number;
  };

  type DropTarget = {
    list: HTMLElement;
    parentId: string | null;
    indicatorPosition: number;
    targetElem: HTMLElement | null;
  };

  export let depth = 0;
  export let items: T[] = [];
  export let openState: Record<string, boolean> = {};
  export let parent: T | null = null;
  export let onDrop: (target: {
    pageId: string;
    parentId: string | null;
    previousOrder?: string;
    nextOrder?: string;
  }) => Promise<boolean>;
  export let onCancel: ((item: T) => void) | undefined = undefined;
  export let onCreate: (parentId: string | null) => Promise<void>;
  export let getPageUrl: (pageId: string) => string;
  export let indicatorElem: HTMLElement | null = null;
  export let nodeMap = new Map<HTMLElement, T | VirtualRootPageData>();
  export let registerNode = (node: HTMLElement, item: T | VirtualRootPageData) => {
    nodeMap.set(node, item);
  };
  let listElem: HTMLElement;
  let dragging: DraggingState | null = null;
  let dropTarget: DropTarget | null = null;

  onMount(() => {
    if (parent) {
      registerNode(listElem, parent);
    } else {
      registerNode(listElem, { id: null, children: items });
    }
  });

  // ESC로 드래그 취소
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dragging) {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      dragging.elem.releasePointerCapture(dragging.pointerId);

      onCancel?.(dragging.item);

      dragging.ghost.remove();
      dragging = null;
      dropTarget = null;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      indicatorElem!.style.display = 'none';
    }
  });

  function createGhost(draggingItem: HTMLElement) {
    const clone = draggingItem.cloneNode(true) as HTMLElement;
    const originalRect = draggingItem.getBoundingClientRect();
    clone.style.position = 'fixed';
    clone.style.zIndex = '1000';
    clone.style.left = `${originalRect.left}px`;
    clone.style.top = `${originalRect.top}px`;
    clone.style.width = `${originalRect.width}px`;
    clone.style.height = `${originalRect.height}px`;
    clone.style.filter = 'brightness(0.5)';
    clone.style.pointerEvents = 'none';
    clone.style.display = 'none';
    document.body.append(clone);

    return clone;
  }

  function updateGhostPosition(dragging: DraggingState, event: PointerEvent) {
    const draggingElemRect = dragging.elem.getBoundingClientRect();
    const offsetX = dragging.event.clientX - draggingElemRect.left;
    const offsetY = dragging.event.clientY - draggingElemRect.top;
    dragging.ghost.style.left = `${event.clientX - offsetX}px`;
    dragging.ghost.style.top = `${event.clientY - offsetY}px`;

    dragging.ghost.style.display = 'block';
    dragging.ghost.style.opacity = dropTarget?.targetElem && dropTarget.targetElem !== dragging.elem ? '0.25' : '0.35';
  }

  function isTargetItself(dropTarget: DropTarget, dragging: DraggingState, ignoreAboveLine = false) {
    const draggingItemPosition = items.findIndex((item) => item.id === dragging.item.id);

    const isSelectionItself = dropTarget.targetElem && dropTarget.targetElem === dragging.elem;
    const isAboveLineIndicatingItself = !dropTarget.targetElem && dropTarget.indicatorPosition === draggingItemPosition;
    const isBelowLineIndicatingItself =
      !dropTarget.targetElem && dropTarget.indicatorPosition === draggingItemPosition + 1;

    return (
      dropTarget &&
      dropTarget.list === listElem && // 같은 리스트
      (isSelectionItself || // selection indicator
        isBelowLineIndicatingItself || // line indicator (아래)
        (!ignoreAboveLine && isAboveLineIndicatingItself)) // line indicator (위)
    );
  }

  function updateIndicatorPosition(dragging: DraggingState, dropTarget: DropTarget) {
    if (!indicatorElem) {
      return;
    }

    // 제자리 바로 위에도 line indicator 표시함
    if (isTargetItself(dropTarget, dragging, true)) {
      indicatorElem.style.display = 'none';
      return;
    }

    indicatorElem.style.display = 'block';
    indicatorElem.style.left = `${dropTarget.list.getBoundingClientRect().left}px`;
    indicatorElem.style.width = `${dropTarget.list.getBoundingClientRect().width}px`;

    // 드롭 타겟 리스트 내 직계 자식 엘리먼트들
    const childrenElems = dropTarget.list.querySelectorAll(':scope > .dnd-item');

    if (childrenElems.length === 0) {
      // 리스트가 비어있는 경우 맨 위에 indicator를 표시
      indicatorElem.style.top = `${dropTarget.list.getBoundingClientRect().top}px`;
    } else if (dropTarget.indicatorPosition < childrenElems.length) {
      if (dropTarget.indicatorPosition > 0 && childrenElems.length > 1 && !dropTarget.targetElem) {
        // 아이템 사이에 indicator를 표시
        const previousBottom = childrenElems[dropTarget.indicatorPosition - 1].getBoundingClientRect().bottom;
        const nextTop = childrenElems[dropTarget.indicatorPosition].getBoundingClientRect().top;

        indicatorElem.style.top = `${(previousBottom + nextTop) / 2}px`;
      } else {
        // 아이템 위에 indicator를 표시
        indicatorElem.style.top = `${childrenElems[dropTarget.indicatorPosition].getBoundingClientRect().top}px`;
      }
    } else {
      // 마지막 아이템인 경우 그 아래에 indicator를 표시
      // NOTE: at(-1)로 고치면 에러 발생함
      // eslint-disable-next-line unicorn/prefer-at
      indicatorElem.style.top = `${childrenElems[childrenElems.length - 1].getBoundingClientRect().bottom}px`;
    }

    if (dropTarget.targetElem) {
      indicatorElem.style.height = `${dropTarget.targetElem.getBoundingClientRect().height}px`;
      indicatorElem.style.opacity = '0.4';
    } else {
      indicatorElem.style.height = '2px';
      indicatorElem.style.opacity = '1';
    }
  }

  const onPointerDown = (event: PointerEvent, item: T) => {
    const draggingItemElem = (event.target as HTMLElement).closest('.dnd-item') as HTMLElement;
    const pointerTargetList = draggingItemElem?.closest('.dnd-list') as HTMLElement;

    // 하위 리스트에서 발생한 이벤트는 무시
    if (listElem !== pointerTargetList) {
      return;
    }

    dragging = {
      item,
      elem: draggingItemElem,
      event,
      ghost: createGhost(draggingItemElem),
      pointerId: event.pointerId,
    };

    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onPointerUp = async (event: PointerEvent) => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    if (!dragging) {
      return;
    }

    if (dragging.item.id === null) {
      throw new Error('Wrong implementation: Root item cannot be dragged');
    }

    if (dropTarget) {
      if (isTargetItself(dropTarget, dragging)) {
        onCancel?.(dragging.item);
      } else {
        if (dropTarget.targetElem && dragging.elem !== dropTarget.targetElem) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const targetItem = nodeMap.get(dropTarget.targetElem)!;

          const success = await onDrop({
            pageId: dragging.item.id,
            parentId: targetItem.id,
            // 맨 앞에 추가
            nextOrder: targetItem.children ? targetItem.children[0]?.order : undefined,
          });

          if (success && targetItem.id !== null) {
            openState[targetItem.id] = true;
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const targetItem = nodeMap.get(dropTarget.list)!;
          let nextOrder;
          let previousOrder;

          if (dropTarget.indicatorPosition === 0 || !targetItem.children || targetItem.children.length === 0) {
            // 맨 앞
            nextOrder = targetItem.children ? targetItem.children[0]?.order : undefined;
          } else if (dropTarget.indicatorPosition === targetItem.children.length) {
            // 맨 뒤
            previousOrder = targetItem.children.at(-1)?.order;
          } else {
            // 중간
            previousOrder = targetItem.children[dropTarget.indicatorPosition - 1]?.order;
            nextOrder = targetItem.children[dropTarget.indicatorPosition]?.order;
          }

          onDrop({
            pageId: dragging.item.id,
            parentId: targetItem.id,
            previousOrder,
            nextOrder,
          });
        }
      }
    }

    dragging.elem.releasePointerCapture(dragging.pointerId);

    dragging?.ghost.remove();
    dragging = null;
    dropTarget = null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    indicatorElem!.style.display = 'none';
  };

  const onPointerMove = async (event: PointerEvent) => {
    if (!dragging) {
      return;
    }

    updateGhostPosition(dragging, event);

    let pointerTargetList = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('.dnd-list');

    if (!pointerTargetList) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let pointerTargetListParentId = nodeMap.get(pointerTargetList)!.id;

    const isDropTargetDescendant = pointerTargetList && dragging.elem.contains(pointerTargetList);
    const isValidDropTarget = pointerTargetList && !isDropTargetDescendant;

    if (!isValidDropTarget) {
      dropTarget = null;
      return;
    }

    let indicatorPositionDraft = null;
    let targetElemDraft = null;

    // 드롭 타겟 리스트 내 포인터의 y 좌표
    const pointerTopInList = event.clientY - pointerTargetList.getBoundingClientRect().top;

    // 드롭 타겟 리스트 내 직계 자식 엘리먼트들
    const childrenElems = pointerTargetList.querySelectorAll<HTMLElement>(':scope > .dnd-item');
    const childrenItems = [...childrenElems].map((elem) => nodeMap.get(elem));

    // 포인터가 위치한 자식 엘리먼트의 인덱스로 indicator 위치를 결정
    for (const [i, child] of childrenElems.entries()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childRect = child.querySelector(':scope > .dnd-item-body')!.getBoundingClientRect();
      const childTop = childRect.top - pointerTargetList.getBoundingClientRect().top;

      const item = childrenItems[i] as PageData;

      // 1/4 지점보다 위에 있으면 그 앞에 indicator를 표시
      if (pointerTopInList < childTop + childRect.height / 4) {
        indicatorPositionDraft = i;
        break;
      } else if (pointerTopInList < childTop + (childRect.height / 4) * 3) {
        // 1/4 지점 ~ 3/4 지점 사이에 있으면 indicator를 item 위에 표시
        indicatorPositionDraft = i;
        targetElemDraft = child;
        break;
      } else if (pointerTopInList < childTop + childRect.height && openState[item.id] && dragging.item.id !== item.id) {
        // 3/4 지점보다 아래에 있고 children list가 열려있고 현재 드래그 중인 아이템이 아닌 경우
        pointerTargetList = child.querySelector('.dnd-list') as HTMLElement;
        pointerTargetListParentId = item.id;
        indicatorPositionDraft = 0;
        break;
      }
    }

    if (indicatorPositionDraft === null) {
      // 마지막 아이템인 경우 그 아래에 indicator를 표시
      indicatorPositionDraft = childrenElems.length;
    }

    dropTarget = {
      list: pointerTargetList,
      parentId: pointerTargetListParentId || null,
      indicatorPosition: indicatorPositionDraft,
      targetElem: targetElemDraft,
    };

    updateIndicatorPosition(dragging, dropTarget as DropTarget);
  };

  $: itemCommonProps = {
    depth,
    getPageUrl,
    indicatorElem,
    nodeMap,
    onCancel,
    onCreate,
    onDrop,
    onPointerDown,
    openState,
    registerNode,
  };
</script>

<ul
  bind:this={listElem}
  class={cx(
    'dnd-list',
    flex({
      userSelect: 'none',
      flexDirection: 'column',
    }),
    css(
      cva({
        base: {},
        variants: {
          root: {
            true: {
              gap: '32px',
            },
            false: {
              marginLeft: '12px',
            },
          },
        },
      }).raw({ root: parent === null }),
    ),
  )}
  role="group"
>
  {#if parent === null}
    <div
      bind:this={indicatorElem}
      class={cx(
        'dnd-list-indicator',
        css({
          position: 'fixed',
          zIndex: '100',
          top: '0',
          left: '0',
          width: 'full',
          height: '2px',
          backgroundColor: 'accent.40',
          display: 'none',
          pointerEvents: 'none',
        }),
      )}
    />
  {/if}
  {#if items && items.length > 0}
    {#each items as item (item.id)}
      <PageItem {...itemCommonProps} {item} />
    {/each}
  {/if}
  <button
    class={css({
      height: '32px',
      alignItems: 'center',
    })}
    aria-selected="false"
    role="treeitem"
    type="button"
    on:click={() => onCreate(parent?.id ?? null)}
  >
    <div
      class={flex({
        flex: '1',
        height: '30px',
        paddingX: '6px',
        gap: '6px',
        alignItems: 'center',
        color: 'text.secondary',
        _hover: {
          borderRadius: '6px',
          backgroundColor: 'neutral.10',
        },
        _active: {
          borderRadius: '6px',
          backgroundColor: 'accent.10',
          color: 'text.accent',
        },
      })}
    >
      <Icon
        style={css.raw({
          color: 'neutral.50',
        })}
        icon={PlusIcon}
        size={16}
      ></Icon>
      <span
        class={css({
          color: 'text.tertiary',
          textStyle: '15m',
          fontStyle: 'italic',
        })}
      >
        새 페이지 추가
      </span>
    </div>
  </button>
</ul>
