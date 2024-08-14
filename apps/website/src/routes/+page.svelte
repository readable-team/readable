<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Helmet } from '@readable/ui/components';
  import { env } from '$env/dynamic/public';
</script>

<Helmet title="5초만에 만드는 도움센터, 리더블" trailing={null} />

<div class={css({ fontSize: '32px', fontWeight: 'bold' })}>website</div>

<a href={env.PUBLIC_DASHBOARD_URL}>로그인</a>
