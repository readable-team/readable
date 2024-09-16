<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Menu, MenuItem } from '@readable/ui/components';
  import CheckIcon from '~icons/lucide/check';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import type { TeamSwitcher_user } from '$graphql';

  let _user: TeamSwitcher_user;

  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment TeamSwitcher_user on User {
        id
        teams {
          id
          name
          avatar {
            id
            ...Img_image
          }
        }
      }
    `),
  );

  $: currentTeamId = $page.params.teamId;
</script>

<Menu
  listStyle={css.raw({ width: '220px' })}
  offset={{
    mainAxis: 6,
    crossAxis: -24,
  }}
  placement="bottom-start"
>
  <button
    slot="button"
    class={flex({
      alignItems: 'center',
      borderRadius: '6px',
      padding: '3px',
      color: 'neutral.50',
      _hover: { backgroundColor: 'neutral.20' },
    })}
    aria-label="팀 선택"
    type="button"
  >
    <Icon icon={ChevronDownIcon} size={16} />
  </button>

  <div
    class={css({
      paddingX: '12px',
      paddingY: '5px',
      textStyle: '13m',
      color: 'text.tertiary',
    })}
  >
    팀
  </div>

  {#each $user.teams as team (team.id)}
    <MenuItem
      style={css.raw({
        padding: '8px',
        gap: '8px',
        _currentPage: {
          backgroundColor: 'neutral.20',
          pointerEvents: 'none',
        },
      })}
      aria-current={currentTeamId === team.id ? 'page' : undefined}
      on:click={() => goto(`/${team.id}`)}
    >
      <Img
        style={css.raw({ size: '20px', borderRadius: 'full' })}
        $image={team.avatar}
        alt={`${team.name}의 로고`}
        size={24}
      />
      <span class={css({ textStyle: '14m', truncate: true })}>{team.name}</span>
      {#if currentTeamId === team.id}
        <Icon style={css.raw({ marginLeft: 'auto', color: 'text.accent' })} icon={CheckIcon} size={16} />
      {/if}
    </MenuItem>
  {/each}
</Menu>
