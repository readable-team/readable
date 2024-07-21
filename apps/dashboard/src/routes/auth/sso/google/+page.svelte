<script lang="ts">
  import { onMount } from 'svelte';
  import { SingleSignOnProvider } from '@/enums';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { accessToken, trpc } from '$lib/trpc';

  onMount(async () => {
    const resp = await trpc.auth.authorizeSingleSignOn.mutate({
      provider: SingleSignOnProvider.GOOGLE,
      params: Object.fromEntries($page.url.searchParams),
    });

    $accessToken = resp.accessToken;

    await goto('/');
  });
</script>

logging in...
