<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, LogoPlaceholder } from '@readable/ui/components';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import { trpc } from '$lib/trpc';

  export let data;
</script>

<div
  class={flex({
    height: 'screen',
  })}
>
  <aside
    class={flex({
      flexDirection: 'column',
      gap: '10px',
      width: '232px',
      padding: '20px',
      backgroundColor: 'sidebar.surface',
    })}
  >
    <div>사이트(메뉴버튼)</div>

    {#await trpc.site.get.query({ siteId: data.siteId }) then site}
      <a
        class={css({
          'display': 'flex',
          'gap': '6px',
          'height': '40px',
          'paddingX': '12px',
          'alignItems': 'center',
          'borderRadius': '8px',
          'backgroundColor': 'neutral.10',
          'color': 'neutral.90',
          '&:hover': {
            backgroundColor: 'neutral.40',
          },
        })}
        href={site.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <LogoPlaceholder size={20} />
        <span>사이트 바로가기</span>
        <Icon
          style={{
            marginLeft: 'auto',
            color: 'neutral.50',
          }}
          icon={ExternalLinkIcon}
          size={16}
        />
      </a>
    {/await}

    <nav>
      <ul
        class={flex({
          flexDirection: 'column',
          gap: '2px',
        })}
      >
        <li><a href={`/workspace/${data.workspaceId}/site/${data.siteId}/pages`}>페이지</a></li>
        <li><a href={`/workspace/${data.workspaceId}/site/${data.siteId}/designs`}>디자인</a></li>
        <li><a href={`/workspace/${data.workspaceId}/site/${data.siteId}/settings`}>설정</a></li>
      </ul>
    </nav>
    <div
      class={css({
        marginTop: 'auto',
      })}
    >
      유저 프로필
    </div>
  </aside>

  <div
    class={flex({
      flexDirection: 'column',
      flexGrow: 1,
    })}
  >
    <slot />
  </div>
</div>
