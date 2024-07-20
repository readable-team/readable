<script lang="ts">
  import { SingleSignOnProvider } from '@/enums';
  import { page } from '$app/stores';
  import { trpc } from '$lib/trpc';
</script>

<button
  type="button"
  on:click={async () => {
    const url = await trpc.auth.generateSingleSignOnAuthorizationUrl.mutate({
      provider: SingleSignOnProvider.GOOGLE,
      origin: $page.url.origin,
    });

    location.href = url;
  }}
>
  login
</button>
