import path from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { builder } from '@/builder';
import * as aws from '@/external/aws';

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  issueUploadUrl: t.withAuth({ session: true }).fieldWithInput({
    type: t.builder.simpleObject('IssueUploadUrlSuccess', {
      fields: (t) => ({
        key: t.string(),
        presignedUrl: t.string(),
      }),
    }),
    input: { filename: t.input.string() },
    errors: { directResult: true },
    resolve: async (_, { input }, context) => {
      const ext = path.extname(input.filename);
      const key = aws.createFragmentedS3ObjectKey() + ext;

      const presignedUrl = await getSignedUrl(
        aws.s3,
        new PutObjectCommand({
          Bucket: 'readable-usercontents',
          Key: key,
          Metadata: {
            name: encodeURIComponent(input.filename),
            userId: context.session.userId,
          },
        }),
        { expiresIn: 60 * 60 }, // 1 hour
      );

      return {
        key,
        presignedUrl,
      };
    },
  }),
}));
