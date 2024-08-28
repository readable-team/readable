<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, HorizontalDivider, Icon } from '@readable/ui/components';
  import CreditCardIcon from '~icons/lucide/credit-card';
</script>

<h1 class={css({ textStyle: '28eb' })}>구독 및 결제</h1>

<HorizontalDivider style={css.raw({ marginTop: '20px', marginBottom: '40px' })} />

<div
  class={flex({
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  })}
>
  <h2 class={css({ textStyle: '18sb', color: 'text.primary' })}>현재 플랜</h2>
  <Button style={css.raw({ flexShrink: 0 })} size="md" variant="secondary" on:click={() => alert('TODO')}>
    플랜 업그레이드
  </Button>
</div>

<div
  class={flex({
    padding: '24px',
    backgroundColor: 'surface.secondary',
    borderRadius: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: '1px',
    borderColor: 'border.primary',
  })}
>
  <div class={flex({ flexDirection: 'column', gap: '8px' })}>
    <span class={css({ textStyle: '20eb', color: 'text.primary' })}>Free 플랜</span>
    <span class={css({ textStyle: '14r', color: 'text.secondary' })}>기본 기능 무료 이용</span>
  </div>
  <div class={flex({ flexDirection: 'column', alignItems: 'flex-end', gap: '8px' })}>
    <span class={css({ textStyle: '24eb', color: 'text.primary' })}>₩0</span>
    <span class={css({ textStyle: '14r', color: 'text.secondary' })}>월</span>
  </div>
</div>

<HorizontalDivider style={css.raw({ marginTop: '20px', marginBottom: '40px' })} />

<div
  class={flex({
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  })}
>
  <h2 class={css({ textStyle: '18sb', color: 'text.primary' })}>결제 수단</h2>
  <Button style={css.raw({ flexShrink: 0 })} disabled size="md" variant="secondary">카드 변경</Button>
</div>

<div
  class={flex({
    flexDirection: 'column',
    gap: '8px',
    padding: '24px',
    backgroundColor: 'surface.secondary',
    borderRadius: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: '1px',
    borderColor: 'border.primary',
    color: 'text.tertiary',
  })}
>
  <Icon icon={CreditCardIcon} size={28} />
  <span class={css({ textStyle: '16r' })}>등록된 카드 정보가 없습니다.</span>
</div>
