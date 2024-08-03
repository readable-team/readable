<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { uploadBlob } from '$lib/utils/blob.svelte';
</script>

<input
  type="file"
  on:change={async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const path = await uploadBlob(file);

    location.href = `${env.PUBLIC_USERCONTENTS_URL}/${path}`;
  }}
/>
