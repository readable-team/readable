<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Helmet } from '@readable/ui/components';
  import { graphql } from '$graphql';
  import EnrollPlanWithCardModal from '../@modals/EnrollPlanWithCardModal.svelte';
  import PlanUpgradeModal from '../@modals/PlanUpgradeModal.svelte';

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

  let isPlanUpgradeModalOpen = false;
  let isEnrollPlanWithCardModalOpen = false;

  let selectedPlanCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY';
</script>

<Helmet title="플랜" trailing={$query.team.name} />

<h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>플랜</h1>

<div class={flex({ flexDirection: 'column', gap: '8px' })}>
  <div
    class={css({
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '10px',
      padding: '32px',
      backgroundColor: 'surface.primary',
    })}
  >
    <div class={flex({ flexDirection: 'column', gap: '8px' })}>
      <div class={css({ textStyle: '14sb', color: 'text.secondary' })}>현재 이용중인 플랜</div>
      <div class={flex({ justifyContent: 'space-between', alignItems: 'center' })}>
        <div class={css({ textStyle: '20b' })}>{$query.team.plan.plan.name}</div>
      </div>
    </div>
  </div>

  {#if $query.team.plan.plan.id !== 'PLAN00000000PRO'}
    <div
      class={css({
        borderWidth: '1px',
        borderColor: 'border.primary',
        borderRadius: '10px',
        padding: '32px',
        backgroundColor: 'surface.primary',
      })}
    >
      <div class={flex({ flexDirection: 'column', gap: '8px' })}>
        <div class={css({ textStyle: '14sb', color: 'text.secondary' })}>Pro 플랜 업그레이드</div>
        <Button size="md" variant="primary" on:click={() => (isPlanUpgradeModalOpen = true)}>
          Pro 플랜 업그레이드
        </Button>
      </div>
    </div>
  {/if}
</div>

<PlanUpgradeModal
  confirm={(cycle) => {
    isPlanUpgradeModalOpen = false;
    isEnrollPlanWithCardModalOpen = true;
    selectedPlanCycle = cycle;
  }}
  bind:open={isPlanUpgradeModalOpen}
/>

<EnrollPlanWithCardModal
  planCycle={selectedPlanCycle}
  teamId={$query.team.id}
  bind:open={isEnrollPlanWithCardModalOpen}
/>
