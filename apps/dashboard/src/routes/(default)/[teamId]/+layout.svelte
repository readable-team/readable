<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import mixpanel from 'mixpanel-browser';
  import { onMount } from 'svelte';
  import ReadableIcon from '~icons/rdbl/readable';
  import SlashDividerIcon from '~icons/rdbl/slash-divider';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import UserMenu from './[siteId]/UserMenu.svelte';
  import SiteSwitcher from './SiteSwitcher.svelte';

  $: query = graphql(`
    query TeamLayout_Query($teamId: ID!) {
      ...UserMenu_query

      team(teamId: $teamId) {
        id
        name
        avatar {
          id
          ...Img_image
        }

        sites {
          id
          name
          logo {
            id
            ...Img_image
          }
        }

        ...SiteSwitcher_team
      }
    }
  `);

  const teamUpdateStream = graphql(`
    subscription TeamLayout_TeamUpdateStream_Subscription($teamId: ID!) {
      teamUpdateStream(teamId: $teamId) {
        ... on Team {
          id
          ...TeamMembers_team
          ...SiteSwitcher_team
        }

        ... on TeamMember {
          id
        }
      }
    }
  `);

  onMount(() => {
    mixpanel.register({
      team_id: $query.team.id,
    });

    const unsubscribe = teamUpdateStream.subscribe({
      teamId: $query.team.id,
    });

    return () => {
      mixpanel.unregister('team_id');

      unsubscribe();
    };
  });
</script>

<div class={flex({ flexDirection: 'column', height: 'screen' })}>
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
      })}
    >
      <Icon icon={ReadableIcon} size={24} />
      <Icon icon={SlashDividerIcon} size={18} />
      <a
        class={flex({ alignItems: 'center', padding: '4px' })}
        aria-current={$page.url.pathname === `/${$query.team.id}` ? 'page' : undefined}
        href={`/${$query.team.id}`}
      >
        <Img
          style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '20px' })}
          $image={$query.team.avatar}
          alt={`${$query.team.name}의 로고`}
          size={24}
        />
        <h1 class={css({ marginLeft: '8px', textStyle: '14sb', truncate: true })}>
          {$query.team.name}
        </h1>
      </a>
      <SiteSwitcher $team={$query.team} />
    </div>
    <UserMenu {$query} />
  </header>

  <slot />
</div>
