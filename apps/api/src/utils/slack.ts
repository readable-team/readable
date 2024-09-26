import got from 'got';
import { match } from 'ts-pattern';
import { env } from '@/env';

type SlackChannel = 'inquiry';

export const logToSlack = (channel: SlackChannel, message: Record<string, unknown>) => {
  try {
    got({
      url: match(channel)
        .with('inquiry', () => env.SLACK_INQUIRY_WEBHOOK_URL)
        .exhaustive(),
      method: 'POST',
      json: message,
    });
  } catch {
    /* empty */
  }
};
