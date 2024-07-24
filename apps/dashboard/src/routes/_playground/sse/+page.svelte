<script lang="ts">
  import { onMount } from 'svelte';
  import { trpc } from '$lib/trpc';

  onMount(() => {
    const { unsubscribe } = trpc.playground.stream.subscribe(undefined, {
      onData: (data) => {
        console.log('data', data);
      },
      onError: (error) => {
        console.error('error', error);
      },
    });

    return () => {
      unsubscribe();
    };
  });
</script>
