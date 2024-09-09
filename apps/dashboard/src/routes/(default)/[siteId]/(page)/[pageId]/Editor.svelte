<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import { base64 } from 'rfc4648';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
  import { fragment, graphql } from '$graphql';
  import Breadcrumb from './Breadcrumb.svelte';
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

        ...PagePage_Breadcrumb_query
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
    mutation PagePage_IssueBlobUploadUrl_Mutation($input: IssueBlobUploadUrlInput!) {
      issueBlobUploadUrl(input: $input) {
        path
        url
        fields
      }
    }
  `);

  const persistBlobAsFile = graphql(`
    mutation PagePage_PersistBlobAsFile_Mutation($input: PersistBlobAsFileInput!) {
      persistBlobAsFile(input: $input) {
        id
        name
        size
        url
      }
    }
  `);

  const persistBlobAsImage = graphql(`
    mutation PagePage_PersistBlobAsImage_Mutation($input: PersistBlobAsImageInput!) {
      persistBlobAsImage(input: $input) {
        id
        url
        ratio
        placeholder
      }
    }
  `);

  const unfurlEmbed = graphql(`
    mutation PagePage_UnfurlEmbed_Mutation($input: UnfurlEmbedInput!) {
      unfurlEmbed(input: $input) {
        id
        url
        title
        description
        thumbnailUrl
        html
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
        data: base64.stringify(YAwareness.encodeAwarenessUpdate(yAwareness, [yDoc.clientID])),
      });
    } else if (operation.kind === PageContentSyncKind.UPDATE) {
      Y.applyUpdateV2(yDoc, base64.parse(operation.data), 'NETWORK');
    } else if (operation.kind === PageContentSyncKind.AWARENESS) {
      YAwareness.applyAwarenessUpdate(yAwareness, base64.parse(operation.data), 'NETWORK');
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
        data: base64.stringify(update),
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
        data: base64.stringify(update),
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
      data: base64.stringify(clientStateVector),
    });

    if (!results) {
      return;
    }

    for (const { kind, data } of results) {
      if (kind === PageContentSyncKind.SYNCHRONIZE_1) {
        const serverStateVector = base64.parse(data);
        const serverMissingUpdate = Y.encodeStateAsUpdateV2(yDoc, serverStateVector);

        await syncPageContent({
          pageId: $query.page.id,
          clientId,
          kind: PageContentSyncKind.SYNCHRONIZE_2,
          data: base64.stringify(serverMissingUpdate),
        });
      } else if (kind === PageContentSyncKind.SYNCHRONIZE_2) {
        const clientMissingUpdate = base64.parse(data);

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

<div class={css({ flex: '1', paddingX: '80px', overflowY: 'auto' })}>
  <div class={flex({ height: 'full', flexDirection: 'column' })}>
    <div class={css({ paddingTop: '46px' })}>
      <Breadcrumb style={css.raw({ marginX: 'auto', width: '720px' })} _query={$query} />
    </div>

    <div
      class={flex({
        flexDirection: 'column',
        gap: '8px',
        marginX: 'auto',
        marginTop: '34px',
        marginBottom: '14px',
        width: '720px',
        color: 'text.primary',
      })}
    >
      <textarea
        bind:this={titleEl}
        class={css({
          textStyle: '34b',
          lineHeight: '[1.3]',
          height: 'auto',
          wordBreak: 'break-all',
          overflowY: 'hidden',
          resize: 'none',
        })}
        placeholder="제목을 입력하세요"
        rows="1"
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        on:paste|preventDefault={(e) => {
          const pastedText = e.clipboardData?.getData('text');
          if (!pastedText) return;

          const cleanedText = pastedText.replaceAll('\n', '');
          const selectionStart = e.currentTarget.selectionStart;
          const selectionEnd = e.currentTarget.selectionEnd;
          const textBeforeCursor = $title.slice(0, selectionStart);
          const textAfterCursor = $title.slice(selectionEnd);
          $title = textBeforeCursor + cleanedText + textAfterCursor;
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + cleanedText.length;
        }}
        bind:value={$title}
      />
    </div>

    <!-- {#if editor}
      {JSON.stringify(editor.state.selection.toJSON())}
      {JSON.stringify(editor.state.doc.resolve(editor.state.selection.$from.start(1)).node().toJSON())}
    {/if} -->

    <TiptapEditor
      style={css.raw({
        'flex': '1',
        'color': 'text.primary',
        'paddingBottom': '128px',

        'minWidth': '720px',
        'width': 'full',

        'display': 'flex',
        'flexDirection': 'column',
        'alignItems': 'center',

        '& > *': {
          width: '720px',
        },
      })}
      awareness={yAwareness}
      document={yDoc}
      handleEmbed={async (url) => {
        return await unfurlEmbed({ url });
      }}
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
