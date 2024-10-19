<script lang="ts">
  import './app.css';

  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

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

  let loading = false;
  let pages: string[] = [];
  let lastQueriedKeywords: string[] = [];

  $: if (open) {
    observe();
  }

  const observe = async () => {
    try {
      // NOTE: 위젯이 열려있지 않으면 쿼리하지 않도록 임시 처리
      if (!open) {
        return;
      }

      loading = true;

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

      const data = await resp.json();
      const pages_ = [];
      for (const page of data.pages) {
        pages_.push(page.title);
      }

      pages = pages_;
    } finally {
      loading = false;
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
    class={css({
      position: 'fixed',
      bottom: '72px',
      right: '32px',
      backgroundColor: 'neutral.20',
    })}
    in:fly|global={{ y: 5 }}
  >
    {#if loading}
      로딩중...
    {:else}
      {#each pages as page, idx (idx)}
        <div>{page}</div>
      {:else}
        결과 없음
      {/each}
    {/if}
  </div>
{/if}
