<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import FileSearchIcon from '~icons/lucide/file-search';
</script>

<div
  class={flex({
    width: 'full',
    height: 'full',
    direction: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  })}
>
  <Icon style={css.raw({ width: '60px', height: '60px' })} icon={FileSearchIcon} />

  <div class={flex({ direction: 'column', alignItems: 'center', gap: '2px' })}>
    <h1 class={css({ fontSize: '22px', fontWeight: 'bold' })}>존재하지 않는 페이지입니다</h1>
    <p class={css({ textAlign: 'center', fontSize: '15px', color: 'text.secondary' })}>
      페이지의 주소가 잘못 입력되었거나 존재하지 않는 페이지에요.
      <br />
      입력한 주소를 다시 한 번 확인해주세요.
    </p>
  </div>

  <Button href="/" size="lg" type="link" variant="secondary">홈으로 이동</Button>
</div>
