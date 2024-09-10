<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid } from '@readable/styled-system/patterns';
  import { Helmet, Icon } from '@readable/ui/components';
  import { TiptapRenderer } from '@readable/ui/tiptap';
  import MenuIcon from '~icons/lucide/menu';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';
  import { mobileNavOpen } from '$lib/stores/ui';
  import Breadcrumb from './Breadcrumb.svelte';
  import Toc from './Toc.svelte';

  $: query = graphql(`
    query PagePage_Query($slug: String!) {
      publicSite {
        id
        name
      }

      publicPage(slug: $slug) {
        id
        slug

        content {
          id
          title
          content
          excerpt
        }

        ...PagePage_Breadcrumb_publicPage
      }
    }
  `);

  let headings: { level: number; text: string; scrollTop: number }[] = [];
</script>

<Helmet
  description={$query.publicPage.content.excerpt}
  image={{
    src: `${env.PUBLIC_API_URL}/opengraph/pages/${$query.publicPage.id}.png`,
    size: 'large',
  }}
  title={$query.publicPage.content.title}
  trailing={$query.publicSite.name}
/>

<div class={flex({ flex: '1', direction: 'column' })}>
  <div
    class={flex({
      position: 'sticky',
      top: '64px',
      zIndex: '1',
      hideFrom: 'md',
      alignItems: 'center',
      gap: '8px',
      paddingX: '20px',
      paddingBottom: '12px',
      backgroundColor: 'surface.primary',
      borderBottomWidth: '1px',
      borderBottomColor: 'border.secondary',
    })}
  >
    <button type="button" on:click={() => mobileNavOpen.set(true)}>
      <Icon style={css.raw({ color: 'text.secondary' })} icon={MenuIcon} size={20} />
    </button>
    <Breadcrumb _publicPage={$query.publicPage} />
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
    <div
      class={css({
        hideBelow: 'md',
        paddingTop: '38px',
        marginBottom: '24px',
        gridArea: 'breadcrumb',
        maxWidth: '720px',
      })}
    >
      <Breadcrumb _publicPage={$query.publicPage} />
    </div>
    <h1
      class={css({
        marginTop: { base: '32px', md: '16px' },
        textStyle: '34b',
        lineHeight: '[1.3]',
        marginBottom: '20px',
        gridArea: 'title',
        maxWidth: '720px',
      })}
    >
      {$query.publicPage.content.title}
    </h1>

    <div class={css({ hideBelow: 'lg', gridArea: 'toc' })}>
      <Toc {headings} />
    </div>

    <div class={css({ gridArea: 'content', paddingBottom: '120px', maxWidth: '720px' })}>
      <TiptapRenderer
        content={$query.publicPage.content.content}
        on:tocUpdate={(e) => (headings = e.detail.headings)}
      />
    </div>
  </div>
</div>
