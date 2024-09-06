<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import {
    Alert,
    Button,
    FormField,
    FormValidationMessage,
    Icon,
    LogoPlaceholder,
    TextInput,
  } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { onMount } from 'svelte';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import InfoIcon from '~icons/lucide/info';
  import UploadIcon from '~icons/lucide/upload';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { invokeAlert } from '$lib/components/invoke-alert';
  import { lastVisitedPage } from '$lib/stores';
  import { uploadBlobAsImage } from '$lib/utils/blob.svelte';
  import type { Img_image } from '$graphql';

  let deleteSiteOpen = false;

  let logo: Img_image | null | undefined;
  let inputEl: HTMLInputElement;

  $: query = graphql(`
    query SiteSettingsIndexPage_Query($siteId: ID!) {
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

  onMount(() => {
    logo = $query.site.logo;
  });

  const updateSite = graphql(`
    mutation SiteSettingsIndexPage_UpdateSite_Mutation($input: UpdateSiteInput!) {
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
    mutation SiteSettingsIndexPage_DeleteSite_Mutation($input: DeleteSiteInput!) {
      deleteSite(input: $input) {
        id
      }
    }
  `);

  const { form, data, setInitialValues } = createMutationForm({
    schema: z.object({
      siteId: z.string(),
      name: dataSchemas.site.name,
      slug: dataSchemas.site.slug,
      themeColor: dataSchemas.site.themeColor,
      logoId: z.string(),
    }),
    mutation: async ({ name, logoId }) => {
      await updateSite({
        siteId: $query.site.id,
        name,
        slug: $query.site.slug,
        themeColor: $query.site.themeColor,
        logoId,
      });
    },
  });

  const { form: slugForm, setInitialValues: setSlugInitialValues } = createMutationForm({
    schema: z.object({
      siteId: z.string(),
      name: dataSchemas.site.name,
      slug: dataSchemas.site.slug,
      themeColor: dataSchemas.site.themeColor,
      logoId: z.string(),
    }),
    mutation: async ({ slug }) => {
      invokeAlert({
        title: 'URL 주소를 변경하시겠어요?',
        content: 'URL 변경 시 기존에 이용하던 공유 링크, 페이지 연결이 끊어집니다.',
        actionText: '변경',
        action: async () =>
          // TODO: 사이트 바로가기 버튼 url 업데이트
          await updateSite({
            siteId: $query.site.id,
            name: $query.site.name,
            slug,
            themeColor: $query.site.themeColor,
            logoId: $query.site.logo?.id ?? '',
          }),
        variant: 'primary',
      });
    },
  });

  $: setInitialValues({
    siteId: $query.site.id,
    name: $query.site.name,
    slug: $query.site.slug,
    themeColor: $query.site.themeColor,
    logoId: $query.site.logo?.id ?? '',
  });

  $: setSlugInitialValues({
    siteId: $query.site.id,
    name: $query.site.name,
    slug: $query.site.slug,
    themeColor: $query.site.themeColor,
    logoId: $query.site.logo?.id ?? '',
  });
</script>

<div class={css({ paddingTop: '40px', paddingX: '34px', paddingBottom: '120px', width: 'full' })}>
  <h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>일반</h1>

  <form
    class={css({
      marginBottom: '8px',
      borderWidth: '1px',
      borderColor: 'border.primary',
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

    <div class={css({ position: 'relative', width: 'fit', _hover: { '& > div': { display: 'flex' } } })}>
      <button
        type="button"
        on:click={() => {
          inputEl.click();
        }}
      >
        {#if logo}
          <Img
            style={css.raw({ size: '64px', borderWidth: '1px', borderColor: 'border.image', borderRadius: '4px' })}
            $image={logo}
            alt="사이트 로고"
            size={64}
          />
        {:else}
          <LogoPlaceholder
            style={css.raw({ size: '64px', borderWidth: '1px', borderColor: 'border.image', borderRadius: '4px' })}
          />
        {/if}
      </button>

      <div
        class={css({
          position: 'absolute',
          top: '0',
          left: '0',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          color: 'neutral.0',
          backgroundColor: 'neutral.100/16',
          size: '64px',
          pointerEvents: 'none',
        })}
      >
        <Icon icon={UploadIcon} size={28} />
      </div>
    </div>

    <input
      bind:this={inputEl}
      class={css({ display: 'none' })}
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

        logo = resp;
        $data.logoId = resp.id;
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
      borderColor: 'border.primary',
      borderRadius: '10px',
      padding: '32px',
      width: 'full',
      maxWidth: '720px',
      backgroundColor: 'surface.primary',
    })}
    use:slugForm
  >
    <label
      class={css({
        display: 'block',
        marginBottom: '8px',
        textStyle: '14sb',
        color: { base: 'gray.700', _dark: 'gray.300' },
      })}
      for="slug"
    >
      URL
    </label>

    <div class={flex({ align: 'center' })}>
      <TextInput
        name="slug"
        style={css.raw({ borderTopRightRadius: '0', borderBottomRightRadius: '0', width: 'full' })}
        placeholder="URL을 입력해주세요"
      />

      <div
        class={css({
          borderWidth: '1px',
          borderLeftWidth: '0',
          borderColor: 'border.primary',
          borderTopRightRadius: '10px',
          borderBottomRightRadius: '10px',
          paddingX: '20px',
          paddingY: '10px',
          textStyle: '16m',
          color: 'text.tertiary',
          width: '100px',
          height: '43px',
          backgroundColor: 'surface.secondary',
        })}
      >
        /rdbl.io
      </div>
    </div>

    <div
      class={flex({
        align: 'center',
        justify: 'space-between',
        gap: '4px',
        height: '17px',
        textStyle: '12r',
        marginTop: '4px',
        color: { base: 'red.600', _dark: 'red.500' },
      })}
    >
      <div class={flex({ align: 'center', gap: '4px' })}>
        <FormValidationMessage for="slug" let:message>
          <Icon icon={InfoIcon} size={12} />
          {message}
        </FormValidationMessage>
      </div>
    </div>

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
