<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
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
    class={css({
      flex: '1',
      maxWidth: '820px',
      paddingX: {
        sm: '20px',
        mdToLg: '50px',
      },
      paddingTop: '20px',
      paddingBottom: '120px',
    })}
  >
    <div class={css({ hideBelow: 'md', marginBottom: '24px' })}>
      <Breadcrumb _query={$query} />
    </div>
    <h1 class={css({ textStyle: '34eb' })}>{$query.publicPage.content.title}</h1>

    <TiptapRenderer content={$query.publicPage.content.content} on:tocUpdate={(e) => (headings = e.detail.headings)} />
  </div>
</div>

<Toc {headings} />
