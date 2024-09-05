<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, HorizontalDivider, Icon, Modal, TextInput } from '@readable/ui/components';
  import { toast } from '@readable/ui/notification';
  import { onMount } from 'svelte';
  import CheckIcon from '~icons/lucide/check';
  import CopyIcon from '~icons/lucide/copy';
  import XIcon from '~icons/lucide/x';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { invokeAlert } from '$lib/components/invoke-alert';

  let open = false;

  let domain = '';
  let hostCopied = false;
  let valueCopied = false;

  $: query = graphql(`
    query SiteSettingsDomainPage_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        name

        logo {
          id
          ...Img_image
        }

        customDomain(state: ACTIVE) {
          id
          domain
          state
        }
      }
    }
  `);

  onMount(() => {
    domain = $query.site.customDomain?.domain ?? '';
  });

  const setSiteCustomDomain = graphql(`
    mutation SiteSettingsDomainPage_SetSiteCustomDomain_Mutation($input: SetSiteCustomDomainInput!) {
      setSiteCustomDomain(input: $input) {
        id
        domain
        state
      }
    }
  `);

  const unsetSiteCustomDomain = graphql(`
    mutation SiteSettingsDomainPage_UnsetSiteCustomDomain_Mutation($input: UnsetSiteCustomDomainInput!) {
      unsetSiteCustomDomain(input: $input) {
        id
        domain
        state
      }
    }
  `);
</script>

<div class={css({ paddingTop: '40px', paddingX: '34px', paddingBottom: '120px', width: 'full' })}>
  <h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>커스텀 도메인</h1>

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
    on:submit|preventDefault={() => (open = true)}
  >
    <label
      class={css({
        display: 'block',
        marginBottom: '8px',
        textStyle: '14sb',
        color: { base: 'gray.700', _dark: 'gray.300' },
      })}
      for="domain"
    >
      커스텀 도메인 URL
    </label>

    <TextInput
      name="domain"
      disabled={!!$query.site.customDomain}
      placeholder="도메인 주소를 입력해주세요"
      bind:value={domain}
    />

    {#if $query.site.customDomain}
      <Button
        style={css.raw({ marginTop: '35px', marginLeft: 'auto' })}
        size="lg"
        variant="danger-fill"
        on:click={async () => {
          invokeAlert({
            title: '설정하신 DNS 레코드로 도메인을 제거하시겠어요?',
            content: 'URL 변경 시 기존에 이용하던 공유 링크, 페이지 연결이 끊어지니 주의해주세요',
            actionText: '제거',
            action: async () => {
              if ($query.site.customDomain)
                await unsetSiteCustomDomain({ siteCustomDomainId: $query.site.customDomain.id });
            },
          });
        }}
      >
        제거
      </Button>
    {:else}
      <Button style={css.raw({ marginTop: '29px', marginLeft: 'auto' })} size="lg" type="submit">변경</Button>
    {/if}
  </form>
</div>

<Modal style={css.raw({ width: '600px' })} close={() => (open = false)} bind:open>
  <div
    class={flex({
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingX: '32px',
      paddingY: '20px',
      borderBottomWidth: '1px',
      borderColor: 'border.secondary',
    })}
  >
    <div class={flex({ alignItems: 'center', gap: '8px' })}>
      {#if $query.site.logo}
        <Img
          style={css.raw({
            borderWidth: '1px',
            borderColor: 'border.image',
            borderRadius: 'full',
            size: '20px',
          })}
          $image={$query.site.logo}
          alt={`${$query.site.name}의 아바타`}
          size={24}
        />
      {/if}
      <h2 class={css({ textStyle: '16sb' })}>DNS 레코드를 추가해주세요</h2>
    </div>
    <button type="button" on:click={() => (open = false)}>
      <Icon icon={XIcon} size={20} />
    </button>
  </div>

  <div class={flex({ direction: 'column', gap: '20px', paddingX: '32px', paddingY: '24px' })}>
    <div class={css({ textStyle: '13r', color: 'text.tertiary' })}>
      <p>사용중인 도메인 관리 페이지에서 다음 DNS 레코드를 추가해 주시기 바랍니다.</p>
      <p>1. CNAME 레코드에는 'www'를 쓰고 도메인 이름을 입력해주세요.</p>
      <p>2. TXT 레코드에 '@'를 쓰고 옆에 'verify=abc123xyz'를 넣어주세요.</p>
    </div>

    <HorizontalDivider />

    <dl
      class={flex({
        '& > div > dt': {
          paddingX: '16px',
          paddingY: '10px',
          textStyle: '15sb',
          color: 'text.tertiary',
          backgroundColor: 'neutral.10',
        },
        '& > div > dd': {
          borderYWidth: '1px',
          borderColor: 'divider.primary',
          paddingX: '16px',
          paddingY: '12px',
          color: 'text.secondary',
        },
      })}
    >
      <div>
        <dt>Type</dt>
        <dd>CNAME</dd>
      </div>

      <div class={css({ flex: '1', truncate: true })}>
        <dt>Host</dt>
        <dd class={flex({ align: 'center', gap: '8px' })}>
          <span class={css({ truncate: true })}>{domain}</span>
          <button
            type="button"
            on:click={() => {
              try {
                navigator.clipboard.writeText(domain);
                hostCopied = true;

                setTimeout(() => {
                  hostCopied = false;
                }, 1000);
              } catch (err) {
                toast('클립보드 복사를 실패했어요');
                console.error(err);
              }
            }}
          >
            <Icon style={css.raw({ color: 'neutral.40' })} icon={hostCopied ? CheckIcon : CopyIcon} size={14} />
          </button>
        </dd>
      </div>

      <div>
        <dt>Value</dt>
        <dd class={flex({ align: 'center', gap: '8px' })}>
          <span>{env.PUBLIC_USERSITE_CNAME_HOST}</span>
          <button
            type="button"
            on:click={() => {
              try {
                navigator.clipboard.writeText(env.PUBLIC_USERSITE_CNAME_HOST);
                valueCopied = true;

                setTimeout(() => {
                  valueCopied = false;
                }, 1000);
              } catch (err) {
                toast('클립보드 복사를 실패했어요');
                console.error(err);
              }
            }}
          >
            <Icon style={css.raw({ color: 'neutral.40' })} icon={valueCopied ? CheckIcon : CopyIcon} size={14} />
          </button>
        </dd>
      </div>
    </dl>

    <Button
      size="lg"
      type="button"
      on:click={() => {
        invokeAlert({
          title: '설정하신 DNS 레코드로 도메인을 설정하시겠어요?',
          content: 'URL 변경 시 기존에 이용하던 공유 링크, 페이지 연결이 끊어지니 주의해주세요',
          actionText: '변경',
          action: async () => {
            await setSiteCustomDomain({ domain, siteId: $query.site.id });
          },
          variant: 'primary',
        });
      }}
    >
      설정
    </Button>
  </div>
</Modal>
