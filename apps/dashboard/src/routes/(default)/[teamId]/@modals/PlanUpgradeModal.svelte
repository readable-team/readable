<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button } from '@readable/ui/components';
  import { TitledModal } from '$lib/components';
  import PlanCycleToggle from './PlanCycleToggle.svelte';

  export let open = false;
  export let confirm: (cycle: 'MONTHLY' | 'YEARLY') => void;
  export let planCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY';
</script>

<TitledModal bind:open>
  <svelte:fragment slot="title">Pro 플랜으로 업그레이드</svelte:fragment>

  <div class={flex({ flexDirection: 'column', gap: '20px' })}>
    <p class={css({ textStyle: '14r', color: 'text.tertiary' })}>
      Pro 플랜으로 업그레이드하면 모든 기능을 이용할 수 있습니다.
    </p>
    <PlanCycleToggle defaultValue={planCycle} on:select={(cycle) => (planCycle = cycle.detail)} />
    <table
      class={css({
        'width': 'full',
        '& tr': { height: '50px' },
        '& td, & th': { borderBottomWidth: '1px', borderColor: 'divider.primary', paddingX: '12px' },
      })}
    >
      <tbody>
        <tr>
          <th class={css({ textAlign: 'left', color: 'text.primary', textStyle: '15b' })}>예상 요금</th>
          <td class={css({ textAlign: 'right', color: 'text.primary', textStyle: '16eb' })}>
            {planCycle === 'MONTHLY' ? '33,000원' : '330,000원'}
          </td>
        </tr>
        <tr>
          <th class={css({ textAlign: 'left', color: 'text.secondary', textStyle: '14r' })}>Pro 플랜</th>
          <td class={css({ textAlign: 'right', color: 'text.primary', textStyle: '14sb' })}>
            {planCycle === 'MONTHLY' ? '30,000원' : '300,000원'}
          </td>
        </tr>
        <tr>
          <th class={css({ textAlign: 'left', color: 'text.secondary', textStyle: '14r' })}>부가가치세</th>
          <td class={css({ textAlign: 'right', color: 'text.primary', textStyle: '14sb' })}>
            {planCycle === 'MONTHLY' ? '3,000원' : '30,000원'}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Button style={css.raw({ width: 'full', marginTop: '40px' })} glossy size="lg" on:click={() => confirm(planCycle)}>
    확인 및 결제
  </Button>
</TitledModal>
