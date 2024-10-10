<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import PlusIcon from '~icons/lucide/plus';
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

  let renamingTabIdx: number | null = null;
  let renamingTabTitle = '';

  const handleRenameTab = () => {
    if (renamingTabIdx === null) {
      return;
    }

    editor
      ?.chain()
      .setTextSelection(getPos() + 1)
      .renameTab(renamingTabIdx, renamingTabTitle)
      .run();

    renamingTabIdx = null;
    renamingTabTitle = '';
  };
</script>

<NodeView>
  <div class={flex({ align: 'center' })} contenteditable="false">
    <ul class={css({ display: 'flex' })} role="tablist">
      {#each tabs as tab, i (i)}
        <li
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderWidth: '1px',
              borderColor: 'border.primary',
              paddingX: '12px',
              paddingY: '6px',
              backgroundColor: 'neutral.10',
              cursor: 'pointer',
            },
            tab.selected && { backgroundColor: 'neutral.0' },
          )}
          role="tab"
          tabindex={0}
          on:keydown={null}
          on:click={() => {
            if (tab.selected) {
              if (editor?.isEditable) {
                renamingTabIdx = i;
                renamingTabTitle = tab.title;
              }
            } else {
              editor
                ?.chain()
                .setTextSelection(getPos() + 1)
                .selectTab(i)
                .run();
            }
          }}
        >
          {#if renamingTabIdx === i}
            <input
              type="text"
              bind:value={renamingTabTitle}
              on:blur={handleRenameTab}
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameTab();
                }
              }}
            />
          {:else}
            <span>
              {tab.title}
            </span>
          {/if}

          {#if editor?.isEditable}
            <button
              class={center({
                size: '24px',
                borderRadius: '4px',
                color: 'text.secondary',
                _hover: { backgroundColor: 'neutral.20', borderWidth: '1px', borderColor: 'border.primary' },
              })}
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
          {/if}
        </li>
      {/each}
    </ul>

    {#if editor?.isEditable}
      <button
        class={center({
          size: '24px',
          borderRadius: '4px',
          marginLeft: '8px',
          borderWidth: '1px',
          borderColor: 'border.primary',
          backgroundColor: 'neutral.10',
          color: 'text.secondary',
          _hover: { backgroundColor: 'neutral.20' },
        })}
        type="button"
        on:click={() => {
          editor
            ?.chain()
            .setTextSelection(getPos() + 1)
            .addTab()
            .run();
        }}
      >
        <Icon icon={PlusIcon} size={16} />
      </button>
    {/if}
  </div>

  <div
    class={css({
      'borderWidth': '1px',
      'borderColor': 'neutral.30',
      'padding': '16px',
      '&:not(:has([data-tab-selected])) [role="tabpanel"]:first-child': { display: 'block' },
      '& [role="tabpanel"][data-tab-selected]': { display: 'block' },
    })}
  >
    <NodeViewContentEditable />
  </div>
</NodeView>
