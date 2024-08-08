<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
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
        }
      }
    `),
  );

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

<div class={css({ flex: '1', marginTop: '64px', marginBottom: '128px', marginX: 'auto' })}>
  <div class={flex({ height: 'full', flexDirection: 'column', marginX: '64px', width: '720px' })}>
    <div
      class={flex({
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '42px',
        color: 'text.primary',
      })}
    >
      <span
        class={css({
          display: 'inline-block',
          width: 'full',
          textStyle: '42eb',
          _empty: { _before: { display: 'block', content: 'attr(placeholder)', color: 'text.secondary' } },
        })}
        contenteditable="true"
        placeholder="제목을 입력하세요"
        on:input={(e) => {
          title.set(e.currentTarget?.textContent ?? '');
        }}
      >
        {$title}
      </span>

      <span
        class={css({
          display: 'inline-block',
          width: 'full',
          textStyle: '23eb',
          _empty: { _before: { display: 'block', content: 'attr(placeholder)', color: 'text.secondary' } },
        })}
        contenteditable="true"
        placeholder="부제목을 입력하세요"
        on:input={(e) => {
          subtitle.set(e.currentTarget?.textContent ?? '');
        }}
      >
        {$subtitle}
      </span>
    </div>

    <TiptapEditor style={css.raw({ flex: '1', color: 'text.primary' })} awareness={yAwareness} document={yDoc} />
  </div>
</div>
