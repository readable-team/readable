<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import Sortable from 'sortablejs';
  import { onDestroy } from 'svelte';
  import Container from './Container.svelte';

  export let page;
  export let selectedPageIndexPath: number[];
  export let setSelectedPage;
  export let onDragEnd;

  let containerEl: HTMLElement;
  let sortable: Sortable;

  let sortableOptions: Sortable.Options = {
    group: 'nested',
    scroll: true,
    animation: 150,
    delay: 0,
    forceAutoScrollFallback: true,
    bubbleScroll: true,
    fallbackOnBody: true,
    invertSwap: true,
    swapThreshold: 0.65,
    forceFallback: true,
    onEnd: (evt) => {
      if (evt.newIndex === undefined || evt.oldIndex === undefined) return;

      setSelectedPage(selectedPageIndexPath);
      onDragEnd(evt.to.id, evt.oldIndex, evt.newIndex);
    },
  };

  $: if (containerEl) {
    new Sortable(containerEl, sortableOptions);
  }

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });
</script>

<ul
  bind:this={containerEl}
  id={page.id}
  class={cx(`${page.name}`, css({ marginY: '5px', borderWidth: '1px', padding: '15px', userSelect: 'none' }))}
>
  id: {page.name}
  <Container {onDragEnd} {page} {selectedPageIndexPath} {setSelectedPage} />
</ul>
