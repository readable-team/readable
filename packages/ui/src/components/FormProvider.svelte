<script lang="ts">
  import type { FormAction } from '@felte/core';

  export let form: FormAction;
  export let context: () => void;

  context();
</script>

<form use:form {...$$props}>
  <slot />
</form>
