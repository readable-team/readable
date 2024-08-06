<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Chip, Icon, Menu, MenuItem } from '@readable/ui/components';
  import ClockIcon from '~icons/lucide/clock';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import TrashIcon from '~icons/lucide/trash';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import { pageUrl } from '$lib/utils/url';
  import type { PagePage_PageMenuBar_query } from '$graphql';

  export let _query: PagePage_PageMenuBar_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment PagePage_PageMenuBar_query on Query {
        page(pageId: $pageId) {
          id
          hasUnpublishedChanges
          slug

          content {
            title
          }

          parent {
            id
          }

          site {
            id
            url
          }
        }
      }
    `),
  );

  const publishPage = graphql(`
    mutation PagePage_PublishPage_Mutation($input: PublishPageInput!) {
      publishPage(input: $input) {
        id
        state
      }
    }
  `);

  const deletePage = graphql(`
    mutation PagePage_DeletePage_Mutation($input: DeletePageInput!) {
      deletePage(input: $input) {
        id
      }
    }
  `);

  const onDeletePage = async () => {
    await deletePage({ pageId: $query.page.id });
    if ($query.page.parent?.id) {
      goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
    } else {
      goto(`/${$query.page.site.id}`);
    }
  };
</script>

<div
  class={flex({
    position: 'sticky',
    top: '0',
    width: 'full',
    height: '58px',
    backgroundColor: 'surface.tertiary',
    alignItems: 'center',
  })}
>
  <div
    class={flex({
      marginLeft: 'auto',
      gap: '8px',
      paddingX: '12px',
      paddingY: '10px',
      alignItems: 'center',
    })}
  >
    {#if $query.page.hasUnpublishedChanges}
      <Chip>발행되지 않은 수정사항 있음</Chip>
    {/if}
    <span
      class={css({
        color: 'text.tertiary',
        textStyle: '14sb',
      })}
    >
      x일 전 발행됨
    </span>
    <div
      class={flex({
        paddingX: '12px',
        alignItems: 'center',
        gap: '10px',
      })}
    >
      <Button
        style={css.raw({
          paddingX: '9px',
        })}
        variant="secondary"
      >
        <Icon icon={ClockIcon} size={18} />
      </Button>

      <Menu listStyle={css.raw({ width: '148px' })} offset={16} placement="top-start">
        <Button
          slot="button"
          style={css.raw({
            paddingX: '9px',
          })}
          aria-pressed={open}
          variant="secondary"
          let:open
        >
          <Icon icon={EllipsisIcon} size={18} />
        </Button>

        <MenuItem>
          <Icon slot="prefix" icon={CopyIcon} size={20} />
          <span>복사</span>
        </MenuItem>
        <MenuItem variant="danger" on:click={onDeletePage}>
          <Icon slot="prefix" icon={TrashIcon} size={20} />
          <span>삭제</span>
        </MenuItem>
      </Menu>
    </div>

    <div
      class={flex({
        gap: '8px',
      })}
    >
      <Button href={pageUrl($query.page)} rel="noopener noreferrer" target="_blank" type="link" variant="secondary">
        <Icon icon={ExternalLinkIcon} size={18} />
      </Button>
      {#if $query.page.hasUnpublishedChanges}
        <Button
          on:click={async () => {
            await publishPage({ pageId: $query.page.id });
          }}
        >
          발행하기
        </Button>
      {:else}
        <Button disabled>발행됨</Button>
      {/if}
    </div>
  </div>
</div>
