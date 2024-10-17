import { S3Client, WriteGetObjectResponseCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

type Event = {
  getObjectContext: {
    inputS3Url: string;
    outputRoute: string;
    outputToken: string;
  };
  userRequest: {
    url: string;
  };
};

const S3 = new S3Client();
sharp.concurrency(4);

export const handler = async (event: Event) => {
  const url = new URL(event.userRequest.url);

  const size = Number(url.searchParams.get('s')) || null;
  let format = url.searchParams.get('f') || 'auto';

  if (size !== null && size <= 0) {
    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        StatusCode: 400,
        ErrorCode: 'InvalidRequest',
      }),
    );

    return new Response(null, { status: 400 });
  }

  const resp = await fetch(event.getObjectContext.inputS3Url);
  if (!resp.ok) {
    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        StatusCode: 500,
        ErrorCode: 'FetchError',
        ErrorMessage: `Fetch failed with '${resp.status} ${resp.statusText}'`,
      }),
    );

    return new Response(null, { status: 500 });
  }

  const started = performance.now();

  const input = await resp.arrayBuffer();
  let image = sharp(input, { failOn: 'none', animated: true, limitInputPixels: false });
  const metadata = await image.metadata();

  if (metadata.format === 'svg' && format === 'auto') {
    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        Body: Buffer.from(input),
        ContentType: `image/svg+xml`,
        CacheControl: 'public, max-age=31536000, immutable',
        Metadata: {
          Bypass: 'true',
        },
      }),
    );

    return new Response(null, { status: 200 });
  }

  if (size) {
    image = image.resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (format === 'auto') {
    image = image.webp();
    format = 'webp';
  } else if (format === 'webp') {
    image = image.webp();
  } else if (format === 'png') {
    image = image.png();
  }

  const output = await image.toBuffer();

  const finished = performance.now();

  await S3.send(
    new WriteGetObjectResponseCommand({
      RequestRoute: event.getObjectContext.outputRoute,
      RequestToken: event.getObjectContext.outputToken,
      Body: output,
      ContentType: `image/${format}`,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        Elapsed: String((finished - started).toFixed(2)),
        Ratio: String((output.byteLength / input.byteLength).toFixed(2)),
      },
    }),
  );

  return new Response(null, { status: 200 });
};
