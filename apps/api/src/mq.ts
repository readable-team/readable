import { Connection } from 'rabbitmq-client';
import { env } from '@/env';

export const rabbit = new Connection(env.RABBITMQ_URL);
export const pub = rabbit.createPublisher({
  confirm: true,
  maxAttempts: 3,
});
