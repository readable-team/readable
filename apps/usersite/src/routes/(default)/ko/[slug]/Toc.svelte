<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { createAnchorId } from '@readable/ui/utils';
  import TextIcon from '~icons/lucide/text';
  import { page } from '$app/stores';

  // TODO
  let dummyToc = [
    {
      title: 'hello',
      level: 1,
    },
    {
      title: 'welcome',
      level: 2,
    },
    {
      title: 'hi',
      level: 3,
    },
    {
      title: '제목 4',
      level: 1,
    },
  ] as const;
</script>

<div
  class={flex({
    position: 'sticky',
    top: '65px',
    flexDirection: 'column',
    gap: '8px',
    width: '220px',
    paddingX: '20px',
    paddingY: '24px',
  })}
  hidden={dummyToc.length <= 1}
>
  <div class={flex({ gap: '6px', alignItems: 'center', color: 'text.tertiary' })}>
    <Icon icon={TextIcon} size={16} />
    <span class={css({ textStyle: '13m' })}>ON THIS PAGE</span>
  </div>
  <nav role="doc-toc">
    <ul>
      {#each dummyToc as item (item.title)}
        <li>
          <a
            style:padding-left={`${(item.level - 1) * 16}px`}
            class={css({
              textStyle: '15b',
              padding: '3px',
              color: 'text.secondary',
              _hover: { color: 'var(--usersite-theme-color)/72' },
              _currentLocation: { color: 'var(--usersite-theme-color)' },
            })}
            aria-current={$page.url.hash === `#${createAnchorId(item.title)}` ? 'location' : undefined}
            href={`#${createAnchorId(item.title)}`}
          >
            {item.title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</div>
