<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, Menu, MenuItem, VerticalDivider } from '@readable/ui/components';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
  import ClockIcon from '~icons/lucide/clock';
  import CopyIcon from '~icons/lucide/copy';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import TrashIcon from '~icons/lucide/trash';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import type { Writable } from 'svelte/store';
  import type { PagePage_Editor_query } from '$graphql';

  export let _query: PagePage_Editor_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment PagePage_Editor_query on Query {
        me @required {
          id
          name
        }

        page(pageId: $pageId) {
          id

          parent {
            id
          }

          site {
            id
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

  const syncPageContent = graphql(`
    mutation PagePage_SyncPageContent_Mutation($input: SyncPageContentInput!) {
      syncPageContent(input: $input) {
        pageId
        kind
        data
      }
    }
  `);

  const pageContentSyncStream = graphql(`
    subscription PagePage_PageContentSyncStream_Subscription($pageId: ID!) {
      pageContentSyncStream(pageId: $pageId) {
        pageId
        kind
        data
      }
    }
  `);

  pageContentSyncStream.on('data', ({ pageContentSyncStream: operation }) => {
    if (operation.pageId !== $query.page.id) {
      return;
    }

    // eslint-disable-next-line unicorn/prefer-switch
    if (operation.kind === PageContentSyncKind.PING) {
      // TODO: PONG
    } else if (operation.kind === PageContentSyncKind.SYNCHRONIZE_3) {
      if (operation.data === clientId) {
        // TODO: Update connection state
      }

      syncPageContent({
        pageId: $query.page.id,
        clientId,
        kind: PageContentSyncKind.AWARENESS,
        data: fromUint8Array(YAwareness.encodeAwarenessUpdate(yAwareness, [yDoc.clientID])),
      });
    } else if (operation.kind === PageContentSyncKind.UPDATE) {
      Y.applyUpdateV2(yDoc, toUint8Array(operation.data), 'NETWORK');
    } else if (operation.kind === PageContentSyncKind.AWARENESS) {
      YAwareness.applyAwarenessUpdate(yAwareness, toUint8Array(operation.data), 'NETWORK');
    }
  });

  const onDeletePage = async () => {
    await deletePage({ pageId: $query.page.id });
    if ($query.page.parent?.id) {
      goto(`/${$query.page.site.id}/${$query.page.parent.id}`);
    } else {
      goto(`/${$query.page.site.id}`);
    }
  };

  const yDoc = new Y.Doc();
  const yAwareness = new YAwareness.Awareness(yDoc);

  const clientId = nanoid();

  yDoc.on('updateV2', async (update, origin) => {
    if (origin !== 'NETWORK') {
      await syncPageContent({
        pageId: $query.page.id,
        clientId,
        kind: PageContentSyncKind.UPDATE,
        data: fromUint8Array(update),
      });
    }
  });

  yAwareness.on(
    'update',
    async (states: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      if (origin === 'NETWORK') {
        return;
      }

      const update = YAwareness.encodeAwarenessUpdate(yAwareness, [
        ...states.added,
        ...states.updated,
        ...states.removed,
      ]);

      await syncPageContent({
        pageId: $query.page.id,
        clientId,
        kind: PageContentSyncKind.AWARENESS,
        data: fromUint8Array(update),
      });
    },
  );

  const setupLocalAwareness = async () => {
    yAwareness.setLocalStateField('user', {
      name: $query.me.name,
      color: '#000000',
    });
  };

  const fullSync = async () => {
    const clientStateVector = Y.encodeStateVector(yDoc);

    const results = await syncPageContent({
      pageId: $query.page.id,
      clientId,
      kind: PageContentSyncKind.SYNCHRONIZE_1,
      data: fromUint8Array(clientStateVector),
    });

    if (!results) {
      return;
    }

    for (const { kind, data: data_ } of results) {
      if (kind === PageContentSyncKind.SYNCHRONIZE_1) {
        const serverStateVector = toUint8Array(data_);
        const serverMissingUpdate = Y.encodeStateAsUpdateV2(yDoc, serverStateVector);

        await syncPageContent({
          pageId: $query.page.id,
          clientId,
          kind: PageContentSyncKind.SYNCHRONIZE_2,
          data: fromUint8Array(serverMissingUpdate),
        });
      } else if (kind === PageContentSyncKind.SYNCHRONIZE_2) {
        const clientMissingUpdate = toUint8Array(data_);

        Y.applyUpdateV2(yDoc, clientMissingUpdate, 'NETWORK');
      }
    }
  };

  const createStore = (doc: Y.Doc, name: string) => {
    const yText = doc.getText(name);

    const store: Writable<string> = {
      subscribe: (run) => {
        const handler = () => {
          run(yText.toString());
        };

        yText.observe(handler);
        handler();

        return () => {
          yText.unobserve(handler);
        };
      },
      set: (value: string) => {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, value);
        });
      },
      update: (fn: (value: string) => string) => {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, fn(yText.toString()));
        });
      },
    };

    return store;
  };

  const title = createStore(yDoc, 'title');
  const subtitle = createStore(yDoc, 'subtitle');

  onMount(() => {
    const unsubscribe = pageContentSyncStream.subscribe({ pageId: $query.page.id });

    setupLocalAwareness();
    fullSync();

    return () => {
      unsubscribe();
      YAwareness.removeAwarenessStates(yAwareness, [yDoc.clientID], 'NETWORK');
      yDoc.destroy();
    };
  });
</script>

<div class={css({ margin: '100px', borderWidth: '4px', padding: '20px' })}>
  <div
    class={css({
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.200',
      marginBottom: '20px',
      paddingBottom: '10px',
    })}
  >
    <input
      class={css({ width: 'full', fontSize: { base: '22px', sm: '28px' }, fontWeight: 'bold' })}
      maxlength="100"
      placeholder="제목을 입력하세요"
      type="text"
      bind:value={$title}
    />

    <input
      class={css({ marginTop: '4px', width: 'full', fontSize: '16px', fontWeight: 'bold' })}
      maxlength="100"
      placeholder="부제목을 입력하세요"
      type="text"
      bind:value={$subtitle}
    />
  </div>

  <TiptapEditor style={css.raw({ height: '[2000px]' })} awareness={yAwareness} document={yDoc} />
</div>

<div
  class={flex({
    position: 'sticky',
    bottom: '56px',
    marginX: 'auto',
    width: '[fit-content]',
    height: '58px',
    borderRadius: '12px',
    backgroundColor: 'surface.tertiary',
    alignItems: 'center',
    shadow: 'strong',
  })}
>
  <div
    class={flex({
      gap: '8px',
      paddingX: '12px',
      paddingY: '10px',
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

  <VerticalDivider color="secondary" />

  <div
    class={flex({
      paddingX: '12px',
      alignItems: 'center',
      gap: '10px',
    })}
  >
    <span
      class={css({
        color: 'text.tertiary',
        textStyle: '14sb',
      })}
    >
      2일 전 발행됨
    </span>

    <div
      class={flex({
        gap: '8px',
      })}
    >
      <Button variant="secondary">발행취소</Button>
      <Button
        on:click={async () => {
          await publishPage({ pageId: $query.page.id });
        }}
      >
        발행
      </Button>
    </div>
  </div>
</div>
