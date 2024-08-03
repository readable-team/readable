<script context="module" lang="ts">
  import ky from 'ky';
  import { graphql } from '$graphql';

  const issueBlobUploadUrl = graphql(`
    mutation BlobUtils_IssueBlobUploadUrl($input: IssueBlobUploadUrlInput!) {
      issueBlobUploadUrl(input: $input) {
        path
        url
        fields
      }
    }
  `);

  const finishBlobUpload = graphql(`
    mutation BlobUtils_FinishBlobUpload($input: FinishBlobUploadInput!) {
      finishBlobUpload(input: $input)
    }
  `);

  export const uploadBlob = async (file: File) => {
    const { path, url, fields } = await issueBlobUploadUrl({ filename: file.name });

    const formData = new FormData();
    for (const [key, value] of Object.entries<string>(fields)) {
      formData.append(key, value);
    }

    formData.append('Content-Type', file.type);
    formData.append('file', file);

    await ky.post(url, { body: formData });
    await finishBlobUpload({ path });

    return path;
  };
</script>
