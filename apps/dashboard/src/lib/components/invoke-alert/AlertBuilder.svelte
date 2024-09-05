<script lang="ts">
  import { Alert } from '@readable/ui/components';

  export let open = false;
  export let action: () => void;
  export let title: string;
  export let content: string;
  export let actionText = '확인';
  export let cancelText = '취소';
  export let variant: 'primary' | 'danger' = 'danger';
</script>

<Alert onAction={action} {variant} bind:open>
  <svelte:fragment slot="title">{title}</svelte:fragment>
  <svelte:fragment slot="content">
    {content}
  </svelte:fragment>

  <svelte:fragment slot="action">{actionText}</svelte:fragment>
  <svelte:fragment slot="cancel">{cancelText}</svelte:fragment>
</Alert>
