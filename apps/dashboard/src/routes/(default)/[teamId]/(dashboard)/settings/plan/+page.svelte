<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Helmet, Icon, SegmentButtons, Tooltip } from '@readable/ui/components';
  import CheckIcon from '~icons/lucide/check';
  import InfoIcon from '~icons/lucide/info';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { isPlanUpgradeModalOpen, selectedPlanCycle } from '$lib/svelte/stores/ui';

  $: query = graphql(`
    query TeamSettingsPlanPage_Query($teamId: ID!) {
      team(teamId: $teamId) {
        id
        name

        plan {
          id

          plan {
            id
            name
          }
        }
      }
    }
  `);

  const onSelect = (value: CustomEvent<string>) => {
    selectedPlanCycle.set(value.detail as 'MONTHLY' | 'YEARLY');
  };

  const usages = [
    {
      title: '멤버',
      basic: '1명',
      pro: '무제한',
      enterprise: '무제한',
    },
    {
      title: '사이트',
      basic: '1개',
      pro: '무제한',
      enterprise: '무제한',
    },
    {
      title: '페이지뷰',
      basic: '5,000',
      pro: '무제한',
      enterprise: '무제한',
    },
    {
      title: '페이지',
      basic: '무제한',
      pro: '무제한',
      enterprise: '무제한',
    },
    {
      title: '검색',
      basic: '일반',
      pro: '일반 + AI',
      enterprise: '일반 + AI',
    },
  ];

  const premiums = [
    {
      title: '브랜딩',
      basic: '',
      pro: CheckIcon,
      enterprise: CheckIcon,
    },
    {
      title: '커스텀 도메인',
      basic: '',
      pro: CheckIcon,
      enterprise: CheckIcon,
    },
    {
      title: '콘텐츠 최신화(예정)',
      basic: '',
      pro: '무제한',
      enterprise: '무제한',
    },
    {
      title: '커스텀 플랜',
      basic: '',
      pro: '',
      enterprise: CheckIcon,
    },
    {
      title: '24/7 지원',
      basic: '',
      pro: '',
      enterprise: CheckIcon,
    },
    {
      title: '감사 로그',
      basic: '',
      pro: '',
      enterprise: CheckIcon,
    },
    {
      title: '맞춤형 기능 개발',
      basic: '',
      pro: '',
      enterprise: CheckIcon,
    },
    {
      title: '전담 담당자 배정',
      basic: '',
      pro: '',
      enterprise: CheckIcon,
    },
  ];

  $: addOns = [
    {
      title: '화이트 라벨링',
      basic: '',
      pro: `${$selectedPlanCycle === 'YEARLY' ? '18,333' : '22,000'}원/사이트/월`,
      enterprise: CheckIcon,
    },
  ];
</script>

<Helmet title="플랜" trailing={$query.team.name} />

<h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>플랜 요금제</h1>

<div class={flex({ flexDirection: 'column', gap: '8px' })}>
  <div
    class={css({
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '10px',
      paddingTop: '54px',
      paddingX: '32px',
      paddingBottom: '32px',
      backgroundColor: 'surface.primary',
    })}
  >
    <table class={css({ width: 'full', borderSpacing: '0' })}>
      <thead>
        <tr>
          <th class={css({ width: '128px' })} />
          <th />
          <th>
            <div class={css({ position: 'relative', marginBottom: '10px' })}>
              <SegmentButtons
                defaultValue="YEARLY"
                items={[
                  { label: '월 결제', value: 'MONTHLY' },
                  { label: '연 결제', value: 'YEARLY' },
                ]}
                size="sm"
                on:select={onSelect}
              />
              <div
                class={css({
                  position: 'absolute',
                  top: '-26px',
                  right: '0',
                  borderRadius: 'full',
                  paddingX: '8px',
                  paddingY: '3px',
                  textStyle: '11sb',
                  color: 'white',
                  backgroundColor: 'neutral.80',
                })}
              >
                2달 무료
              </div>
            </div>
          </th>
          <th />
        </tr>
        <tr class={css({ '& > th': { paddingX: '12px', paddingY: '20px', textAlign: 'left' } })}>
          <th />
          <th class={css({ width: '160px' })}>
            <p class={css({ marginBottom: '4px', textStyle: '13m' })}>Basic</p>
            <span class={css({ textStyle: '20b' })}>무료</span>
            <Button
              style={flex.raw({ align: 'center', gap: '6px', marginTop: '40px', width: 'full' })}
              disabled
              size="sm"
              variant="secondary"
            >
              {#if $query.team.plan.plan.id === 'PLAN000000BASIC'}
                <span>현재 플랜</span>
              {:else}
                <span>다운그레이드</span>
                <!-- TODO: 다운그레이드 툴팁 문구 수정 -->
                <Tooltip message="플랜 다운그레이드는 문의해주세요">
                  <Icon icon={InfoIcon} />
                </Tooltip>
              {/if}
            </Button>
          </th>
          <th class={css({ borderTopRadius: '10px', backgroundColor: 'neutral.10', width: '160px' })}>
            <p class={flex({ align: 'center', justify: 'space-between', marginBottom: '4px', textStyle: '13m' })}>
              <span>Pro</span>
              <span
                class={css({
                  borderRadius: '4px',
                  paddingX: '6px',
                  paddingY: '2px',
                  textStyle: '11b',
                  color: 'text.accent',
                  backgroundColor: 'accent.10',
                })}
              >
                추천
              </span>
            </p>
            <span class={css({ textStyle: '20b' })}>{$selectedPlanCycle === 'YEARLY' ? '27,500' : '33,000'}</span>
            <Button
              style={css.raw({ marginTop: '40px', width: 'full' })}
              disabled={$query.team.plan.plan.id === 'PLAN00000000PRO'}
              glossy
              size="sm"
              variant="primary"
              on:click={() => {
                if ($query.team.plan.plan.id !== 'PLAN00000000PRO') {
                  $isPlanUpgradeModalOpen = true;
                }
              }}
            >
              {$query.team.plan.plan.id === 'PLAN00000000PRO' ? '현재 플랜' : '업그레이드'}
            </Button>
          </th>
          <th class={css({ width: '160px' })}>
            <p class={css({ marginBottom: '4px', textStyle: '13m' })}>Enterprise</p>
            <span class={css({ textStyle: '20b' })}>문의</span>
            <Button
              style={css.raw({ marginTop: '40px', width: 'full' })}
              href={`${env.PUBLIC_WEBSITE_URL}/contact`}
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              type="link"
              variant="secondary"
            >
              문의
            </Button>
          </th>
        </tr>
      </thead>
      <tbody
        class={css({
          '& > tr > td': {
            paddingX: '12px',
            paddingY: '10px',
            color: 'text.secondary',
          },
        })}
      >
        <tr class={css({ '& > td': { borderBottomWidth: '1px' } })}>
          <td class={css({ textStyle: '13sb' })}>Usage</td>
          <td />
          <td class={css({ backgroundColor: 'neutral.10' })} />
          <td />
        </tr>
        {#each usages as usage (usage.title)}
          <tr class={css({ '& > td': { borderBottomWidth: '1px', textStyle: '13r' } })}>
            <td class={flex({ align: 'center', gap: '4px' })}>
              {usage.title}
              {#if usage.title === '페이지뷰'}
                <Tooltip message="1개월간 총 5,000회의 페이지 조회를 지원합니다">
                  <Icon icon={InfoIcon} size={14} />
                </Tooltip>
              {/if}
            </td>
            <td>{usage.basic}</td>
            <td class={css({ backgroundColor: 'neutral.10' })}>{usage.pro}</td>
            <td>{usage.enterprise}</td>
          </tr>
        {/each}
        <tr>
          <td>&nbsp;</td>
          <td />
          <td class={css({ backgroundColor: 'neutral.10' })} />
          <td />
        </tr>
        <tr class={css({ '& > td': { borderBottomWidth: '1px' } })}>
          <td class={css({ textStyle: '13sb' })}>Premium</td>
          <td />
          <td class={css({ backgroundColor: 'neutral.10' })} />
          <td />
        </tr>
        {#each premiums as premium (premium.title)}
          <tr class={css({ '& > td': { borderBottomWidth: '1px', textStyle: '13r' } })}>
            <td>{premium.title}</td>
            <td>{premium.basic}</td>
            <td class={css({ backgroundColor: 'neutral.10' })}>
              {#if typeof premium.pro === 'string'}
                {premium.pro}
              {:else}
                <Icon icon={premium.pro} size={14} />
              {/if}
            </td>
            <td>
              {#if typeof premium.enterprise === 'string'}
                {premium.enterprise}
              {:else}
                <Icon icon={premium.enterprise} size={14} />
              {/if}
            </td>
          </tr>
        {/each}
        <tr>
          <td>&nbsp;</td>
          <td />
          <td class={css({ backgroundColor: 'neutral.10' })} />
          <td />
        </tr>
        <tr class={css({ '& > td': { borderBottomWidth: '1px' } })}>
          <td class={css({ textStyle: '13sb' })}>Add-on</td>
          <td />
          <td class={css({ backgroundColor: 'neutral.10' })} />
          <td />
        </tr>
        {#each addOns as addOn (addOn.title)}
          <tr class={css({ '& > td': { borderBottomWidth: '1px', textStyle: '13r' } })}>
            <td>{addOn.title}</td>
            <td>{addOn.basic}</td>
            <td class={css({ backgroundColor: 'neutral.10' })}>
              {#if typeof addOn.pro === 'string'}
                {addOn.pro}
              {:else}
                <Icon icon={addOn.pro} size={14} />
              {/if}
            </td>
            <td>
              {#if typeof addOn.enterprise === 'string'}
                {addOn.enterprise}
              {:else}
                <Icon icon={addOn.enterprise} size={14} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
