<script context="module" lang="ts">
  import ky from 'ky';
  import { match } from 'ts-pattern';
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

  const persistBlobAsFile = graphql(`
    mutation BlobUtils_PersistBlobAsFile($input: PersistBlobAsFileInput!) {
      persistBlobAsFile(input: $input) {
        id
      }
    }
  `);

  const persistBlobAsImage = graphql(`
    mutation BlobUtils_PersistBlobAsImage($input: PersistBlobAsImageInput!) {
      persistBlobAsImage(input: $input) {
        id
      }
    }
  `);

  export const uploadBlob = async (as: 'file' | 'image', file: File) => {
    const { path, url, fields } = await issueBlobUploadUrl({ filename: file.name });

    const formData = new FormData();
    for (const [key, value] of Object.entries<string>(fields)) {
      formData.append(key, value);
    }

    formData.append('Content-Type', file.type);
    formData.append('file', file);

    await ky.post(url, { body: formData });

    return await match(as)
      .with('file', () => persistBlobAsFile({ path }))
      .with('image', () => persistBlobAsImage({ path }))
      .exhaustive();
  };
</script>
