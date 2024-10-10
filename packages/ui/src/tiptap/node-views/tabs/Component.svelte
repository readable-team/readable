<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { NodeView, NodeViewContentEditable } from '@readable/ui/tiptap';
  import { tick } from 'svelte';
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
  let renamingTabInput: HTMLInputElement | undefined;

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
  <div
    class={flex({
      align: 'center',
      position: 'relative',
      borderWidth: '1px',
      borderColor: 'border.secondary',
      borderTopRadius: '2px',
      backgroundColor: 'gray.200',
      height: '34px',
    })}
    contenteditable="false"
  >
    <div class={css({ overflowX: 'auto', scrollbar: 'hidden' })}>
      <ul class={css({ display: 'flex' })} role="tablist">
        {#each tabs as tab, i (i)}
          <li
            class={css(
              {
                'position': 'relative',
                'borderWidth': '1px',
                'borderColor': 'border.secondary',
                'marginBottom': '-1px',
                'paddingLeft': '16px',
                'paddingRight': editor?.isEditable ? '44px' : '16px',
                'paddingY': '5px',
                'flex': 'none',
                'textStyle': '14m',
                'height': '35px',
                'cursor': 'pointer',
                '_first': { borderLeftWidth: '0', borderTopLeftRadius: '2px' },
                '_hover': { '& > button': { display: 'flex' } },
                '& + &': { marginLeft: '-1px' },
              },
              tab.selected
                ? { borderBottomWidth: '0', backgroundColor: 'neutral.0' }
                : { maxWidth: '95px', truncate: true },
            )}
            role="tab"
            tabindex={0}
            on:keydown={null}
            on:click={() => {
              if (tab.selected) {
                if (editor?.isEditable) {
                  renamingTabIdx = i;
                  renamingTabTitle = tab.title;
                  tick().then(() => {
                    renamingTabInput?.focus();
                  });
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
                bind:this={renamingTabInput}
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
                  position: 'absolute',
                  translate: 'auto',
                  translateY: '-1/2',
                  top: '1/2',
                  right: '14px',
                  display: tab.selected ? 'flex' : 'none',
                  size: '24px',
                  borderRadius: '2px',
                  color: 'gray.500',
                  _hover: { backgroundColor: 'gray.300/40' },
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
    </div>

    {#if editor?.isEditable}
      <div
        class={center({
          position: 'sticky',
          top: '0',
          right: '0',
          zIndex: '1',
          flex: 'none',
          borderYWidth: '1px',
          borderColor: 'border.secondary',
          borderTopRightRadius: '2px',
          size: '34px',
          backgroundColor: 'gray.200',
        })}
      >
        <button
          class={center({
            size: '24px',
            borderRadius: '2px',
            color: 'gray.500',
            _hover: { backgroundColor: 'gray.300/40' },
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
      </div>
    {/if}
  </div>

  <div
    class={css({
      'borderWidth': '1px',
      'borderTopWidth': '0',
      'borderColor': 'border.secondary',
      'borderBottomRadius': '2px',
      'padding': '16px',
      '&:not(:has([data-tab-selected])) [role="tabpanel"]:first-child': { display: 'block' },
      '& [role="tabpanel"][data-tab-selected]': { display: 'block' },
    })}
  >
    <NodeViewContentEditable />
  </div>
</NodeView>
