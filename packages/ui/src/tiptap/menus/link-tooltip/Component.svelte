<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, TextInput } from '@readable/ui/components';
  import CopyIcon from '~icons/lucide/copy';
  import PencilIcon from '~icons/lucide/pencil';
  import type { Editor } from '@tiptap/core';
  import type { Node } from '@tiptap/pm/model';

  export let editor: Editor;
  export let pos: number | null = null;
  export let exit: () => void;
  export let anchorNode: Node | null = null;

  export let linkEditModalOpened = false;
  let linkDraft = '';

  const addHttpScheme = (url: string) => {
    if (!url.includes('://')) {
      return `http://${url}`;
    }
    return url;
  };

  const updateLink = () => {
    if (!anchorNode || !pos) {
      return;
    }

    linkDraft = linkDraft.trim();
    linkDraft = addHttpScheme(linkDraft);

    const { state, dispatch } = editor.view;
    let { tr } = state;

    const from = pos;
    const to = pos + anchorNode.nodeSize;
    tr.addMark(from, to, editor.schema.marks.link.create({ href: linkDraft }));

    dispatch(tr);
    exit();
  };

  const menuButtonStyle = flex({
    width: '24px',
    height: '24px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: 'neutral.50',
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
  });

  $: linkHref = anchorNode?.marks.find((mark) => mark.type.name === 'link')?.attrs.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkHref);
      // FIXME: 뭔가 피드백 주기
    } catch {
      // FIXME: 뭔가 피드백 주기
    }
    exit();
  };
</script>

<div
  class={css({
    // NOTE: 툴팁이 사라지기 전에 포인터를 위에 올릴 수 있도록 floating ui offset을 사용하는 대신 paddingTop 사용
    paddingTop: '8px',
  })}
>
  {#if linkEditModalOpened}
    <div
      class={flex({
        width: '460px',
        flexDirection: 'column',
        backgroundColor: 'surface.tertiary',
        borderRadius: '10px',
        boxShadow: 'heavy',
        gap: '14px',
        padding: '20px',
      })}
    >
      <!-- FIXME: 유효한 링크인지 검사? -->
      <!-- FIXME: form 사용 -->
      <TextInput
        name="link-draft"
        placeholder="링크를 붙여넣어주세요"
        bind:value={linkDraft}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            updateLink();
          }
        }}
      />
      <Button disabled={linkDraft === ''} size="lg" variant="primary" on:click={updateLink}>링크 수정</Button>
    </div>
  {:else}
    <div
      class={flex({
        alignItems: 'center',
        maxWidth: '260px',
        paddingY: '5px',
        paddingLeft: '12px',
        paddingRight: '6px',
        gap: '12px',
        backgroundColor: 'surface.tertiary',
        borderRadius: '8px',
        boxShadow: 'heavy',
      })}
    >
      <div
        class={css({
          color: 'text.tertiary',
          textStyle: '12sb',
          truncate: true,
        })}
      >
        {linkHref}
      </div>
      <div
        class={flex({
          gap: '4px',
        })}
      >
        <button class={menuButtonStyle} type="button" on:click={() => copyLink()}>
          <Icon icon={CopyIcon} size={12} />
        </button>
        <button
          class={menuButtonStyle}
          type="button"
          on:click={() => {
            linkDraft = linkHref;
            linkEditModalOpened = true;
          }}
        >
          <Icon icon={PencilIcon} size={12} />
        </button>
      </div>
    </div>
  {/if}
</div>
