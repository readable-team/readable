<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import qs from 'query-string';
  import { browser } from '$app/environment';
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

<slot />
