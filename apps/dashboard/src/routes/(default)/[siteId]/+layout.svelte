<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import ReadableIcon from '~icons/rdbl/readable';
  import SlashDividerIcon from '~icons/rdbl/slash-divider';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img, Tabs } from '$lib/components';
  import UserMenu from './UserMenu.svelte';

  $: query = graphql(`
    query SiteLayout_Query($siteId: ID!) {
      ...UserMenu_query

      me @required {
        id
      }

      site(siteId: $siteId) {
        id
        name
        url
        themeColor

        logo {
          id
          ...Img_image
        }
      }
    }
  `);

  const siteUpdateStream = graphql(`
    subscription SiteLayout_SiteUpdateStream_Subscription($siteId: ID!) {
      siteUpdateStream(siteId: $siteId) {
        ... on Site {
          id
          ...LeftSideBar_site
        }

        ... on Page {
          id
          state
          hasUnpublishedChanges

          content {
            id
            title
          }
        }
      }
    }
  `);

  onMount(() => {
    const unsubscribe = siteUpdateStream.subscribe({
      siteId: $query.site.id,
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<div style:--usersite-theme-color={$query.site.themeColor} class={flex({ flexDirection: 'column', height: 'screen' })}>
  <header
    class={flex({
      justifyContent: 'space-between',
      height: '48px',
      paddingLeft: '20px',
      paddingRight: '16px',
      paddingY: '10px',
      backgroundColor: 'surface.primary',
    })}
  >
    <div
      class={flex({
        gap: '2px',
        alignItems: 'center',
        paddingX: '8px',
        paddingY: '6px',
      })}
    >
      <Icon icon={ReadableIcon} size={18} />
      <Icon icon={SlashDividerIcon} size={18} />
      {#if $query.site.logo}
        <Img
          style={css.raw({ borderRadius: 'full', size: '19px', borderWidth: '1px', borderColor: 'border.image' })}
          $image={$query.site.logo}
          alt={`${$query.site.name}의 로고`}
          size={48}
        />
      {/if}
      <h1 class={css({ textStyle: '14sb' })}>
        {$query.site.name}
      </h1>
    </div>
    <UserMenu {$query} />
  </header>

  <nav
    class={flex({
      align: 'center',
      justify: 'space-between',
      borderBottomWidth: '1px',
      borderColor: 'border.primary',
      paddingX: '20px',
      height: '46px',
    })}
  >
    <Tabs
      tabs={[
        {
          title: '콘텐츠',
          path: `/${$query.site.id}`,
          selected:
            $page.url.pathname.startsWith(`/${$query.site.id}`) &&
            !$page.url.pathname.startsWith(`/${$query.site.id}/settings`),
        },
        {
          title: '사이트 설정',
          path: `/${$query.site.id}/settings`,
          selected: $page.url.pathname.startsWith(`/${$query.site.id}/settings`),
        },
      ]}
    />

    <Button href={$query.site.url} rel="noopener noreferrer" size="sm" target="_blank" type="link" variant="secondary">
      사이트 바로가기
    </Button>
  </nav>

  <div
    class={flex({
      flex: '1',
      overflow: 'auto',
    })}
  >
    <slot />
  </div>
</div>
