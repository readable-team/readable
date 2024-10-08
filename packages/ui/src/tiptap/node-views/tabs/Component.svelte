<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  export let getPos: NodeViewProps['getPos'];
  // export let updateAttributes: NodeViewProps['updateAttributes'];

  let selectedTabIdx = 0;

  const getTabs = (node: NodeViewProps['node']) => {
    const tabs: string[] = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    node.forEach((node) => {
      tabs.push(node.attrs.title);
    });
    return tabs;
  };

  $: tabs = getTabs(node);
</script>

<NodeView>
  <div class={flex({ align: 'center', gap: '4px', borderWidth: '1px' })} contenteditable="false">
    {#each tabs as tab, i (i)}
      <button
        class={css(
          { borderWidth: '1px', paddingX: '4px', paddingY: '2px' },
          i === selectedTabIdx && { backgroundColor: 'accent.50' },
        )}
        type="button"
        on:click={() => {
          editor
            ?.chain()
            .setNodeSelection(getPos() + 1)
            .selectTab(i)
            .run();
          selectedTabIdx = i;
        }}
      >
        {tab}
      </button>
    {/each}

    <button
      type="button"
      on:click={() => {
        editor
          ?.chain()
          .setNodeSelection(getPos() + 1)
          .addTab()
          .run();
      }}
    >
      +
    </button>
  </div>

  <div
    class={css({
      'borderWidth': '1px',
      '&:not(:has([data-tab-selected])) [role="tabpanel"]:first-child': { display: 'block' },
      '& [role="tabpanel"][data-tab-selected]': { display: 'block' },
    })}
  >
    <NodeViewContentEditable />
  </div>
</NodeView>
