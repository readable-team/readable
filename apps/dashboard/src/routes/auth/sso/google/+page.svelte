<script lang="ts">
  import { onMount } from 'svelte';
  import { SingleSignOnProvider } from '@/enums';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$graphql';

  const authorizeSingleSignOn = graphql(`
    mutation SSOGooglePage_AuthorizeSingleSignOn_Mutation($input: AuthorizeSingleSignOnInput!) {
      authorizeSingleSignOn(input: $input) {
        id
      }
    }
  `);

  onMount(async () => {
    await authorizeSingleSignOn({
      provider: SingleSignOnProvider.GOOGLE,
      params: Object.fromEntries($page.url.searchParams),
    });

    await goto('/');
  });
</script>

logging in...
