import Alert from './AlertBuilder.svelte';
import type { ComponentProps } from 'svelte';

export function invokeAlert(options: ComponentProps<Alert>) {
  const alert = new Alert({
    target: document.body,
    props: {
      open: true,
      ...options,
    },
  });

  return alert;
}
