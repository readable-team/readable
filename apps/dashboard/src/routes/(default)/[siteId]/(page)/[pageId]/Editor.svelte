<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { applyCommit, getCommit, TiptapEditor } from '@readable/ui/tiptap';
  import ky from 'ky';
  import { Step } from 'prosemirror-transform';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fragment, graphql } from '$graphql';
  import Breadcrumb from './Breadcrumb.svelte';
  import type { Editor } from '@tiptap/core';
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

          content {
            id
            title
            content
            version
          }
        }

        ...PagePage_Breadcrumb_query
      }
    `),
  );

  const commitPageContent = graphql(`
    mutation PagePage_CommitPageContent_Mutation($input: CommitPageContentInput!) {
      commitPageContent(input: $input)
    }
  `);

  const pageContentCommitStream = graphql(`
    subscription PagePage_PageContentCommitStream_Subscription($pageId: ID!) {
      pageContentCommitStream(pageId: $pageId) {
        pageId
        version
        ref
        steps
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

  pageContentCommitStream.on('data', ({ pageContentCommitStream: commit }) => {
    if (!editor) {
      return;
    }

    const tr = applyCommit(editor.state, {
      version: commit.version,
      ref: commit.ref,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      steps: commit.steps.map((step) => Step.fromJSON(editor!.schema, step)),
    });

    editor.view.dispatch(tr);

    onTransaction();
  });

  let editor: Editor | undefined;

  const onTransaction = async () => {
    if (!editor) {
      return;
    }

    const commit = getCommit(editor.state);
    if (!commit) {
      return;
    }

    await commitPageContent({
      pageId: $query.page.id,
      version: commit.version,
      ref: commit.ref,
      steps: commit.steps.map((step) => step.toJSON()),
    });
  };

  onMount(() => {
    const interval = setInterval(() => {
      onTransaction();
    }, 1000);

    const unsubscribe = pageContentCommitStream.subscribe({ pageId: $query.page.id });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  });

  const title = writable('');
  let titleEl: HTMLElement;

  $: $title = $query.page.content.title;

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
      content={$query.page.content.content}
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
      version={$query.page.content.version}
      on:change={onTransaction}
      bind:editor
    />
  </div>
</div>
