<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TiptapEditor } from '@readable/ui/tiptap';
  import { fromUint8Array, toUint8Array } from 'js-base64';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { PageContentSyncKind } from '@/enums';
  import { trpc } from '$lib/trpc.js';

  export let data;

  const yDoc = new Y.Doc();
  const yAwareness = new YAwareness.Awareness(yDoc);

  const clientId = nanoid();

  yDoc.on('updateV2', async (update, origin) => {
    if (origin !== 'NETWORK') {
      await trpc.page.content.sync.mutate({
        pageId: data.pageId,
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

      await trpc.page.content.sync.mutate({
        pageId: data.pageId,
        clientId,
        kind: PageContentSyncKind.AWARENESS,
        data: fromUint8Array(update),
      });
    },
  );

  const setupLocalAwareness = async () => {
    const me = await trpc.user.me.query();

    yAwareness.setLocalStateField('user', {
      name: me.name,
      color: '#000000',
    });
  };

  const fullSync = async () => {
    const clientStateVector = Y.encodeStateVector(yDoc);

    const results = await trpc.page.content.sync.mutate({
      pageId: data.pageId,
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

        await trpc.page.content.sync.mutate({
          pageId: data.pageId,
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
    const stream = trpc.page.content.stream.subscribe(
      { pageId: data.pageId },
      {
        onData: (resp) => {
          if (resp.pageId !== data.pageId) {
            return;
          }

          // eslint-disable-next-line unicorn/prefer-switch
          if (resp.kind === PageContentSyncKind.PING) {
            // TODO: PONG
          } else if (resp.kind === PageContentSyncKind.SYNCHRONIZE_3) {
            if (resp.data === clientId) {
              // TODO: Update connection state
            }

            trpc.page.content.sync.mutate({
              pageId: data.pageId,
              clientId,
              kind: PageContentSyncKind.AWARENESS,
              data: fromUint8Array(YAwareness.encodeAwarenessUpdate(yAwareness, [yDoc.clientID])),
            });
          } else if (resp.kind === PageContentSyncKind.UPDATE) {
            Y.applyUpdateV2(yDoc, toUint8Array(resp.data), 'NETWORK');
          } else if (resp.kind === PageContentSyncKind.AWARENESS) {
            YAwareness.applyAwarenessUpdate(yAwareness, toUint8Array(resp.data), 'NETWORK');
          }
        },
      },
    );

    setupLocalAwareness();
    fullSync();

    return () => {
      stream.unsubscribe();
      YAwareness.removeAwarenessStates(yAwareness, [yDoc.clientID], 'NETWORK');
      yDoc.destroy();
    };
  });
</script>

<div class={css({ margin: '100px', borderWidth: '4px', padding: '20px' })}>
  <TiptapEditor style={css.raw({ height: '[2000px]' })} awareness={yAwareness} document={yDoc} />
</div>
