<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { toast } from '@readable/ui/notification';
  import CopyIcon from '~icons/lucide/copy';
  import PencilIcon from '~icons/lucide/pencil';

  export let hide: () => void;
  export let linkHref: string;
  export let openLinkEditPopover: () => void;

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkHref);
      toast('링크가 복사되었습니다');
    } catch {
      toast('링크 복사에 실패했습니다'); // FIXME: 임시 문구
    }
    hide();
  };
</script>

<div
  class={css({
    // NOTE: 툴팁이 사라지기 전에 포인터를 위에 올릴 수 있도록 floating ui offset을 사용하는 대신 paddingTop 사용
    paddingTop: '8px',
  })}
>
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
          openLinkEditPopover?.();
        }}
      >
        <Icon icon={PencilIcon} size={12} />
      </button>
    </div>
  </div>
</div>
