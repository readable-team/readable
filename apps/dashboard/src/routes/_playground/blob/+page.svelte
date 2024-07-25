<script lang="ts">
  import ky from 'ky';
  import { PUBLIC_USERCONTENTS_URL } from '$env/static/public';
  import { trpc } from '$lib/trpc';
</script>

<input
  type="file"
  on:change={async (e) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const { key, presignedUrl } = await trpc.blob.issueUploadUrl.mutate({ filename: file.name });
    await ky.put(presignedUrl, {
      body: file,
    });

    window.alert(`Uploaded ${file.name} to ${key}`);

    location.href = `${PUBLIC_USERCONTENTS_URL}/${key}`;
  }}
/>
