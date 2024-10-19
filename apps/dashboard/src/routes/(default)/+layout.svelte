<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import mixpanel from 'mixpanel-browser';
  import qs from 'query-string';
  import { browser, dev } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query DefaultLayout_Query {
      me {
        id
        name
        email

        avatar {
          id
          url
        }
      }
    }
  `);

  $: if (browser && $query.me) {
    mixpanel.identify($query.me.id);

    mixpanel.people.set({
      $email: $query.me.email,
      $name: $query.me.name,
      $avatar: qs.stringifyUrl({ url: $query.me.avatar.url, query: { s: 256, f: 'png' } }),
    });
  }
</script>

<svelte:head>
  {#if env.PUBLIC_PULUMI_STACK !== 'prod'}
    <script
      async
      src={dev
        ? 'http://localhost:3100/script.js?siteId=S0000000DOCS'
        : 'https://sdk.rdbl.io/script.js?siteId=S0000000DOCS'}
      type="module"
    ></script>
  {/if}
</svelte:head>

<div
  class={flex({
    direction: 'column',
    grow: 1,
    minWidth: '1280px',
    minHeight: 'screen',
  })}
>
  <slot />
</div>
