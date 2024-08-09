<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, Modal } from '@readable/ui/components';
  import PaintbrushIcon from '~icons/lucide/paintbrush';
  import SatelliteDishIcon from '~icons/lucide/satellite-dish';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { uploadBlobAsImage } from '$lib/utils/blob.svelte';
  import type { SiteSettingModal_site, SiteSettingModal_user } from '$graphql';

  let _user: SiteSettingModal_user;
  let _site: SiteSettingModal_site;
  export { _site as $site, _user as $user };

  export let open = false;

  $: selectedTab = $page.url.hash;

  $: user = fragment(
    _user,
    graphql(`
      fragment SiteSettingModal_user on User {
        id
        name
        email

        avatar {
          id
          ...Img_image
        }
      }
    `),
  );

  $: site = fragment(
    _site,
    graphql(`
      fragment SiteSettingModal_site on Site {
        id
        name
        url
        slug

        logo {
          id
          ...Img_image
        }

        team {
          id

          meAsMember {
            id
            role
          }

          members {
            id
            role

            user {
              id
              email
            }
          }
        }
      }
    `),
  );

  const updateSite = graphql(`
    mutation SiteSettingModal_UpdateSite_Mutation($input: UpdateSiteInput!) {
      updateSite(input: $input) {
        id
        slug
        name

        logo {
          id
        }
      }
    }
  `);

  const deleteSite = graphql(`
    mutation SiteSettingModal_DeleteSite_Mutation($input: DeleteSiteInput!) {
      deleteSite(input: $input) {
        id
      }
    }
  `);

  const siteSettings = [
    {
      icon: SatelliteDishIcon,
      text: '기본정보',
      tab: '#site-settings',
    },
    {
      icon: PaintbrushIcon,
      text: '디자인',
      tab: '#design-settings',
    },
  ];

  const tabItemStyle = flex({
    align: 'center',
    gap: '6px',
    borderRadius: '6px',
    paddingX: '6px',
    paddingY: '5px',
    textStyle: '15sb',
    color: 'text.secondary',
    width: 'full',
    _hover: { backgroundColor: 'neutral.20' },
    _selected: { backgroundColor: 'neutral.30' },
  });
</script>

<Modal
  style={css.raw({ display: 'flex' })}
  close={() => {
    const currentPath = $page.url.pathname;
    goto(currentPath, { replaceState: true });
  }}
  bind:open
>
  <svelte:fragment slot="sidebar">
    <div class={flex({ align: 'center', gap: '6px' })}>
      <Img
        style={css.raw({
          flex: 'none',
          borderWidth: '1px',
          borderColor: 'border.image',
          borderRadius: 'full',
          size: '36px',
        })}
        $image={$user.avatar}
        alt={`${$user.name}의 아바타`}
        size={48}
      />

      <div class={css({ truncate: true })}>
        <p class={css({ textStyle: '14b', truncate: true })}>{$user.name}</p>
        <p class={css({ textStyle: '13m', color: 'text.tertiary', truncate: true })}>{$user.email}</p>
      </div>
    </div>

    <dl class={flex({ direction: 'column', gap: '4px', paddingTop: '16px', paddingBottom: '8px' })}>
      <dt class={css({ textStyle: '12sb', color: 'text.tertiary' })}>사이트 설정</dt>
      {#each siteSettings as setting (setting.text)}
        <dd>
          <a class={tabItemStyle} aria-selected={selectedTab === setting.tab} href={setting.tab} role="tab">
            <Icon icon={setting.icon} />
            <span>{setting.text}</span>
          </a>
        </dd>
      {/each}
    </dl>
  </svelte:fragment>

  <div hidden={selectedTab !== '#site-settings'}>
    <h1>기본정보 설정</h1>

    <br />
    현재 로고
    {#if $site.logo}
      <Img
        style={css.raw({ size: '32px', borderWidth: '1px', borderColor: 'border.image' })}
        $image={$site.logo}
        alt="사이트 로고"
        size={32}
      />
    {:else}
      없음
    {/if}

    <br />
    로고 변경
    <input
      type="file"
      on:change={async (event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) {
          return;
        }

        const resp = await uploadBlobAsImage(file, {
          ensureAlpha: true,
          resize: { width: 512, height: 512, fit: 'contain', background: '#00000000' },
          format: 'png',
        });

        await updateSite({
          siteId: $site.id,
          name: $site.name,
          slug: $site.slug,
          logoId: resp.id,
        });
      }}
    />

    <br />
    <Button
      on:click={async () => {
        await updateSite({
          siteId: $site.id,
          name: $site.name,
          slug: $site.slug,
          logoId: null,
        });
      }}
    >
      로고 제거
    </Button>

    <br />
    <br />

    <Button
      on:click={async () => {
        await deleteSite({ siteId: $site.id });
        await goto('/');
      }}
    >
      사이트 삭제
    </Button>
  </div>
  <div hidden={selectedTab !== '#design-settings'}>디자인 설정</div>
</Modal>
