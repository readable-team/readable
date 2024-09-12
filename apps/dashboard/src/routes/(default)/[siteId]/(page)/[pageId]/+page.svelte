<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Alert, Button, Helmet, Icon, Menu, MenuItem, Tooltip } from '@readable/ui/components';
  import { toast } from '@readable/ui/notification';
  import dayjs from 'dayjs';
  import mixpanel from 'mixpanel-browser';
  import { PageState } from '@/enums';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import FileXIcon from '~icons/lucide/file-x';
  import Trash2Icon from '~icons/lucide/trash-2';
  import TriangleAlertIcon from '~icons/lucide/triangle-alert';
  import UndoIcon from '~icons/lucide/undo';
  import { afterNavigate, goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { invokeAlert } from '$lib/components/invoke-alert';
  import { lastVisitedPage } from '$lib/stores';
  import { treeOpenState } from '$lib/svelte/stores/ui';
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
        recursiveChildCount

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

        children {
          id
          hasUnpublishedParents
        }
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
    $treeOpenState[$query.page.id] = true;
    if ($query.page.parent) {
      $treeOpenState[$query.page.parent.id] = true;
    }
  });
</script>

<Helmet title={$query.page.content.title} trailing={$query.page.site.name} />

{#if $query.page.state === 'DELETED'}
  <div class={flex({ direction: 'column', align: 'center', justify: 'center', gap: '24px', width: 'full' })}>
    <Icon style={css.raw({ size: '60px' })} icon={FileXIcon} />
    <div class={css({ textAlign: 'center' })}>
      <h1 class={css({ textStyle: '22b', marginBottom: '4px' })}>페이지가 삭제되었습니다</h1>
      <p class={css({ textStyle: '15r', color: 'text.secondary' })}>
        페이지가 삭제되어 더 이상 접근할 수 없습니다.
        <br />
        다른 페이지를 선택해 주세요
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
            zIndex: '1',
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
              ? '아직 게시되지 않은 페이지입니다'
              : '발행하지 않은 수정 내역이 있습니다'}
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
              mixpanel.track('page:duplicate', {
                via: 'panel',
              });
            }}
          >
            <Icon icon={CopyIcon} size={14} />
            <span>복제</span>
          </MenuItem>
          {#if $query.page.state === PageState.PUBLISHED}
            <MenuItem on:click={() => (unpublishPageOpen = true)}>
              <Icon icon={UndoIcon} size={14} />
              <span>게시 취소</span>
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
      style={css.raw({ position: 'relative', marginBottom: '34px' })}
      enabled={$query.page.hasUnpublishedParents}
      message="상위 페이지를 먼저 게시해주세요"
      placement="left"
    >
      <Button
        style={css.raw({ width: 'full' })}
        disabled={$query.page.hasUnpublishedParents ||
          ($query.page.state === PageState.PUBLISHED && !$query.page.hasUnpublishedChanges)}
        size="md"
        on:click={async () => {
          if ($query.page.state === PageState.DRAFT) {
            invokeAlert({
              title: `"${$query.page.content.title}" 페이지를 게시하시겠어요?`,
              content: '누구나 사이트에서 이 페이지를 볼 수 있으며, 언제든 게시를 취소할 수 있습니다',
              actionText: '게시 및 발행',
              variant: 'primary',
              action: async () => {
                await publishPage({ pageId: $query.page.id });
                toast.success('발행이 완료되었습니다');
                mixpanel.track('page:publish', {
                  state: PageState.DRAFT,
                });
              },
            });
          } else {
            await publishPage({ pageId: $query.page.id });
            toast.success('발행이 완료되었습니다');
            mixpanel.track('page:publish', {
              state: PageState.PUBLISHED,
            });
          }
        }}
      >
        {#if $query.page.state === PageState.DRAFT}
          게시 및 발행
        {:else if !$query.page.hasUnpublishedChanges}
          발행됨
        {:else}
          발행
        {/if}
      </Button>
      {#if !($query.page.hasUnpublishedParents || ($query.page.state === PageState.PUBLISHED && !$query.page.hasUnpublishedChanges))}
        <div
          class={css({
            position: 'absolute',
            top: '0',
            left: '0',
            size: 'full',
            borderRadius: '10px',
            bgGradient: 'to-r',
            gradientFrom: 'white/20',
            gradientTo: 'white/0',
            pointerEvents: 'none',
          })}
        />
      {/if}
    </Tooltip>

    <div class={flex({ direction: 'column', gap: '20px' })}>
      {#if $query.page.state === PageState.PUBLISHED}
        <div>
          <p class={css({ marginBottom: '6px', textStyle: '14sb', color: 'text.secondary' })}>상태</p>

          <div
            class={flex({
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              paddingX: '4px',
              paddingY: '2px',
              color: 'text.secondary',
              textStyle: '11b',
              backgroundColor: 'neutral.30',
              width: 'fit',
            })}
          >
            게시됨
          </div>
        </div>
      {/if}

      <div>
        <p class={css({ marginBottom: '8px', textStyle: '14sb', color: 'text.secondary' })}>편집자</p>

        <div class={flex({ align: 'center', wrap: 'wrap', paddingLeft: '4px' })}>
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
      </div>

      {#if $query.page.state === PageState.PUBLISHED}
        <div>
          <p class={css({ marginBottom: '4px', textStyle: '14sb', color: 'text.secondary' })}>마지막 발행 시간</p>

          <time
            class={css({ display: 'block', textStyle: '14r', color: 'text.tertiary' })}
            datetime={$query.page.lastPublishedAt}
          >
            {dayjs($query.page.lastPublishedAt).formatAsDateTime()}
          </time>
        </div>
      {/if}

      <div>
        <p class={css({ marginBottom: '4px', textStyle: '14sb', color: 'text.secondary' })}>마지막 수정 시간</p>

        <time
          class={css({ display: 'block', textStyle: '14r', color: 'text.tertiary' })}
          datetime={$query.page.content.updatedAt}
        >
          {dayjs($query.page.content.updatedAt).formatAsDateTime()}
        </time>
      </div>
    </div>
  </aside>
{/if}

<Alert
  onAction={async () => {
    await deletePage({ pageId: $query.page.id });
    toast.success('페이지가 삭제되었습니다');
    mixpanel.track('page:delete', {
      via: 'panel',
    });
    if ($query.page.parent?.id) {
      goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
    } else {
      $lastVisitedPage = null;
      goto(`/${$query.page.site.id}`);
    }
  }}
  bind:open={deletePageOpen}
>
  <svelte:fragment slot="title">
    "{$query.page.content?.title ?? '(제목 없음)'}" 페이지를 삭제하시겠어요?
  </svelte:fragment>
  <svelte:fragment slot="content">삭제된 페이지는 복구할 수 없습니다</svelte:fragment>

  {#if $query.page.recursiveChildCount > 0}
    <div
      class={flex({
        align: 'center',
        gap: '6px',
        marginTop: '16px',
        borderRadius: '8px',
        paddingX: '10px',
        paddingY: '8px',
        textStyle: '13m',
        color: 'text.danger',
        backgroundColor: 'danger.10',
      })}
    >
      <Icon icon={TriangleAlertIcon} />
      <p>{$query.page.recursiveChildCount}개의 하위 페이지가 함께 삭제됩니다</p>
    </div>
  {/if}

  <svelte:fragment slot="action">삭제</svelte:fragment>
  <svelte:fragment slot="cancel">취소</svelte:fragment>
</Alert>

<Alert
  onAction={async () => {
    await unpublishPage({ pageId: $query.page.id });
    mixpanel.track('page:unpublish', {
      via: 'panel',
    });
  }}
  bind:open={unpublishPageOpen}
>
  <svelte:fragment slot="title">
    "{$query.page.content?.title ?? '(제목 없음)'}" 페이지 게시를 취소하시겠어요?
  </svelte:fragment>
  <svelte:fragment slot="content">
    사이트에서 이 페이지가 더 이상 노출되지 않습니다.
    <br />
    게시 취소한 페이지는 언제든 발행 버튼으로 다시 게시할 수 있습니다
  </svelte:fragment>

  {#if $query.page.recursiveChildCount > 0}
    <div
      class={flex({
        align: 'center',
        gap: '6px',
        marginTop: '16px',
        borderRadius: '8px',
        paddingX: '10px',
        paddingY: '8px',
        textStyle: '13m',
        color: 'text.danger',
        backgroundColor: 'danger.10',
      })}
    >
      <Icon icon={TriangleAlertIcon} />
      <p>{$query.page.recursiveChildCount}개의 하위 페이지가 함께 게시 취소됩니다</p>
    </div>
  {/if}

  <svelte:fragment slot="action">게시 취소</svelte:fragment>
  <svelte:fragment slot="cancel">취소</svelte:fragment>
</Alert>
