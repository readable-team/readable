<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TextInput, Tooltip } from '@readable/ui/components';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import TitledModal from '$lib/components/TitledModal.svelte';

  $: ({ teamId, siteId } = $page.params);

  let open = false;
  let query = '';
  let results: Awaited<ReturnType<(typeof searchPageAndAnswer)['refetch']>>['searchPageAndAnswer'];

  let sourcesIndex = new Map<string, number>();

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'k' && event.metaKey) {
      open = !open;
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    console.log(query, $page.params.siteId);

    sourcesIndex.clear();
    results = await searchPageAndAnswer
      .refetch({
        siteId: $page.params.siteId,
        query,
      })
      .then((result) => result.searchPageAndAnswer);

    for (const [i, page] of results.pages.entries()) {
      sourcesIndex.set(page.id, i + 1);
    }

    console.log(results);
  }

  const searchPageAndAnswer = graphql(`
    query AiSearch_Query($query: String!, $siteId: String!) @manual {
      searchPageAndAnswer(query: $query, siteId: $siteId) {
        answer {
          text
          sources {
            pageId
            title
          }
        }
        pages {
          id
          content {
            title
          }
        }
      }
    }
  `);
</script>

<svelte:window on:keydown={handleKeyDown} />

<TitledModal bind:open>
  <svelte:fragment slot="title">AI 검색</svelte:fragment>

  <form on:submit={handleSubmit}>
    <TextInput name="query" placeholder="질문을 입력하세요..." bind:value={query} />
  </form>
  {#if results}
    <div class={css({ marginTop: '20px' })}>
      <h3 class={css({ marginBottom: '12px', textStyle: '18sb', color: 'text.primary' })}>AI 답변</h3>
      <p class={css({ marginBottom: '16px', textStyle: '14r', color: 'text.secondary' })}>
        {results.answer.text}
        {#if results.answer.sources.length > 0}
          {#each results.answer.sources as source (source.pageId)}
            <Tooltip style={css.raw({ display: 'inline-block' })} message={source.title ?? '제목 없음'}>
              <span class={css({ color: 'text.secondary' })}>[{sourcesIndex.get(source.pageId)}]</span>
            </Tooltip>
          {/each}
        {/if}
      </p>

      <h4 class={css({ marginTop: '20px', marginBottom: '8px', textStyle: '16sb', color: 'text.primary' })}>
        참고 문서
      </h4>
      <ul class={css({ listStyleType: 'disc', paddingLeft: '20px' })}>
        {#each results.answer.sources as source (source.pageId)}
          <li class={css({ marginBottom: '4px', textStyle: '14r', color: 'text.secondary' })}>
            <a href={`/${teamId}/${siteId}/${source.pageId}`}>
              [{sourcesIndex.get(source.pageId)}] {source.title ?? '제목 없음'}
            </a>
          </li>
        {/each}
      </ul>

      <h4 class={css({ marginTop: '20px', marginBottom: '8px', textStyle: '16sb', color: 'text.primary' })}>
        관련 페이지 청크
      </h4>
      <ul class={css({ listStyleType: 'disc', paddingLeft: '20px' })}>
        {#each results.pages as page, i (i)}
          <li class={css({ marginBottom: '4px', textStyle: '14r', color: 'text.secondary' })}>
            <a href={`/${teamId}/${siteId}/${page.id}`}>
              {i + 1}. {page.content.title ?? '제목 없음'}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</TitledModal>
