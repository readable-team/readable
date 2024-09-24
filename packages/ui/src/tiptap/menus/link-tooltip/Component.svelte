<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  // import { toast } from '@readable/ui/notification';
  import PencilLineIcon from '~icons/lucide/pencil-line';
  import Trash2Icon from '~icons/lucide/trash-2';
  import RingSpinner from '../../../components/RingSpinner.svelte';

  export let unsetLink: () => void;
  export let hide: () => void;
  export let linkHref: string;
  export let openLinkEditPopover: () => void;
  export let handleLink: (url: string) => Promise<Record<string, unknown>>;

  const menuButtonStyle = flex({
    width: '22px',
    height: '22px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px',
    borderRadius: '4px',
    color: 'neutral.60',
    _hover: {
      backgroundColor: 'neutral.20',
    },
    _active: {
      backgroundColor: 'neutral.30',
    },
  });

  // const copyLink = async () => {
  //   try {
  //     await navigator.clipboard.writeText(linkHref);
  //     toast.success('링크가 복사되었습니다');
  //   } catch {
  //     toast.error('링크 복사에 실패했습니다'); // FIXME: 임시 문구
  //   }
  //   hide();
  // };

  const loadLink = async (url: string) => {
    if (url.startsWith('page:///')) {
      const resp = await handleLink(url);
      return {
        type: 'internal' as const,
        title: resp.name as string,
        href: resp.url as string,
      };
    } else {
      return {
        type: 'external' as const,
        title: url,
        href: url,
      };
    }
  };

  const unlink = () => {
    unsetLink();
    hide();
  };
</script>

<div
  class={css({
    // NOTE: 툴팁이 사라지기 전에 포인터를 위에 올릴 수 있도록 floating ui offset을 사용하는 대신 paddingTop 사용
    paddingTop: '4px',
  })}
>
  <div
    class={flex({
      alignItems: 'center',
      maxWidth: '280px',
      paddingX: '12px',
      paddingY: '6px',
      gap: '14px',
      backgroundColor: 'background.overlay',
      borderRadius: '8px',
      boxShadow: 'strong',
    })}
  >
    {#await loadLink(linkHref)}
      <RingSpinner style={css.raw({ size: '14px', color: 'text.tertiary' })} />
    {:then link}
      <a
        class={css({
          color: 'text.tertiary',
          textStyle: '14r',
          truncate: true,
          _hover: {
            textDecoration: 'underline',
          },
        })}
        href={link.href}
        {...link.type === 'external' && {
          rel: 'noopener noreferrer',
          target: '_blank',
        }}
      >
        {link.title}
      </a>
    {/await}
    <div
      class={flex({
        gap: '8px',
      })}
    >
      <button
        class={menuButtonStyle}
        type="button"
        on:click={() => {
          openLinkEditPopover?.();
        }}
      >
        <Icon icon={PencilLineIcon} size={16} />
      </button>
      <button class={menuButtonStyle} type="button" on:click={() => unlink()}>
        <Icon icon={Trash2Icon} size={16} />
      </button>
    </div>
  </div>
</div>
