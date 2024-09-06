<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import FileIcon from '~icons/lucide/file';
  import FilePenIcon from '~icons/lucide/file-pen';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query SitePage_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        hasPage
      }
    }
  `);
</script>

<div class={flex({ direction: 'column', align: 'center', justify: 'center', gap: '24px', width: 'full' })}>
  <Icon style={css.raw({ size: '60px' })} icon={$query.site.hasPage ? FileIcon : FilePenIcon} />
  <div class={css({ textAlign: 'center' })}>
    <h1 class={css({ textStyle: '22b', marginBottom: '4px' })}>
      {$query.site.hasPage ? '페이지를 선택해주세요' : '페이지를 추가해 글을 작성해보세요'}
    </h1>
    {#if !$query.site.hasPage}
      <p class={css({ textStyle: '15r', color: 'text.secondary' })}>
        왼쪽의 ‘페이지 추가' 버튼을 클릭해 새 페이지를 작성해주세요
      </p>
    {/if}
  </div>
</div>
