<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import BoldIcon from '~icons/lucide/bold';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import ItalicIcon from '~icons/lucide/italic';
  // import LinkIcon from '~icons/lucide/link';
  import StrikethroughIcon from '~icons/lucide/strikethrough';
  import UnderlineIcon from '~icons/lucide/underline';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;
  export let from: number | null = null;
  export let to: number | null = null;

  const marks = [
    { name: 'bold', icon: BoldIcon },
    { name: 'italic', icon: ItalicIcon },
    { name: 'underline', icon: UnderlineIcon },
    { name: 'strike', icon: StrikethroughIcon },
    { name: 'code', icon: CodeXmlIcon },
  ];

  let activeMarks: string[] = [];

  const updateActiveMarks = () => {
    activeMarks = marks.map(({ name }) => name).filter((name) => editor.isActive(name));
  };

  $: editor.on('update', () => {
    updateActiveMarks();
  });

  $: {
    from;
    to;
    updateActiveMarks();
  }
</script>

<div
  class={flex({
    height: '40px',
    alignItems: 'center',
    paddingX: '8px',
    gap: '2px',
    backgroundColor: 'surface.tertiary',
    boxShadow: 'heavy',
  })}
>
  {#each marks as { name, icon } (name)}
    <button
      class={flex({
        width: '30px',
        height: '30px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        _hover: {
          backgroundColor: 'neutral.10',
        },
        _pressed: {
          // theme=selected
          backgroundColor: 'neutral.20',
        },
        _active: {
          // theme=pressed
          backgroundColor: 'neutral.30',
        },
      })}
      aria-pressed={activeMarks.includes(name)}
      type="button"
      on:click={() => {
        editor.chain().focus().toggleMark(name).run();
      }}
    >
      <Icon {icon} size={16} />
    </button>
  {/each}
</div>
