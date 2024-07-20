<script lang="ts">
  import { onMount } from 'svelte';
  import { SingleSignOnProvider } from '@/enums';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { trpc } from '$lib/trpc';

  onMount(async () => {
    await trpc.auth.authorizeSingleSignOn.mutate({
      provider: SingleSignOnProvider.GOOGLE,
      origin: $page.url.origin,
      params: Object.fromEntries($page.url.searchParams),
    });

    await goto('/');
  });
</script>
