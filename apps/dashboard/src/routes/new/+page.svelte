<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, HorizontalDivider, Icon, Menu, MenuItem, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import mixpanel from 'mixpanel-browser';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import ChevronDownIcon from '~icons/lucide/chevron-down';
  import LogOutIcon from '~icons/lucide/log-out';
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { accessToken } from '$lib/graphql';

  $: query = graphql(`
    query NewPage_Query {
      me @required {
        id
        name
        email

        avatar {
          id
          ...Img_image
        }

        teams {
          id
        }
      }
    }
  `);

  const logout = graphql(`
    mutation NewPage_Logout_Mutation {
      logout
    }
  `);

  const createDefaultTeam = graphql(`
    mutation NewPage_CreateDefaultTeam_Mutation {
      createDefaultTeam {
        id
      }
    }
  `);

  const createSite = graphql(`
    mutation NewPage_CreateSite_Mutation($input: CreateSiteInput!) {
      createSite(input: $input) {
        id
      }
    }
  `);

  const { form } = createMutationForm({
    mutation: async ({ name }) => {
      const team = await createDefaultTeam();
      return await createSite({ teamId: team.id, name });
    },
    schema: z.object({
      teamId: dataSchemas.team.id,
      name: dataSchemas.site.name,
    }),
    onSuccess: (resp) => {
      goto(`/${resp.id}`);
    },
  });

  let purpose = '';
  let jobRole = '';
</script>

<header
  class={flex({ align: 'center', justify: 'space-between', paddingTop: '24px', paddingX: '24px', height: '64px' })}
>
  <Button
    style={flex.raw({ align: 'center', gap: '6px', paddingLeft: '10px', textStyle: '14b' })}
    size="sm"
    variant="secondary"
    on:click={async () => {
      await logout();

      $accessToken = null;
      mixpanel.reset();

      location.href = env.PUBLIC_WEBSITE_URL;
    }}
  >
    <Icon icon={LogOutIcon} />
    <span>로그아웃</span>
  </Button>

  <div class={flex({ align: 'center', gap: '10px' })}>
    <div
      class={css({ flex: 'none', borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '34px' })}
    >
      <Img
        style={css.raw({ borderRadius: 'full', size: '34px' })}
        $image={$query.me.avatar}
        alt="{$query.me.name}의 아바타"
        size={48}
      />
    </div>
    <div>
      <p class={css({ textStyle: '14m', color: 'text.secondary' })}>{$query.me.name}</p>
      <p class={css({ textStyle: '13r', color: 'text.tertiary' })}>{$query.me.email}</p>
    </div>
  </div>
</header>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    gap: '40px',
    margin: 'auto',
    paddingBottom: '64px',
    width: 'full',
    maxWidth: '432px',
  })}
>
  <div>
    <h1 class={css({ marginBottom: '4px', textStyle: '26sb', textAlign: 'center' })}>사이트를 만들어보세요</h1>
    <p class={css({ textStyle: '15r', color: 'text.secondary' })}>
      도움센터, 업데이트노트, 개발자 문서 등 다양한 사이트를 제작해보세요
    </p>
  </div>

  <form class={css({ width: 'full' })} use:form>
    <div
      class={flex({
        direction: 'column',
        borderRadius: '16px',
        paddingTop: '24px',
        paddingX: '20px',
        paddingBottom: '36px',
        boxShadow: 'strong',
      })}
    >
      <input name="teamId" type="hidden" />
      <FormField name="name" description="설정에서 언제든지 변경할 수 있어요" label="사이트 이름 *">
        <TextInput placeholder="ACME 도움센터" />
      </FormField>

      <HorizontalDivider style={css.raw({ marginTop: '12px', marginBottom: '24px' })} />

      <p class={css({ marginBottom: '8px', textStyle: '14sb', color: { base: 'gray.700', _dark: 'darkgray.300' } })}>
        도입 목적
      </p>

      <Menu placement="bottom" setFullWidth>
        <div
          slot="button"
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outlineWidth: '1px',
              outlineColor: { base: 'gray.200', _dark: 'darkgray.700' },
              borderRadius: '8px',
              paddingX: '16px',
              paddingY: '6px',
              width: 'full',
              _hover: { outlineColor: { base: 'brand.400', _dark: 'brand.300' } },
            },
            open && {
              outlineWidth: '2px',
              outlineColor: { base: 'brand.600', _dark: 'brand.500' },
              backgroundColor: { base: 'red.100', _dark: '[#880808/20]' },
            },
          )}
          let:open
        >
          <span
            class={css({ textStyle: '16r' }, purpose === '' && { color: { base: 'gray.600', _dark: 'darkgray.400' } })}
          >
            {purpose === '' ? '선택' : purpose}
          </span>
          <Icon style={css.raw({ color: 'neutral.50' })} icon={ChevronDownIcon} size={18} />
        </div>

        <MenuItem on:click={() => (purpose = '고객용 도움센터')}>고객용 도움센터</MenuItem>
        <MenuItem on:click={() => (purpose = '업데이트 노트')}>업데이트 노트</MenuItem>
        <MenuItem on:click={() => (purpose = '개발자 문서')}>개발자 문서</MenuItem>
        <MenuItem on:click={() => (purpose = '사내 문서')}>사내 문서</MenuItem>
        <MenuItem on:click={() => (purpose = '기타')}>기타</MenuItem>
      </Menu>

      <p
        class={css({
          marginTop: '24px',
          marginBottom: '8px',
          textStyle: '14sb',
          color: { base: 'gray.700', _dark: 'darkgray.300' },
        })}
      >
        직군
      </p>

      <Menu setFullWidth>
        <div
          slot="button"
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outlineWidth: '1px',
              outlineColor: { base: 'gray.200', _dark: 'darkgray.700' },
              borderRadius: '8px',
              paddingX: '16px',
              paddingY: '6px',
              width: 'full',
              _hover: { outlineColor: { base: 'brand.400', _dark: 'brand.300' } },
            },
            open && {
              outlineWidth: '2px',
              outlineColor: { base: 'brand.600', _dark: 'brand.500' },
              backgroundColor: { base: 'red.100', _dark: '[#880808/20]' },
            },
          )}
          let:open
        >
          <span
            class={css({ textStyle: '16r' }, purpose === '' && { color: { base: 'gray.600', _dark: 'darkgray.400' } })}
          >
            {jobRole === '' ? '선택' : jobRole}
          </span>
          <Icon style={css.raw({ color: 'neutral.50' })} icon={ChevronDownIcon} size={18} />
        </div>

        <MenuItem on:click={() => (jobRole = '운영/고객지원')}>운영/고객지원</MenuItem>
        <MenuItem on:click={() => (jobRole = '기획/마케팅')}>기획/마케팅</MenuItem>
        <MenuItem on:click={() => (jobRole = '개발')}>개발</MenuItem>
        <MenuItem on:click={() => (jobRole = '디자인')}>디자인</MenuItem>
        <MenuItem on:click={() => (jobRole = '1인 사업자/프리랜서')}>1인 사업자/프리랜서</MenuItem>
        <MenuItem on:click={() => (jobRole = '기타')}>기타</MenuItem>
      </Menu>
    </div>

    <div
      class={css({
        position: 'relative',
        marginTop: '20px',
      })}
    >
      <Button style={css.raw({ width: 'full' })} size="lg" type="submit">시작하기</Button>
      <div
        class={css({
          position: 'absolute',
          top: '0',
          left: '0',
          size: 'full',
          borderRadius: '10px',
          bgGradient: 'to-r',
          gradientFrom: 'white/20',
          gradientTo: 'white/0',
          pointerEvents: 'none',
        })}
      />
    </div>
  </form>
</div>
