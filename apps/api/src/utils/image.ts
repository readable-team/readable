import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { Images } from '@/db';
import * as aws from '@/external/aws';
import { getDominantColor } from './mmcq';
import type { Transaction } from '@/db';

export const extractImageMetadata = async (source: Buffer) => {
  let image = sharp(source, { failOn: 'none', animated: true });
  let singleImage = sharp(source, { failOn: 'none' });

  image = image.rotate();
  singleImage = singleImage.rotate();

  const getMetadata = async () => {
    return await image.clone().metadata();
  };

  const getColor = async () => {
    const buffer = await singleImage.clone().raw().toBuffer();
    return getDominantColor(buffer);
  };

  const getPlaceholder = async () => {
    const {
      data: raw,
      info: { width, height },
    } = await singleImage
      .clone()
      .resize({
        width: 100,
        height: 100,
        fit: 'inside',
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = rgbaToThumbHash(width, height, raw);
    return Buffer.from(hash).toString('base64');
  };

  const getHash = async () => {
    const size = 16;

    const raw = await singleImage
      .clone()
      .greyscale()
      .resize({
        width: size + 1,
        height: size,
        fit: 'fill',
      })
      .raw()
      .toBuffer();

    let difference = '';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const left = raw[row * (size + 1) + col];
        const right = raw[row * (size + 1) + col + 1];
        difference += left < right ? 1 : 0;
      }
    }

    let hash = '';
    for (let i = 0; i < difference.length; i += 4) {
      const chunk = difference.slice(i, i + 4);
      hash += Number.parseInt(chunk, 2).toString(16);
    }

    return hash;
  };

  const [metadata, color, placeholder, hash] = await Promise.all([
    getMetadata(),
    getColor(),
    getPlaceholder(),
    getHash(),
  ]);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return {
    ext: metadata.format!,
    format: `image/${metadata.format!}`,
    size: metadata.size!,
    width: metadata.width!,
    height: metadata.pageHeight ?? metadata.height!,
    color,
    placeholder,
    hash,
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
};

type UploadImageParams = {
  tx: Transaction;
  name: string;
  source: ArrayBuffer;
};
export const uploadImage = async ({ tx, name, source }: UploadImageParams) => {
  const buffer = Buffer.from(source);

  const metadata = await extractImageMetadata(buffer);

  const key = aws.createFragmentedS3ObjectKey();
  const path = `${key}.${metadata.ext}`;

  await aws.s3.send(
    new PutObjectCommand({
      Bucket: 'readable-usercontents',
      Key: `public/images/${path}`,
      Body: buffer,
      ContentType: metadata.format,
    }),
  );

  const [image] = await tx
    .insert(Images)
    .values({
      name,
      format: metadata.format,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      path,
      color: metadata.color,
      placeholder: metadata.placeholder,
      hash: metadata.hash,
    })
    .returning({ id: Images.id });

  return image.id;
};
