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
  import FullLogo from '$assets/logos/full.svg?component';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { accessToken } from '$lib/graphql';

  $: query = graphql(`
    query NewPage_Query {
      me @required {
        id
        name
        email

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

  const { form, data } = createMutationForm({
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
    style={flex.raw({ align: 'center', gap: '6px', paddingLeft: '10px' })}
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

  <div class={css({ textStyle: '14m' })}>
    <p class={css({ color: 'neutral.80' })}>계정</p>
    <p>{$query.me.email}</p>
  </div>
</header>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    gap: '32px',
    margin: 'auto',
    paddingBottom: '64px',
    width: 'full',
    maxWidth: '576px',
  })}
>
  <FullLogo class={css({ height: '20px' })} />

  <div>
    <h1 class={css({ marginBottom: '12px', textStyle: '28b', textAlign: 'center' })}>
      {$query.me.name}님, 환영해요!
      <br />
      팀을 만들어 주세요.
    </h1>
    <p class={css({ textStyle: '16m', color: 'neutral.80' })}>
      팀에서는 팀원들을 초대해 사이트를 함께 관리할 수 있어요
    </p>
  </div>

  <form
    class={flex({
      direction: 'column',
      borderRadius: '8px',
      padding: '24px',
      width: 'full',
      boxShadow: 'emphasize',
    })}
    use:form
  >
    <input name="teamId" type="hidden" />
    <FormField name="name" description="설정에서 언제든지 변경할 수 있어요." label="사이트 이름 *">
      <TextInput placeholder="예: ACME 도움센터" />
      <svelte:fragment slot="right-text">{$data.name?.length ?? 0}/50</svelte:fragment>
    </FormField>

    <HorizontalDivider style={css.raw({ marginY: '32px' })} />

    <p class={css({ marginBottom: '4px', textStyle: '14b', color: 'neutral.80' })}>어떤 목적으로 도입하나요?</p>

    <Menu placement="bottom" setFullWidth>
      <div
        slot="button"
        class={flex({
          align: 'center',
          justify: 'space-between',
          borderWidth: '1px',
          borderColor: { base: 'gray.200', _dark: 'darkgray.700' },
          borderRadius: '8px',
          paddingX: '12px',
          paddingY: '9px',
          width: 'full',
        })}
      >
        <span
          class={css({ textStyle: '14m' }, purpose === '' && { color: { base: 'gray.500', _dark: 'darkgray.400' } })}
        >
          {purpose === '' ? '선택' : purpose}
        </span>
        <Icon style={css.raw({ color: { base: 'gray.500', _dark: 'darkgray.400' } })} icon={ChevronDownIcon} />
      </div>

      <MenuItem on:click={() => (purpose = '고객용 도움센터 제작')}>고객용 도움센터 제작</MenuItem>
      <MenuItem on:click={() => (purpose = '개발자 문서 제작')}>개발자 문서 제작</MenuItem>
      <MenuItem on:click={() => (purpose = '사내 문서 제작')}>사내 문서 제작</MenuItem>
      <MenuItem on:click={() => (purpose = '그냥 써 보는 중')}>그냥 써 보는 중</MenuItem>
      <MenuItem on:click={() => (purpose = '기타')}>기타</MenuItem>
      <MenuItem on:click={() => (purpose = '응답하고 싶지 않음')}>응답하고 싶지 않음</MenuItem>
    </Menu>

    <p class={css({ marginTop: '24px', marginBottom: '4px', textStyle: '14b', color: 'neutral.80' })}>
      {$query.me.name}님의 직군을 선택해 주세요.
    </p>

    <Menu setFullWidth>
      <div
        slot="button"
        class={flex({
          align: 'center',
          justify: 'space-between',
          borderWidth: '1px',
          borderColor: { base: 'gray.200', _dark: 'darkgray.700' },
          borderRadius: '8px',
          paddingX: '12px',
          paddingY: '9px',
          width: 'full',
        })}
      >
        <span
          class={css({ textStyle: '14m' }, jobRole === '' && { color: { base: 'gray.500', _dark: 'darkgray.400' } })}
        >
          {jobRole === '' ? '선택' : jobRole}
        </span>
        <Icon style={css.raw({ color: { base: 'gray.500', _dark: 'darkgray.400' } })} icon={ChevronDownIcon} />
      </div>

      <MenuItem on:click={() => (jobRole = '기획/마케팅')}>기획/마케팅</MenuItem>
      <MenuItem on:click={() => (jobRole = '운영/고객지원')}>운영/고객지원</MenuItem>
      <MenuItem on:click={() => (jobRole = '개발')}>개발</MenuItem>
      <MenuItem on:click={() => (jobRole = '디자인')}>디자인</MenuItem>
      <MenuItem on:click={() => (jobRole = '1인 사업자/프리랜서')}>1인 사업자/프리랜서</MenuItem>
      <MenuItem on:click={() => (jobRole = '기타')}>기타</MenuItem>
      <MenuItem on:click={() => (jobRole = '응답하고 싶지 않음')}>응답하고 싶지 않음</MenuItem>
    </Menu>

    <Button style={css.raw({ marginTop: '32px', width: 'full' })} size="lg" type="submit">만들기</Button>
  </form>
</div>
