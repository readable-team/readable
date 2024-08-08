<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Chip, Icon, Menu, MenuItem, Tooltip } from '@readable/ui/components';
  import dayjs from 'dayjs';
  import { PageState } from '@/enums';
  import ClockIcon from '~icons/lucide/clock';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import TrashIcon from '~icons/lucide/trash';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import Img from '$lib/components/Img.svelte';
  import { pageUrl } from '$lib/utils/url';
  import type { PagePage_PageMenuBar_query } from '$graphql';

  export let _query: PagePage_PageMenuBar_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment PagePage_PageMenuBar_query on Query {
        page(pageId: $pageId) {
          id
          state
          hasUnpublishedChanges
          hasUnpublishedParents
          lastPublishedAt
          slug

          contentContributor {
            id

            user {
              id

              avatar {
                id
                ...Img_image
              }
            }
          }

          content {
            id
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
        hasUnpublishedChanges
        lastPublishedAt
      }
    }
  `);

  const unpublishPage = graphql(`
    mutation PagePage_UnpublishPage_Mutation($input: UnpublishPageInput!) {
      unpublishPage(input: $input) {
        id
        state
        hasUnpublishedChanges
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

  const duplicatePage = graphql(`
    mutation PagePage_DuplicatePage_Mutation($input: DuplicatePageInput!) {
      duplicatePage(input: $input) {
        id
      }
    }
  `);
</script>

<div
  class={flex({
    gap: '8px',
    flex: 'none',
    paddingX: '12px',
    paddingY: '10px',
    alignItems: 'center',
  })}
>
  {#if $query.page.hasUnpublishedChanges}
    <Chip>발행되지 않은 수정사항 있음</Chip>
  {/if}
  {#if $query.page.lastPublishedAt && $query.page.state === PageState.PUBLISHED}
    <span
      class={css({
        color: 'text.tertiary',
        textStyle: '14sb',
      })}
    >
      {dayjs($query.page.lastPublishedAt).fromNow()} 발행됨
    </span>
  {/if}

  <ul class={flex({ align: 'center' })}>
    {#each $query.page.contentContributor as contributor (contributor.id)}
      <li>
        <Img
          style={css.raw({ borderRadius: 'full', size: '32px', objectFit: 'cover' })}
          $image={contributor.user.avatar}
          alt=""
          size={32}
        />
      </li>
    {/each}
  </ul>

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

      <MenuItem
        on:click={async () => {
          await duplicatePage({ pageId: $query.page.id });
        }}
      >
        <Icon slot="prefix" icon={CopyIcon} size={20} />
        <span>복사</span>
      </MenuItem>
      <MenuItem
        variant="danger"
        on:click={async () => {
          await deletePage({ pageId: $query.page.id });
          if ($query.page.parent?.id) {
            goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
          } else {
            goto(`/${$query.page.site.id}`);
          }
        }}
      >
        <Icon slot="prefix" icon={TrashIcon} size={20} />
        <span>삭제</span>
      </MenuItem>
      <MenuItem
        on:click={async () => {
          await unpublishPage({ pageId: $query.page.id });
        }}
      >
        <span>발행 취소</span>
      </MenuItem>
    </Menu>
  </div>

  <div
    class={flex({
      gap: '8px',
    })}
  >
    {#if $query.page.state === PageState.DRAFT}
      <Button disabled variant="secondary">
        <Icon icon={ExternalLinkIcon} size={18} />
      </Button>
    {:else}
      <Button href={pageUrl($query.page)} rel="noopener noreferrer" target="_blank" type="link" variant="secondary">
        <Icon icon={ExternalLinkIcon} size={18} />
      </Button>
    {/if}

    {#if $query.page.hasUnpublishedParents}
      <Tooltip message="아직 상위 페이지가 발행되지 않았어요">
        <Button disabled>발행하기</Button>
      </Tooltip>
    {:else if $query.page.hasUnpublishedChanges || $query.page.state === PageState.DRAFT}
      <Button
        on:click={async () => {
          await publishPage({ pageId: $query.page.id });
        }}
      >
        발행하기
      </Button>
    {:else}
      <Tooltip message="이미 최신 버전으로 발행되어 있어요">
        <Button disabled>발행됨</Button>
      </Tooltip>
    {/if}
  </div>
</div>
