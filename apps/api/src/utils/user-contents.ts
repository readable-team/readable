import { PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { base64 } from 'rfc4648';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { db, Files, firstOrThrow, Images } from '@/db';
import * as aws from '@/external/aws';

type PersistBlobAsImageParams = { userId?: string; file: File };
export const persistBlobAsImage = async ({ userId, file }: PersistBlobAsImageParams) => {
  const buffer = await file.arrayBuffer();
  const img = sharp(buffer, { failOn: 'none' });
  const metadata = await img.metadata();
  const mimetype = `image/${metadata.format}`;

  const raw = await img
    .resize({ width: 100, height: 100, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const placeholder = rgbaToThumbHash(raw.info.width, raw.info.height, raw.data);

  const ext = mime.extension(mimetype) || 'bin';
  const key = `${aws.createFragmentedS3ObjectKey()}.${ext}`;

  return await db.transaction(async (tx) => {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const image = await tx
      .insert(Images)
      .values({
        userId,
        name: file.name,
        size: file.size,
        format: mimetype,
        width: metadata.width!,
        height: metadata.height!,
        path: key,
        placeholder: base64.stringify(placeholder),
      })
      .returning()
      .then(firstOrThrow);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    await aws.s3.send(
      new PutObjectCommand({
        Bucket: 'readable-usercontents',
        Key: `images/${key}`,
        Body: Buffer.from(buffer),
        ContentType: mimetype,
        Metadata: {
          'name': encodeURIComponent(file.name),
          'user-id': userId ?? '',
        },
      }),
    );

    return image;
  });
};

type PersistBlobAsFileParams = { userId?: string; file: File };
export const persistBlobAsFile = async ({ userId, file }: PersistBlobAsFileParams) => {
  const buffer = await file.arrayBuffer();
  const mimetype = mime.lookup(file.name) || 'application/octet-stream';

  const ext = mime.extension(mimetype) || 'bin';
  const key = `${aws.createFragmentedS3ObjectKey()}.${ext}`;

  return await db.transaction(async (tx) => {
    const image = await tx
      .insert(Files)
      .values({
        userId,
        name: file.name,
        size: file.size,
        format: mimetype,
        path: key,
      })
      .returning()
      .then(firstOrThrow);

    await aws.s3.send(
      new PutObjectCommand({
        Bucket: 'readable-usercontents',
        Key: `files/${key}`,
        Body: Buffer.from(buffer),
        ContentType: mimetype,
        ContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
        Metadata: {
          'name': encodeURIComponent(file.name),
          'user-id': userId ?? '',
        },
      }),
    );

    return image;
  });
};
