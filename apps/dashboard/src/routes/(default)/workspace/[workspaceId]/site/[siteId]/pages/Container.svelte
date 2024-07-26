<script lang="ts">
  import Sortable from 'sortablejs';
  import { onDestroy } from 'svelte';
  import Wrapper from './Wrapper.svelte';

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

<li bind:this={containerEl} id={page.id} class={`${page.name}`}>
  {#each page.children as child, index (child.id)}
    <Wrapper {onDragEnd} page={child} selectedPageIndexPath={[...selectedPageIndexPath, index]} {setSelectedPage} />
  {/each}
</li>
