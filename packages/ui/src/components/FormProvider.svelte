<script lang="ts">
  import type { FormAction } from '@felte/core';
  import type { HTMLFormAttributes } from 'svelte/elements';

  export let form: FormAction;
  export let context: () => void;

  type $$Props = {
    form: FormAction;
    context: () => void;
  } & HTMLFormAttributes;

  $: ({ form, context, ...rest } = $$props as $$Props);
  context();
</script>

<form use:form {...rest}>
  <slot />
</form>
