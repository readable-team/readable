<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon, Menu, MenuItem } from '@readable/ui/components';
  import mixpanel from 'mixpanel-browser';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { accessToken } from '$lib/graphql';
  import UserSettingModal from './UserSettingModal.svelte';
  import type { UserMenu_query } from '$graphql';

  let _query: UserMenu_query;
  export { _query as $query };

  let openUserSettingModal = false;
  $: openUserSettingModal = $page.url.hash === '#/settings/personal' || $page.url.hash.startsWith('#/settings/team');

  $: query = fragment(
    _query,
    graphql(`
      fragment UserMenu_query on Query {
        me @required {
          id
          name
          email
          ...UserSettingModal_user

          avatar {
            id
            ...Img_image
          }
        }

        site(siteId: $siteId) {
          id
          ...UserSettingModal_site

          team {
            id
            name

            avatar {
              id
              ...Img_image
            }
          }
        }
      }
    `),
  );

  const logout = graphql(`
    mutation UserMenu_Logout_Mutation {
      logout
    }
  `);
</script>

<Menu placement="top" setFullWidth>
  <div
    slot="button"
    class={flex({
      align: 'center',
      justify: 'space-between',
      gap: '10px',
      borderWidth: '1px',
      borderColor: 'border.secondary',
      borderRadius: '10px',
      paddingX: '18px',
      paddingY: '16px',
    })}
  >
    <div class={flex({ align: 'center', gap: '16px' })}>
      <div class={css({ position: 'relative' })}>
        <Img
          style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '40px' })}
          $image={$query.site.team.avatar}
          alt={`${$query.site.team.name}의 아바타`}
          size={48}
        />
        <Img
          style={css.raw({
            position: 'absolute',
            right: '-6px',
            bottom: '-6px',
            borderWidth: '1px',
            borderColor: 'border.image',
            borderRadius: 'full',
            size: '23px',
          })}
          $image={$query.me.avatar}
          alt={`${$query.me.name}의 아바타`}
          size={24}
        />
      </div>
      <div class={flex({ flexDirection: 'column', align: 'flex-start', gap: '2px' })}>
        <p class={css({ textStyle: '15sb', color: 'text.secondary' })}>{$query.site.team.name}</p>
        <p class={css({ textStyle: '14m', color: 'text.tertiary' })}>{$query.me.name}</p>
      </div>
    </div>
    <Icon style={css.raw({ color: 'text.tertiary' })} icon={ChevronDownIcon} />
  </div>

  <p class={css({ textStyle: '14b', color: 'text.tertiary' })}>팀</p>
  <div class={flex({ align: 'center', gap: '10px', paddingY: '8px' })}>
    <Img
      style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '34px' })}
      $image={$query.site.team.avatar}
      alt={`${$query.site.team.name}의 아바타`}
      size={48}
    />

    <p class={css({ textStyle: '14sb', color: 'text.secondary' })}>{$query.site.team.name}</p>
  </div>
  <MenuItem external={false} href="#/settings/team" type="link">팀 설정</MenuItem>

  <HorizontalDivider style={css.raw({ marginY: '12px' })} color="secondary" />

  <p class={css({ textStyle: '14b', color: 'text.tertiary' })}>개인</p>
  <div class={flex({ align: 'center', gap: '10px', paddingY: '8px' })}>
    <Img
      style={css.raw({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '34px' })}
      $image={$query.me.avatar}
      alt={`${$query.me.name}의 아바타`}
      size={48}
    />

    <div>
      <p class={css({ textStyle: '14sb', color: 'text.secondary' })}>{$query.me.name}</p>
      <p class={css({ textStyle: '12sb', color: 'text.tertiary' })}>{$query.me.email}</p>
    </div>
  </div>
  <MenuItem external={false} href="#/settings/personal" type="link">개인 설정</MenuItem>

  <MenuItem
    type="button"
    on:click={async () => {
      await logout();

      $accessToken = null;
      mixpanel.reset();

      location.href = env.PUBLIC_WEBSITE_URL;
    }}
  >
    로그아웃
  </MenuItem>
</Menu>

<UserSettingModal $site={$query.site} $user={$query.me} bind:open={openUserSettingModal} />
