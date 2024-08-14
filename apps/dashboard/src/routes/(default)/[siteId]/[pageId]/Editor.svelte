<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
  import { fragment, graphql } from '$graphql';
  import type { Editor } from '@tiptap/core';
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

  const issueBlobUploadUrl = graphql(`
    mutation PagePage_IssueBlobUploadUrl($input: IssueBlobUploadUrlInput!) {
      issueBlobUploadUrl(input: $input) {
        path
        url
        fields
      }
    }
  `);

  const persistBlobAsFile = graphql(`
    mutation PagePage_PersistBlobAsFile($input: PersistBlobAsFileInput!) {
      persistBlobAsFile(input: $input) {
        id
        name
        size
        url
      }
    }
  `);

  const persistBlobAsImage = graphql(`
    mutation PagePage_PersistBlobAsImage($input: PersistBlobAsImageInput!) {
      persistBlobAsImage(input: $input) {
        id
        url
        ratio
        placeholder
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

  let editor: Editor | undefined;

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

  let titleEl: HTMLElement;
  let subtitleEl: HTMLElement;

  const adjustTextareaHeight = (el: HTMLElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  $: {
    setTimeout(() => {
      if (titleEl) adjustTextareaHeight(titleEl);
    }, 0);

    [$title];
  }

  $: {
    setTimeout(() => {
      if (subtitleEl) adjustTextareaHeight(subtitleEl);
    }, 0);

    [$subtitle];
  }

  const uploadBlob = async (file: File) => {
    const { path, url, fields } = await issueBlobUploadUrl({ filename: file.name });

    const formData = new FormData();
    for (const [key, value] of Object.entries<string>(fields)) {
      formData.append(key, value);
    }

    formData.append('Content-Type', file.type);
    formData.append('file', file);

    await ky.post(url, { body: formData });

    return path;
  };
</script>

<div class={css({ flex: '1', paddingTop: '62px', paddingX: '80px', overflowY: 'auto' })}>
  <div class={flex({ height: 'full', flexDirection: 'column' })}>
    <div
      class={flex({
        flexDirection: 'column',
        gap: '8px',
        marginX: 'auto',
        marginBottom: '46px',
        width: '720px',
        color: 'text.primary',
      })}
    >
      <textarea
        bind:this={titleEl}
        class={css({
          textStyle: '42eb',
          height: 'auto',
          overflowY: 'hidden',
          resize: 'none',
        })}
        placeholder="제목을 입력하세요"
        rows="1"
        bind:value={$title}
      />

      <textarea
        bind:this={subtitleEl}
        class={css({
          textStyle: '23eb',
          height: 'auto',
          overflowY: 'hidden',
          resize: 'none',
        })}
        placeholder="부제목을 입력하세요"
        rows="1"
        bind:value={$subtitle}
      />
    </div>

    <!-- {#if editor}
      {JSON.stringify(editor.state.selection.toJSON())}
      {JSON.stringify(editor.state.doc.resolve(editor.state.selection.$from.start(1)).node().toJSON())}
    {/if} -->

    <TiptapEditor
      style={css.raw({
        flex: '1',
        color: 'text.primary',
        paddingBottom: '128px',
        marginX: 'auto',
        width: '720px',
      })}
      awareness={yAwareness}
      document={yDoc}
      handleFileUpload={async (file) => {
        const path = await uploadBlob(file);
        return await persistBlobAsFile({ path });
      }}
      handleImageUpload={async (file) => {
        const path = await uploadBlob(file);
        return await persistBlobAsImage({ path });
      }}
      bind:editor
    />
  </div>
</div>
