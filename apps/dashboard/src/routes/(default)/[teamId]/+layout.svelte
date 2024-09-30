<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import mixpanel from 'mixpanel-browser';
  import { onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { graphql } from '$graphql';
  import {
    isEnrollPlanWithCardModalOpen,
    isPlanUpgradeModalOpen,
    isPro,
    selectedPlanCycle,
  } from '$lib/svelte/stores/ui';
  import Header from './@header/Header.svelte';
  import EnrollPlanWithCardModal from './@modals/EnrollPlanWithCardModal.svelte';
  import PlanUpgradeModal from './@modals/PlanUpgradeModal.svelte';

  $: query = graphql(`
    query TeamLayout_Query($teamId: ID!) {
      ...Header_query

      team(teamId: $teamId) {
        id
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

  const teamUpdateStream = graphql(`
    subscription TeamLayout_TeamUpdateStream_Subscription($teamId: ID!) {
      teamUpdateStream(teamId: $teamId) {
        ... on Team {
          id
          name
          ...SiteSwitcher_team

          meAsMember {
            id
            role
          }

          members {
            id
            role
            isSoleAdmin
          }

          invitations {
            id
          }
        }

        ... on TeamMember {
          id
        }
      }
    }
  `);

  $: isPro.set($query.team.plan.plan.id === 'PLAN00000000PRO');

  let unsubscribe: (() => void) | null = null;

  $: if (browser) {
    unsubscribe?.();

    unsubscribe = teamUpdateStream.subscribe({
      teamId: $query.team.id,
    });

    mixpanel.register({
      team_id: $query.team.id,
    });
  }

  onDestroy(() => {
    mixpanel.unregister('team_id');
    unsubscribe?.();
  });
</script>

<div class={flex({ flexDirection: 'column', height: 'screen' })}>
  <Header {$query} />

  <slot />
</div>

<PlanUpgradeModal
  confirm={(cycle) => {
    $isPlanUpgradeModalOpen = false;
    $isEnrollPlanWithCardModalOpen = true;
    $selectedPlanCycle = cycle;

    mixpanel.track('plan:upgrade:confirm');
  }}
  planCycle={$selectedPlanCycle}
  bind:open={$isPlanUpgradeModalOpen}
/>

<EnrollPlanWithCardModal
  planCycle={$selectedPlanCycle}
  teamId={$query.team.id}
  bind:open={$isEnrollPlanWithCardModalOpen}
/>
