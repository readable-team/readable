import path from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { db, firstOrThrow, Images } from '@/db';
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

  const ext = path.extname(file.name);
  const key = `${aws.createFragmentedS3ObjectKey()}${ext}`;

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
        placeholder: Buffer.from(placeholder).toString('base64'),
      })
      .returning()
      .then(firstOrThrow);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    await aws.s3.send(
      new PutObjectCommand({
        Bucket: 'readable-usercontents',
        Key: `public/${key}`,
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
