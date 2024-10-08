<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import XIcon from '~icons/lucide/x';
  import { Icon } from '../../../components';
  import { getSelectedTabIdx } from './index';
  import type { NodeViewProps } from '@readable/ui/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  // export let selected: NodeViewProps['selected'];
  // export let deleteNode: NodeViewProps['deleteNode'];
  export let getPos: NodeViewProps['getPos'];
  // export let updateAttributes: NodeViewProps['updateAttributes'];

  const getTabs = (editor: NodeViewProps['editor'] | undefined, node: NodeViewProps['node']) => {
    const tabs: { title: string; selected: boolean }[] = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    node.forEach((node, _, index) => {
      const selected = index === (editor ? getSelectedTabIdx(editor.state, getPos()) : 0);
      tabs.push({ title: node.attrs.title, selected });
    });
    return tabs;
  };

  $: tabs = getTabs(editor, node);
</script>

<NodeView>
  <div class={flex({ align: 'center', gap: '4px', borderWidth: '1px' })} contenteditable="false">
    <ul class={css({ display: 'flex', gap: '4px' })} role="tablist">
      {#each tabs as tab, i (i)}
        <li
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              borderWidth: '1px',
              paddingX: '4px',
              paddingY: '2px',
            },
            tab.selected && { backgroundColor: 'accent.50' },
          )}
          role="tab"
          on:keydown={null}
          on:click={() => {
            editor
              ?.chain()
              .setTextSelection(getPos() + 1)
              .selectTab(i)
              .run();
          }}
        >
          <span>
            {tab.title}
          </span>

          <button
            type="button"
            on:click|stopPropagation={() => {
              editor
                ?.chain()
                .setTextSelection(getPos() + 1)
                .deleteTab(i)
                .run();
            }}
          >
            <Icon icon={XIcon} />
          </button>
        </li>
      {/each}
    </ul>

    <button
      type="button"
      on:click={() => {
        editor
          ?.chain()
          .setTextSelection(getPos() + 1)
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
