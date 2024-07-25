import path from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import * as aws from '@/external/aws';
import { router, sessionProcedure } from '@/trpc';

export const blobRouter = router({
  issueUploadUrl: sessionProcedure.input(z.object({ filename: z.string() })).mutation(async ({ input, ctx }) => {
    const ext = path.extname(input.filename);
    const key = aws.createFragmentedS3ObjectKey() + ext;

    const presignedUrl = await getSignedUrl(
      aws.s3,
      new PutObjectCommand({
        Bucket: 'readable-usercontents',
        Key: key,
        Metadata: {
          name: encodeURIComponent(input.filename),
          userId: ctx.session.userId,
        },
      }),
      { expiresIn: 60 * 60 }, // 1 hour
    );

    return {
      key,
      presignedUrl,
    };
  }),
});
