import got from 'got';
import { match } from 'ts-pattern';
import { env } from '@/env';

type SlackChannel = 'feedback';

export const logToSlack = (channel: SlackChannel, message: Record<string, unknown>) => {
  try {
    got({
      url: match(channel)
        .with('feedback', () => env.SLACK_FEEDBACK_WEBHOOK_URL)
        .exhaustive(),
      method: 'POST',
      json: message,
    });
  } catch {
    /* empty */
  }
};
