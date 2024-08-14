<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { Alert, Button, Icon, Menu, MenuItem, Tooltip } from '@readable/ui/components';
  import dayjs from 'dayjs';
  import { PageState } from '@/enums';
  import ClockIcon from '~icons/lucide/clock';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import ExternalLinkIcon from '~icons/lucide/external-link';
  import TrashIcon from '~icons/lucide/trash';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { pageUrl } from '$lib/utils/url';
  import type { PagePage_PageMenuBar_query } from '$graphql';

  export let _query: PagePage_PageMenuBar_query;

  let deletePageOpen = false;
  let unpublishPageOpen = false;

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
    align: 'center',
    gap: '20px',
    flex: 'none',
  })}
>
  {#if $query.page.hasUnpublishedChanges}
    <span
      class={css({
        borderRadius: '6px',
        paddingX: '10px',
        paddingY: '5px',
        textStyle: '13m',
        color: 'danger.60',
        backgroundColor: 'danger.10',
      })}
    >
      발행되지 않은 수정사항 있음
    </span>
  {/if}
  {#if $query.page.lastPublishedAt && $query.page.state === PageState.PUBLISHED}
    <span
      class={css({
        color: 'text.tertiary',
        textStyle: '14m',
      })}
    >
      {dayjs($query.page.lastPublishedAt).fromNow()} 발행됨
    </span>
  {/if}

  <ul class={flex({ align: 'center' })}>
    {#each $query.page.contentContributor.slice(0, 4) as contributor, index (contributor.id)}
      <li class={css({ size: '32px' }, index !== 0 && { marginLeft: '-8px' })}>
        <Img
          style={css.raw({
            borderWidth: '1px',
            borderColor: 'white',
            borderRadius: 'full',
            size: '32px',
            objectFit: 'cover',
          })}
          $image={contributor.user.avatar}
          alt=""
          size={32}
        />
      </li>
    {/each}
    {#if $query.page.contentContributor.length > 4}
      <li
        class={center({
          marginLeft: '-8px',
          borderWidth: '1px',
          borderColor: 'white',
          borderRadius: 'full',
          size: '32px',
          textStyle: '12eb',
          color: 'accent.10',
          backgroundColor: 'accent.40',
        })}
      >
        {$query.page.contentContributor.length - 4}+
      </li>
    {/if}
  </ul>

  <div
    class={flex({
      alignItems: 'center',
      gap: '10px',
    })}
  >
    <button
      class={center({
        borderRadius: '4px',
        size: '24px',
        backgroundColor: {
          _hover: 'neutral.20',
          _pressed: 'neutral.30',
        },
      })}
      type="button"
    >
      <Icon style={css.raw({ color: 'neutral.50' })} icon={ClockIcon} />
    </button>

    <Menu listStyle={css.raw({ width: '148px' })} offset={16} placement="top-start">
      <button
        slot="button"
        class={center({
          borderRadius: '4px',
          size: '24px',
          backgroundColor: {
            _hover: 'neutral.20',
            _pressed: 'neutral.30',
          },
        })}
        aria-pressed={open}
        type="button"
        let:open
      >
        <Icon style={css.raw({ color: 'neutral.50' })} icon={EllipsisIcon} />
      </button>

      <MenuItem
        on:click={async () => {
          await duplicatePage({ pageId: $query.page.id });
        }}
      >
        <Icon slot="prefix" icon={CopyIcon} size={20} />
        <span>복사</span>
      </MenuItem>
      <MenuItem variant="danger" on:click={() => (deletePageOpen = true)}>
        <Icon slot="prefix" icon={TrashIcon} size={20} />
        <span>삭제</span>
      </MenuItem>
      <MenuItem on:click={() => (unpublishPageOpen = true)}>
        <span>발행 취소</span>
      </MenuItem>
    </Menu>
  </div>

  <div class={flex({ gap: '10px' })}>
    {#if $query.page.state === PageState.DRAFT}
      <Button
        style={css.raw({
          paddingTop: '6px',
          paddingRight: '6px',
          paddingBottom: '8px',
          paddingLeft: '8px',
        })}
        disabled
        variant="secondary"
      >
        <Icon icon={ExternalLinkIcon} size={24} />
      </Button>
    {:else}
      <Button
        style={css.raw({
          paddingTop: '6px',
          paddingRight: '6px',
          paddingBottom: '8px',
          paddingLeft: '8px',
        })}
        href={pageUrl($query.page)}
        rel="noopener noreferrer"
        target="_blank"
        type="link"
        variant="secondary"
      >
        <Icon icon={ExternalLinkIcon} size={24} />
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

<Alert
  onAction={async () => {
    await deletePage({ pageId: $query.page.id });
    if ($query.page.parent?.id) {
      goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
    } else {
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
