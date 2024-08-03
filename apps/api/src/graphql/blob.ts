import path from 'node:path';
import { CopyObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { builder } from '@/builder';
import * as aws from '@/external/aws';

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  issueBlobUploadUrl: t.withAuth({ session: true }).fieldWithInput({
    type: t.builder.simpleObject('IssueBlobUploadUrlResult', {
      fields: (t) => ({
        path: t.string(),
        url: t.string(),
        fields: t.field({ type: 'JSON' }),
      }),
    }),
    input: { filename: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      const ext = path.extname(input.filename);
      const key = `${aws.createFragmentedS3ObjectKey()}${ext}`;

      const req = await createPresignedPost(aws.s3, {
        Bucket: 'readable-usercontents',
        Key: `uploads/${key}`,
        Conditions: [
          ['content-length-range', 0, 1024 * 1024 * 1024], // 1GB
          ['starts-with', '$Content-Type', ''],
        ],
        Fields: {
          'x-amz-meta-name': encodeURIComponent(input.filename),
          'x-amz-meta-user-id': ctx.session.userId,
        },
        Expires: 60 * 5, // 5 minutes
      });

      return {
        path: key,
        url: req.url,
        fields: req.fields,
      };
    },
  }),

  finishBlobUpload: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: { path: t.input.string() },
    resolve: async (_, { input }) => {
      await aws.s3.send(
        new CopyObjectCommand({
          Bucket: 'readable-usercontents',
          CopySource: `readable-usercontents/uploads/${input.path}`,
          Key: `public/${input.path}`,
        }),
      );

      return true;
    },
  }),
}));
