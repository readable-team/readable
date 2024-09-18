<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { HorizontalDivider, TextInput } from '@readable/ui/components';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';
  import TitledModal from '$lib/components/TitledModal.svelte';

  let open = false;
  let query = '';
  let results: Awaited<ReturnType<(typeof searchPageByChange)['refetch']>>['searchPageByChange'];

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'k' && event.metaKey) {
      open = !open;
    }
  }

  async function handleSubmit() {
    console.log(query, $page.params.siteId);

    results = await searchPageByChange
      .refetch({
        siteId: $page.params.siteId,
        query,
      })
      .then((result) => result.searchPageByChange);

    console.log(results);
  }

  const searchPageByChange = graphql(`
    query AiSearch_Query2($query: String!, $siteId: String!) @manual {
      searchPageByChange(query: $query, siteId: $siteId) {
        fixes {
          completion
          reason
          severity
          text
        }
        page {
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
  <svelte:fragment slot="title">AI Fix</svelte:fragment>

  <form on:submit={handleSubmit}>
    <TextInput name="query" bind:value={query} />
  </form>
  {#if results}
    <div class={css({ marginTop: '20px' })}>
      {#each results as result, i (i)}
        <div
          class={css({
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'surface.secondary',
          })}
        >
          <h3 class={css({ marginBottom: '8px', textStyle: '18sb', color: 'text.primary' })}>
            {result.page.content.title}
          </h3>
          <p class={css({ marginBottom: '16px', textStyle: '14r', color: 'text.secondary' })}>
            {result.fixes.length}개의 수정 제안
          </p>
          {#each result.fixes as fix, j (j)}
            <div
              class={css({
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: 'surface.primary',
              })}
            >
              <p class={css({ marginBottom: '4px', textStyle: '14sb', color: 'text.primary' })}>
                {fix.text}
              </p>
              <p class={css({ marginBottom: '4px', textStyle: '13r', color: 'text.secondary' })}>
                reason: {fix.reason}
              </p>
              <p class={css({ marginBottom: '4px', textStyle: '13r', color: 'text.secondary' })}>
                severity: {fix.severity}
              </p>
              <p class={css({ textStyle: '13r', color: 'text.secondary' })}>
                completion: {fix.completion}
              </p>
            </div>
          {/each}
        </div>
        {#if i < results.length - 1}
          <HorizontalDivider style={css.raw({ marginBottom: '24px' })} />
        {/if}
      {/each}
    </div>
  {:else}
    <p class={css({ marginTop: '20px', textStyle: '16r', color: 'text.secondary', textAlign: 'center' })}>
      검색 결과가 없습니다.
    </p>
  {/if}
</TitledModal>
