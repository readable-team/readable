<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Alert, Button } from '@readable/ui/components';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { uploadBlobAsImage } from '$lib/utils/blob.svelte';

  let deleteSiteOpen = false;

  $: query = graphql(`
    query SiteSetting_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        name
        slug
        themeColor

        logo {
          id
          ...Img_image
        }
      }
    }
  `);

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
</script>

<div>
  <h1>기본정보 설정</h1>

  <br />
  현재 로고
  {#if $query.site.logo}
    <Img
      style={css.raw({ size: '32px', borderWidth: '1px', borderColor: 'border.image' })}
      $image={$query.site.logo}
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
        siteId: $query.site.id,
        name: $query.site.name,
        slug: $query.site.slug,
        themeColor: $query.site.themeColor,
        logoId: resp.id,
      });
    }}
  />

  <br />
  <Button
    on:click={async () => {
      await updateSite({
        siteId: $query.site.id,
        name: $query.site.name,
        slug: $query.site.slug,
        themeColor: $query.site.themeColor,
        logoId: null,
      });
    }}
  >
    로고 제거
  </Button>

  <br />
  <br />

  <Button on:click={() => (deleteSiteOpen = true)}>사이트 삭제</Button>
</div>

<Alert
  onAction={async () => {
    await deleteSite({ siteId: $query.site.id });
    await goto('/');
  }}
  bind:open={deleteSiteOpen}
>
  <svelte:fragment slot="title">사이트를 삭제할까요?</svelte:fragment>
  <svelte:fragment slot="content">사이트를 삭제하면 복구할 수 없어요</svelte:fragment>

  <svelte:fragment slot="action">사이트 삭제</svelte:fragment>
  <svelte:fragment slot="cancel">삭제하지 않을래요</svelte:fragment>
</Alert>
