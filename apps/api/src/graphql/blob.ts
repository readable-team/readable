import path from 'node:path';
import { CopyObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { builder } from '@/builder';
import { db, Files, firstOrThrow, Images } from '@/db';
import { env } from '@/env';
import * as aws from '@/external/aws';
import { Blob, File, Image } from './objects';

/**
 * * Types
 */

Blob.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
  }),
});

File.implement({
  interfaces: [Blob],
  fields: (t) => ({
    url: t.string({ resolve: (blob) => `${env.USERCONTENTS_URL}/files/${blob.path}` }),
  }),
});

Image.implement({
  interfaces: [Blob],
  fields: (t) => ({
    placeholder: t.exposeString('placeholder'),

    url: t.string({ resolve: (blob) => `${env.USERCONTENTS_URL}/images/${blob.path}` }),
  }),
});

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
        Bucket: 'readable-uploads',
        Key: key,
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

  persistBlobAsFile: t.withAuth({ session: true }).fieldWithInput({
    type: File,
    input: { path: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      const head = await aws.s3.send(
        new HeadObjectCommand({
          Bucket: 'readable-uploads',
          Key: input.path,
        }),
      );

      return await db.transaction(async (tx) => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const file = await tx
          .insert(Files)
          .values({
            userId: ctx.session.userId,
            name: decodeURIComponent(head.Metadata!.name),
            size: head.ContentLength!,
            format: head.ContentType!,
            path: input.path,
          })
          .returning()
          .then(firstOrThrow);
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        await aws.s3.send(
          new CopyObjectCommand({
            Bucket: 'readable-usercontents',
            CopySource: `readable-uploads/${input.path}`,
            Key: `files/${input.path}`,
          }),
        );

        return file;
      });
    },
  }),

  persistBlobAsImage: t.withAuth({ session: true }).fieldWithInput({
    type: Image,
    input: {
      path: t.input.string(),
      modification: t.input.field({ type: 'JSON', required: false }),
    },
    resolve: async (_, { input }, ctx) => {
      const object = await aws.s3.send(
        new GetObjectCommand({
          Bucket: 'readable-uploads',
          Key: input.path,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const buffer = await object.Body!.transformToByteArray();

      let img = sharp(buffer, { failOn: 'none' });

      if (input.modification) {
        if (input.modification.ensureAlpha) {
          img = img.ensureAlpha();
        }

        if (input.modification.resize) {
          img = img.resize(input.modification.resize);
        }

        if (input.modification.format) {
          img = img.toFormat(input.modification.format);
        }
      }

      const res = await img.toBuffer({ resolveWithObject: true });
      const mimetype = `image/${res.info.format}`;

      const raw = await img
        .clone()
        .resize({ width: 100, height: 100, fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const placeholder = rgbaToThumbHash(raw.info.width, raw.info.height, raw.data);

      return await db.transaction(async (tx) => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const image = await tx
          .insert(Images)
          .values({
            userId: ctx.session.userId,
            name: decodeURIComponent(object.Metadata!.name),
            size: res.info.size,
            format: mimetype,
            width: res.info.width,
            height: res.info.height,
            path: input.path,
            placeholder: Buffer.from(placeholder).toString('base64'),
          })
          .returning()
          .then(firstOrThrow);
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        await aws.s3.send(
          new PutObjectCommand({
            Bucket: 'readable-usercontents',
            Key: `images/${input.path}`,
            Body: res.data,
            ContentType: mimetype,
            Metadata: {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              'name': object.Metadata!.name,
              'user-id': ctx.session.userId,
            },
          }),
        );

        return image;
      });
    },
  }),
}));
