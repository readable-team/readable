import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

export const s3 = new S3Client();

export const createFragmentedS3ObjectKey = () => {
  const now = dayjs();
  const year = now.format('YY');
  const month = now.format('MM');

  const key = nanoid();
  const fragment = key[0];
  const subfragment = `${fragment}${key[1]}`;

  return `${year}/${month}/${fragment}/${subfragment}/${key}`;
};

type UploadUserContentsParams = { userId: string; filename: string; source: Buffer };
export const uploadUserContents = async ({ userId, filename, source }: UploadUserContentsParams) => {
  const ext = path.extname(filename);
  const key = `${createFragmentedS3ObjectKey()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: 'readable-usercontents',
      Key: `public/${key}`,
      Body: source,
      Metadata: {
        'name': encodeURIComponent(filename),
        'user-id': userId,
      },
    }),
  );

  return key;
};
