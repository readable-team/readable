<script lang="ts">
  import './app.css';

  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  const scriptUrl = new URL(import.meta.url);
  const siteId = scriptUrl.searchParams.get('siteId');

  let open = false;

  const selectors = [
    'title',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    '[role="heading"]',
    '[role="tab"][aria-selected="true"]',
  ];

  let loadingCount = 0;
  let response: {
    site: { id: string; name: string; url: string };
    pages: { id: string; title: string; score: number }[];
  } | null = null;
  let lastQueriedKeywords: string[] = [];

  $: if (open) {
    observe();
  }

  const observe = async () => {
    try {
      loadingCount += 1;

      // NOTE: 위젯이 열려있지 않으면 쿼리하지 않도록 임시 처리
      if (!open) {
        return;
      }

      const elements = [...document.querySelectorAll(selectors.join(','))];
      const texts = elements
        .map((element) => {
          const text = element.textContent ?? '';
          return text?.replaceAll(/\s+/g, ' ').trim();
        })
        .filter((text) => text.length > 0);

      if (texts.length === 0) {
        return;
      }

      // 간단한 캐싱
      if (JSON.stringify(lastQueriedKeywords) === JSON.stringify(texts)) {
        return;
      }

      lastQueriedKeywords = texts;

      const url = import.meta.env.PROD ? 'https://api.rdbl.io/widget/query' : 'http://localhost:3000/widget/query';
      const resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ keywords: texts, siteId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 쿼리 결과가 한번에 여러개 들어오는 경우 마지막 쿼리 결과만 사용하도록 함
      if (lastQueriedKeywords !== texts) {
        return;
      }

      response = await resp.json();
    } finally {
      loadingCount -= 1;
    }
  };

  onMount(() => {
    const observer = new MutationObserver(() => {
      observe();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observe();

    return () => {
      observer.disconnect();
    };
  });
</script>

<button
  class={center({
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    size: '40px',
    color: 'neutral.0',
    backgroundColor: 'neutral.100',
    borderRadius: 'full',
    textStyle: '24eb',
  })}
  type="button"
  on:click={() => (open = !open)}
  in:fly|global={{ y: 5 }}
>
  ?
</button>

{#if open}
  <div
    class={flex({
      direction: 'column',
      gap: '4px',
      position: 'fixed',
      bottom: '84px',
      right: '32px',
      borderRadius: '16px',
      paddingX: '24px',
      paddingY: '16px',
      textStyle: '14m',
      color: 'neutral.80',
      backgroundColor: 'white',
      boxShadow: 'emphasize',
    })}
    in:fly|global={{ y: 5 }}
  >
    <div class={css({ textStyle: '14b' })}>관련 문서</div>
    {#if loadingCount > 0}
      로딩중...
    {:else if response}
      {#each response.pages as page, idx (idx)}
        <div>
          <a
            class={css({
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              _hover: {
                color: 'neutral.100',
              },
            })}
            href={`${response.site.url}/go/${page.id}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {page.title}
          </a>
        </div>
      {:else}
        결과 없음
      {/each}
    {:else}
      결과 없음
    {/if}
  </div>
{/if}
