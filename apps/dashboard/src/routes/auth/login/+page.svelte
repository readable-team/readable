<script lang="ts">
  import { SingleSignOnProvider } from '@/enums';
  import { trpc } from '$lib/trpc';
</script>

<button
  type="button"
  on:click={async () => {
    const url = await trpc.auth.generateSingleSignOnAuthorizationUrl.mutate({
      provider: SingleSignOnProvider.GOOGLE,
    });

    location.href = url;
  }}
>
  login
</button>
