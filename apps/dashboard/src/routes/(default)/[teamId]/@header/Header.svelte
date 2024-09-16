<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ReadableIcon from '~icons/rdbl/readable';
  import SlashDividerIcon from '~icons/rdbl/slash-divider';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import SiteSwitcher from './SiteSwitcher.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { Header_query } from '$graphql';

  let _query: Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment Header_query on Query {
        ...UserMenu_query

        team(teamId: $teamId) {
          id
          name
          avatar {
            id
            ...Img_image
          }

          ...SiteSwitcher_team
        }
      }
    `),
  );
</script>

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
