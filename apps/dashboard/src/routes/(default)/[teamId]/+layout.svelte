<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Menu, MenuItem } from '@readable/ui/components';
  import mixpanel from 'mixpanel-browser';
  import { onMount } from 'svelte';
  import CheckIcon from '~icons/lucide/check';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import CirclePlusIcon from '~icons/lucide/circle-plus';
  import ReadableIcon from '~icons/rdbl/readable';
  import SlashDividerIcon from '~icons/rdbl/slash-divider';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import UserMenu from './[siteId]/UserMenu.svelte';

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
      }
    }
  `);

  const teamUpdateStream = graphql(`
    subscription TeamLayout_TeamUpdateStream_Subscription($teamId: ID!) {
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

  $: currentSiteId = $page.params.siteId;
  $: currentSite = $query.team.sites.find((site) => site.id === currentSiteId);

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
      {#if currentSite}
        <Icon icon={SlashDividerIcon} size={18} />
        <a
          class={flex({
            alignItems: 'center',
            padding: '4px',
            gap: '8px',
          })}
          aria-current="page"
          href={`/${$query.team.id}/${currentSite.id}`}
        >
          {#if currentSite.logo}
            <Img
              style={css.raw({ size: '20px' })}
              $image={currentSite.logo}
              alt={`${currentSite.name}의 로고`}
              size={24}
            />
          {/if}
          <span class={css({ textStyle: '14sb', truncate: true })}>
            {currentSite.name}
          </span>
        </a>
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
              borderRadius: '6px',
              padding: '3px',
              color: 'neutral.50',
              _hover: { backgroundColor: 'neutral.20' },
            })}
            aria-label="사이트 선택"
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
            사이트
          </div>

          {#each $query.team.sites as site (site.id)}
            <MenuItem
              style={css.raw({
                padding: '8px',
                gap: '8px',
                _currentPage: {
                  backgroundColor: 'neutral.20',
                  pointerEvents: 'none',
                },
              })}
              aria-current={currentSiteId === site.id ? 'page' : undefined}
              href={`/${$query.team.id}/${site.id}`}
              type="link"
            >
              {#if site.logo}
                <Img style={css.raw({ size: '20px' })} $image={site.logo} alt={`${site.name}의 로고`} size={24} />
              {:else}
                <div
                  class={flex({
                    flexShrink: 0,
                    size: '20px',
                    borderWidth: '[1.5px]',
                    borderColor: 'border.primary',
                    borderStyle: 'dashed',
                    borderRadius: '4px',
                  })}
                  aria-hidden="true"
                />
              {/if}
              <span class={css({ textStyle: '14m', truncate: true })}>{site.name}</span>
              {#if currentSiteId === site.id}
                <Icon style={css.raw({ marginLeft: 'auto', color: 'text.accent' })} icon={CheckIcon} size={16} />
              {/if}
            </MenuItem>
          {/each}
          <MenuItem
            style={flex.raw({ paddingX: '10px', color: 'text.tertiary', gap: '10px' })}
            on:click={() => alert('TODO')}
          >
            <Icon icon={CirclePlusIcon} size={16} />
            <span>새 사이트 만들기</span>
          </MenuItem>
        </Menu>
      {/if}
    </div>
    <UserMenu {$query} />
  </header>

  <slot />
</div>
