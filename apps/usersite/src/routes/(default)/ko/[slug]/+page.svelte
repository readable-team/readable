<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { TiptapRenderer } from '@readable/ui/tiptap';
  import MenuIcon from '~icons/lucide/menu';
  import { graphql } from '$graphql';
  import { mobileNavOpen } from '$lib/stores/ui';
  import Breadcrumb from './Breadcrumb.svelte';
  import Toc from './Toc.svelte';

  $: query = graphql(`
    query PagePage_Query($slug: String!) {
      publicPage(slug: $slug) {
        id
        slug

        content {
          id
          title
          content
        }
      }

      ...PagePage_Breadcrumb_query
    }
  `);

  let headings: { level: number; text: string; scrollTop: number }[] = [];
</script>

<div class={flex({ flex: '1', direction: 'column' })}>
  <div
    class={flex({
      position: 'sticky',
      top: '64px',
      hideFrom: 'md',
      alignItems: 'center',
      gap: '4px',
      paddingX: '20px',
      paddingBottom: '12px',
      backgroundColor: 'surface.primary',
      borderBottomWidth: '1px',
      borderBottomColor: 'border.primary',
    })}
  >
    <button type="button" on:click={() => mobileNavOpen.set(true)}>
      <Icon style={css.raw({ color: 'text.secondary' })} icon={MenuIcon} size={20} />
    </button>
    <Breadcrumb _query={$query} />
  </div>
  <div
    class={grid({
      flex: '1',
      maxWidth: {
        base: '[820px]',
        lg: 'full',
      },
      paddingX: {
        base: '40px',
        smOnly: '20px',
      },
      paddingRight: {
        lgOnly: '0',
      },
      columns: {
        base: 1,
        lg: 2,
      },
      columnGap: '40px',
      gridTemplateAreas: {
        base: '"breadcrumb" "title" "content"',
        lg: '"breadcrumb toc" "title toc" "content toc"',
      },
      gridTemplateColumns: {
        base: '[1fr]',
        lg: '[minmax(1fr, 820px) 220px]',
      },
    })}
  >
    <div class={css({ hideBelow: 'md', paddingTop: '38px', marginBottom: '24px', gridArea: 'breadcrumb' })}>
      <Breadcrumb _query={$query} />
    </div>
    <h1 class={css({ textStyle: '34eb', marginBottom: '20px', gridArea: 'title' })}>
      {$query.publicPage.content.title}
    </h1>

    <div class={css({ hideBelow: 'lg', gridArea: 'toc' })}>
      <Toc {headings} />
    </div>

    <div class={css({ gridArea: 'content', paddingBottom: '120px' })}>
      <TiptapRenderer
        content={$query.publicPage.content.content}
        on:tocUpdate={(e) => (headings = e.detail.headings)}
      />
    </div>
  </div>
</div>
