<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, LogoPlaceholder } from '@readable/ui/components';
  import { trpc } from '$lib/trpc';

  export let data;
</script>

<div
  class={flex({
    flexDirection: 'column',
    height: 'screen',
  })}
>
  <header
    class={flex({
      justifyContent: 'space-between',
      borderBottomWidth: '1px',
      borderColor: 'border.primary',
      height: '60px',
      padding: '8px',
    })}
  >
    {#await trpc.site.get.query({ siteId: data.siteId }) then site}
      <div
        class={flex({
          width: '200px',
        })}
      >
        <LogoPlaceholder size={20} />
        <h1>
          {site.name}
        </h1>
      </div>

      <div
        class={css({
          left: '0',
          right: '0',
          marginX: 'auto',
          width: '400px',
          backgroundColor: 'surface.secondary',
          borderRadius: '8px',
        })}
      >
        {site.url}
      </div>

      <div
        class={flex({
          width: '200px',
        })}
      >
        <Button href={site.url} rel="noopener noreferrer" target="_blank" type="link" variant="secondary">
          사이트 바로가기
        </Button>
        <div>프로필</div>
      </div>
    {/await}
  </header>

  <div
    class={flex({
      height: 'full',
    })}
  >
    <aside
      class={flex({
        flexDirection: 'column',
        gap: '10px',
        width: '232px',
        padding: '20px',
        backgroundColor: 'sidebar.surface',
        flexShrink: 0,
      })}
    >
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
    </aside>

    <div
      class={flex({
        width: 'full',
        flexDirection: 'column',
        flexGrow: 1,
      })}
    >
      <slot />
    </div>
  </div>
</div>
