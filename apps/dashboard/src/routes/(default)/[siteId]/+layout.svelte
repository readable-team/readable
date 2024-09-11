<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import mixpanel from 'mixpanel-browser';
  import { onMount } from 'svelte';
  import MousePointerClickIcon from '~icons/lucide/mouse-pointer-click';
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

        team {
          id

          meAsMember {
            id
            role
          }
        }

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

  const teamUpdateStream = graphql(`
    subscription SiteLayout_TeamUpdateStream_Subscription($teamId: ID!) {
      teamUpdateStream(teamId: $teamId) {
        ... on Team {
          id
          ...TeamMembers_team
        }

        ... on TeamMember {
          id
        }
      }
    }
  `);

  onMount(() => {
    mixpanel.register({
      site_id: $query.site.id,
    });

    const unsubscribe = siteUpdateStream.subscribe({
      siteId: $query.site.id,
    });

    const unsubscribe2 = teamUpdateStream.subscribe({
      teamId: $query.site.team.id,
    });

    return () => {
      mixpanel.unregister('site_id');

      unsubscribe();
      unsubscribe2();
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
        alignItems: 'center',
        paddingX: '8px',
        paddingY: '6px',
      })}
    >
      <Icon icon={ReadableIcon} size={20} />
      <Icon style={css.raw({ marginLeft: '2px', marginRight: '4px' })} icon={SlashDividerIcon} size={18} />
      {#if $query.site.logo}
        <Img
          style={css.raw({ marginRight: '6px', borderRadius: '4px', size: '18px' })}
          $image={$query.site.logo}
          alt={`${$query.site.name}의 로고`}
          size={24}
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
      borderColor: 'border.secondary',
      paddingX: '20px',
      height: '46px',
    })}
  >
    <Tabs
      tabs={[
        {
          title: '페이지',
          path: `/${$query.site.id}`,
          selected:
            $page.url.pathname.startsWith(`/${$query.site.id}`) &&
            !$page.url.pathname.startsWith(`/${$query.site.id}/settings`),
        },
        ...($query.site.team.meAsMember?.role === 'ADMIN'
          ? [
              {
                title: '사이트 설정',
                path: `/${$query.site.id}/settings`,
                selected: $page.url.pathname.startsWith(`/${$query.site.id}/settings`),
              },
            ]
          : []),
      ]}
    />

    <a
      class={flex({
        align: 'center',
        gap: '6px',
        borderWidth: '1px',
        borderColor: 'border.secondary',
        borderRadius: '4px',
        paddingX: '8px',
        paddingY: '4px',
        color: 'text.tertiary',
        textStyle: '14sb',
        backgroundColor: { base: 'neutral.10', _hover: 'neutral.20', _pressed: 'neutral.30' },
      })}
      href={$query.site.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icon icon={MousePointerClickIcon} />
      {$query.site.url}
    </a>
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
