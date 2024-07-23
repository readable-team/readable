<script lang="ts">
  import { page } from '$app/stores';

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  $: code = $page.error!.code;
</script>

{#if code === 'site_not_found'}
  <h1>사이트를 찾을 수 없어요</h1>
  <p>이 주소에는 사이트가 설정되어 있지 않아요</p>
{:else}
  <h1>Error</h1>
  <p>An error occurred.</p>
{/if}
