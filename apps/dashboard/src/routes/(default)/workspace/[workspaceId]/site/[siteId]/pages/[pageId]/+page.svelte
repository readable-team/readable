<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon } from '@readable/ui/components';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
  import ClockIcon from '~icons/lucide/clock';
  import EllipsisIcon from '~icons/lucide/ellipsis';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query PagePage_Query($pageId: ID!) {
      me @required {
        id
        name
      }

      page(pageId: $pageId) {
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
    <Button
      style={css.raw({
        paddingX: '9px',
      })}
      variant="secondary"
    >
      <Icon icon={EllipsisIcon} size={18} />
    </Button>
  </div>

  <hr
    class={css({
      borderColor: 'divider.secondary',
      borderLeftWidth: '1px',
      height: 'full',
    })}
  />

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
      <Button>발행</Button>
    </div>
  </div>
</div>
