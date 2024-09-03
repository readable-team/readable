<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { createAnchorId } from '@readable/ui/utils';
  import { onMount } from 'svelte';
  import TextIcon from '~icons/lucide/text';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let headings: { level: number; text: string; scrollTop: number }[] = [];

  let scrollMarginTop = 113; /* 헤더 높이 + 48px */
  let boundary = scrollMarginTop;
  let boundaryLock = false;

  let activeHeadingIndex = 0;
  let prevScrollY: number | null = null;
  const handleScroll = () => {
    if (prevScrollY) {
      const scrollDiff = window.scrollY - prevScrollY;
      if (scrollDiff < 0) {
        // 위로 스크롤
        if (!boundaryLock) {
          boundary += scrollDiff;
          boundary = Math.max(boundary, scrollMarginTop);
        }

        // boundary 밑에 있는 가장 가까운 헤딩 찾기
        let newActiveIndex = headings.findIndex((heading) => heading.scrollTop >= window.scrollY + boundary);
        if (newActiveIndex === -1) {
          newActiveIndex = headings.length - 1;
        }
        if (newActiveIndex < activeHeadingIndex) {
          activeHeadingIndex = newActiveIndex;
        }
      } else if (scrollDiff > 0) {
        // 아래로 스크롤
        if (!boundaryLock) {
          boundary += scrollDiff;
          boundary = Math.min(boundary, (window.innerHeight - scrollMarginTop) / 2);
        }

        // boundary 위에 있는 가장 가까운 헤딩 뒤에서부터 찾기
        let newActiveIndex = headings.findLastIndex((heading) => heading.scrollTop <= window.scrollY + boundary);
        if (newActiveIndex === -1) {
          newActiveIndex = 0;
        }
        if (newActiveIndex > activeHeadingIndex) {
          activeHeadingIndex = newActiveIndex;
        }
      }
    }

    prevScrollY = window.scrollY;
  };

  const handleClick = async (event: MouseEvent, item: (typeof headings)[number]) => {
    event.preventDefault();
    goto(`#${createAnchorId(item.text)}`, {
      noScroll: true,
    });
    boundary = scrollMarginTop;
    boundaryLock = true;
    await scrollToElementTop(item.scrollTop - scrollMarginTop);
    boundaryLock = false;
  };

  const scrollToElementTop = (top: number) => {
    setTimeout(() => {
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    });

    return new Promise((resolve) => {
      const scrollendHandler = () => {
        window.removeEventListener('scrollend', scrollendHandler);
        resolve(void 0);
      };
      window.addEventListener('scrollend', scrollendHandler);
    });
  };

  onMount(() => {
    // FIXME: 마운트 시점에 처음 들어오는 scrollTop 값이 이상해서 임시로 setTimeout 사용
    setTimeout(() => {
      const anchor = headings.find((heading) => `#${createAnchorId(heading.text)}` === $page.url.hash);
      if (anchor) {
        window.scrollTo({
          top: anchor.scrollTop - scrollMarginTop,
          behavior: 'auto',
        });
        activeHeadingIndex = headings.indexOf(anchor);
      }
    }, 0);
  });
</script>

<svelte:window on:scroll={handleScroll} />

<div
  class={flex({
    hideBelow: 'lg',
    flexShrink: 0,
    position: 'sticky',
    top: '65px',
    flexDirection: 'column',
    gap: '8px',
    width: '220px',
    paddingX: '20px',
    paddingY: '24px',
  })}
  hidden={headings.length <= 1}
>
  <div class={flex({ gap: '6px', alignItems: 'center', color: 'text.tertiary' })}>
    <Icon icon={TextIcon} size={16} />
    <span class={css({ textStyle: '13m' })}>ON THIS PAGE</span>
  </div>
  <nav role="doc-toc">
    <ul>
      {#each headings as item, index (item.text)}
        <li>
          <a
            style:padding-left={`${(item.level - 1) * 16}px`}
            class={css(
              {
                textStyle: '15b',
                padding: '3px',
                color: 'text.secondary',
                _hover: { color: 'var(--usersite-theme-color)/72' },
              },
              activeHeadingIndex === index && { color: 'var(--usersite-theme-color)' },
            )}
            aria-current={$page.url.hash === `#${createAnchorId(item.text)}` ? 'location' : undefined}
            href={`#${createAnchorId(item.text)}`}
            on:click={(e) => handleClick(e, item)}
          >
            {item.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</div>
