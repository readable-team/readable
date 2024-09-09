<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Alert, Button, Helmet, Icon, Menu, MenuItem, Tooltip } from '@readable/ui/components';
  import { toast } from '@readable/ui/notification';
  import dayjs from 'dayjs';
  import { PageState } from '@/enums';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import FileWarningIcon from '~icons/lucide/file-warning';
  import Trash2Icon from '~icons/lucide/trash-2';
  import UndoIcon from '~icons/lucide/undo';
  import { afterNavigate, goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { lastVisitedPage } from '$lib/stores';
  import { pageUrl } from '$lib/utils/url';
  import Editor from './Editor.svelte';

  let deletePageOpen = false;
  let unpublishPageOpen = false;

  $: query = graphql(`
    query PagePage_Query($siteId: ID!, $pageId: ID!) {
      site(siteId: $siteId) {
        id
      }

      page(pageId: $pageId) {
        id
        state
        hasUnpublishedChanges
        hasUnpublishedParents
        lastPublishedAt
        slug

        content {
          id
          title
          updatedAt
        }

        parent {
          id
        }

        site {
          id
          name
          url
        }

        contentContributor {
          id

          user {
            id
            name

            avatar {
              id
              ...Img_image
            }
          }
        }
      }

      ...PagePage_Editor_query
    }
  `);

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

  afterNavigate(() => {
    $lastVisitedPage = $query.page.state === 'DELETED' ? null : $query.page.id;
  });
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#if $query.page.state === 'DELETED'}
  <div class={flex({ direction: 'column', align: 'center', justify: 'center', gap: '24px', width: 'full' })}>
    <Icon style={css.raw({ size: '60px' })} icon={FileWarningIcon} />
    <div class={css({ textAlign: 'center' })}>
      <h1 class={css({ textStyle: '22b', marginBottom: '4px' })}>페이지가 삭제되었습니다</h1>
      <p class={css({ textStyle: '15r', color: 'text.secondary' })}>
        현재 페이지 또는 카테고리가 삭제되어 더 이상 접근할 수 없습니다. <br />
        다른 페이지를 선택해 주세요.
      </p>
    </div>
  </div>
{:else}
  <div
    class={flex({
      'direction': 'column',
      'grow': 1,
      'position': 'relative',
      'backgroundColor': 'surface.primary',
      'overflowY': 'auto',

      '&:has(.has-slash-menu)': {
        overflowY: 'hidden',
      },
    })}
  >
    {#key $query.page.id}
      {#if $query.page.hasUnpublishedChanges || $query.page.state === PageState.DRAFT}
        <div
          class={css({
            position: 'absolute',
            backgroundColor: 'surface.primary',
            width: 'full',
          })}
        >
          <div
            class={css(
              {
                paddingY: '5px',
                paddingX: '80px',
                textStyle: '13m',
                color: 'text.accent',
                textAlign: 'center',
                backgroundColor: 'accent.10/50',
              },
              $query.page.state === PageState.DRAFT && {
                backgroundColor: 'neutral.20',
                color: 'text.secondary',
              },
            )}
          >
            {$query.page.state === PageState.DRAFT
              ? '아직 발행되지 않은 페이지입니다'
              : '발행되지 않은 수정 내역이 있습니다'}
          </div>
        </div>
      {/if}

      <Editor _query={$query} />
    {/key}
  </div>

  <aside
    class={css({
      flex: 'none',
      borderLeftWidth: '1px',
      borderColor: 'border.secondary',
      padding: '20px',
      minWidth: '200px',
      width: '[16.75%]',
      maxWidth: '280px',
    })}
  >
    <div class={flex({ align: 'center', justify: 'space-between', marginBottom: '10px' })}>
      <span class={css({ textStyle: '14sb', color: 'text.secondary' })}>페이지</span>
      <div class={flex({ align: 'center', gap: '12px' })}>
        {#if $query.page.state === PageState.DRAFT}
          <div
            class={css({
              borderRadius: '2px',
              padding: '4px',
              color: 'text.disabled',
            })}
          >
            <Icon icon={ExternalLinkIcon} size={14} />
          </div>
        {:else}
          <a
            class={css({
              borderRadius: '2px',
              padding: '4px',
              color: 'text.secondary',
              _hover: { backgroundColor: 'neutral.10' },
            })}
            href={pageUrl($query.page)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon icon={ExternalLinkIcon} size={14} />
          </a>
        {/if}
        <Menu offset={2} placement="bottom-end">
          <div
            slot="button"
            class={css({
              borderRadius: '2px',
              padding: '4px',
              color: 'text.secondary',
              _hover: { backgroundColor: 'neutral.10' },
            })}
          >
            <Icon icon={EllipsisIcon} size={16} />
          </div>

          <MenuItem
            on:click={async () => {
              await duplicatePage({ pageId: $query.page.id });
            }}
          >
            <Icon icon={CopyIcon} size={14} />
            <span>복제</span>
          </MenuItem>
          {#if $query.page.state === PageState.PUBLISHED}
            <MenuItem on:click={() => (unpublishPageOpen = true)}>
              <Icon icon={UndoIcon} size={14} />
              <span>발행 취소</span>
            </MenuItem>
          {/if}
          <MenuItem variant="danger" on:click={() => (deletePageOpen = true)}>
            <Icon icon={Trash2Icon} size={14} />
            <span>삭제</span>
          </MenuItem>
        </Menu>
      </div>
    </div>

    <Tooltip
      style={css.raw({ marginBottom: '34px' })}
      enabled={$query.page.hasUnpublishedParents ||
        ($query.page.state === PageState.PUBLISHED && !$query.page.hasUnpublishedChanges)}
      message="이미 최신 버전으로 발행되어 있어요"
    >
      <Button
        style={css.raw({ width: 'full' })}
        disabled={$query.page.hasUnpublishedParents ||
          ($query.page.state === PageState.PUBLISHED && !$query.page.hasUnpublishedChanges)}
        size="md"
        on:click={async () => {
          await publishPage({ pageId: $query.page.id });
          toast.success('발행이 완료되었습니다');
        }}
      >
        발행
      </Button>
    </Tooltip>

    <p class={css({ marginBottom: '8px', textStyle: '14sb', color: 'text.secondary' })}>편집자</p>

    <div class={flex({ align: 'center', wrap: 'wrap', paddingLeft: '4px', marginBottom: '16px' })}>
      {#each $query.page.contentContributor as contributor (contributor.id)}
        <Tooltip
          style={css.raw({
            borderRadius: 'full',
            marginLeft: '-4px',
            marginBottom: '4px',
            size: '28px',
          })}
          message={contributor.user.name}
          offset={8}
          tooltipStyle={css.raw({ maxWidth: '100px', truncate: true })}
        >
          <Img
            style={css.raw({
              flex: 'none',
              ringWidth: '1px',
              ringColor: 'border.image',
              borderRadius: 'full',
              size: '28px',
              _hover: { ringWidth: '2px', ringColor: { base: 'gray.800', _dark: 'darkgray.500' } },
            })}
            $image={contributor.user.avatar}
            alt={contributor.user.name}
            size={32}
          />
        </Tooltip>
      {/each}
    </div>

    {#if $query.page.state === PageState.PUBLISHED}
      <p class={css({ marginBottom: '4px', textStyle: '14sb', color: 'text.secondary' })}>마지막 발행 시간</p>

      <time
        class={css({ display: 'block', marginBottom: '20px', textStyle: '14r', color: 'text.tertiary' })}
        datetime={$query.page.lastPublishedAt}
      >
        {dayjs($query.page.lastPublishedAt).formatAsDateTime()}
      </time>
    {/if}

    <p class={css({ marginBottom: '4px', textStyle: '14sb', color: 'text.secondary' })}>마지막 편집 시간</p>

    <time
      class={css({ display: 'block', textStyle: '14r', color: 'text.tertiary' })}
      datetime={$query.page.content.updatedAt}
    >
      {dayjs($query.page.content.updatedAt).formatAsDateTime()}
    </time>
  </aside>
{/if}

<Alert
  onAction={async () => {
    await deletePage({ pageId: $query.page.id });
    toast.success('페이지가 삭제되었습니다');
    if ($query.page.parent?.id) {
      goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
    } else {
      $lastVisitedPage = null;
      goto(`/${$query.page.site.id}`);
    }
  }}
  bind:open={deletePageOpen}
>
  <svelte:fragment slot="title">페이지를 삭제할까요?</svelte:fragment>
  <svelte:fragment slot="content">
    이 작업은 되돌릴 수 없어요. 해당 페이지를 삭제하면 모든 하위 페이지도 함께 삭제돼요
  </svelte:fragment>

  <svelte:fragment slot="action">페이지 삭제</svelte:fragment>
  <svelte:fragment slot="cancel">삭제하지 않을래요</svelte:fragment>
</Alert>

<Alert
  onAction={async () => {
    await unpublishPage({ pageId: $query.page.id });
  }}
  bind:open={unpublishPageOpen}
>
  <svelte:fragment slot="title">페이지 발행을 취소할까요?</svelte:fragment>
  <svelte:fragment slot="content">페이지 발행을 취소하면 해당 페이지가 사이트에서 숨겨져요</svelte:fragment>

  <svelte:fragment slot="action">페이지 발행 취소</svelte:fragment>
  <svelte:fragment slot="cancel">발행 취소를 하지 않을래요</svelte:fragment>
</Alert>
