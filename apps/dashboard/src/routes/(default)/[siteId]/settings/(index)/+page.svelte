<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Alert, Button, FormField, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { lastVisitedPage } from '$lib/stores';
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

  const { form } = createMutationForm({
    schema: z.object({
      siteId: z.string(),
      name: dataSchemas.site.name,
      slug: dataSchemas.site.slug,
      themeColor: dataSchemas.site.themeColor,
      logoId: z.string(),
    }),
    mutation: async ({ name }) => {
      await updateSite({
        siteId: $query.site.id,
        name,
        slug: $query.site.slug,
        themeColor: $query.site.themeColor,
        logoId: null, // TODO
      });
    },
  });
</script>

<div class={css({ paddingTop: '40px', paddingX: '34px', paddingBottom: '120px', width: 'full' })}>
  <h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>일반</h1>

  <form
    class={css({
      marginBottom: '8px',
      borderWidth: '1px',
      borderColor: 'border.secondary',
      borderRadius: '10px',
      padding: '32px',
      width: 'full',
      maxWidth: '720px',
      backgroundColor: 'surface.primary',
    })}
    use:form
  >
    <p class={css({ marginBottom: '8px', textStyle: '14sb', color: { base: 'gray.700', _dark: 'gray.300' } })}>
      사이트 로고
    </p>

    {#if $query.site.logo}
      <Img
        style={css.raw({ size: '63px', borderWidth: '1px', borderColor: 'border.image', borderRadius: '4px' })}
        $image={$query.site.logo}
        alt="사이트 로고"
        size={64}
      />
    {:else}
      없음
    {/if}

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
        // TODO: 변경버튼 눌렀을 때 일괄 변경
      }}
    />

    <FormField name="name" style={css.raw({ marginTop: '24px' })} label="사이트명">
      <TextInput placeholder="사이트명을 입력해주세요" />
    </FormField>

    <Button style={css.raw({ marginTop: '8px', marginLeft: 'auto' })} size="lg" type="submit">변경</Button>
  </form>

  <form
    class={css({
      borderWidth: '1px',
      borderColor: 'border.secondary',
      borderRadius: '10px',
      padding: '32px',
      width: 'full',
      maxWidth: '720px',
      backgroundColor: 'surface.primary',
    })}
  >
    <label for="slug">URL</label>
    <TextInput name="slug" />

    <Button style={css.raw({ marginTop: '8px', marginLeft: 'auto' })} size="lg" type="submit">변경</Button>
  </form>
</div>

<Alert
  onAction={async () => {
    await deleteSite({ siteId: $query.site.id });
    $lastVisitedPage = null;
    await goto('/');
  }}
  bind:open={deleteSiteOpen}
>
  <svelte:fragment slot="title">사이트를 삭제할까요?</svelte:fragment>
  <svelte:fragment slot="content">사이트를 삭제하면 복구할 수 없어요</svelte:fragment>

  <svelte:fragment slot="action">사이트 삭제</svelte:fragment>
  <svelte:fragment slot="cancel">삭제하지 않을래요</svelte:fragment>
</Alert>
