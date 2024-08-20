<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import InfoIcon from '~icons/lucide/info';
  import { setFormField } from '../forms';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import Icon from './Icon.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;
  export let label: string | undefined = undefined;
  export let description: string | undefined = undefined;

  setFormField({
    name,
  });
</script>

<fieldset class={css({ display: 'flex', flexDirection: 'column' }, style)}>
  {#if label}
    <label class={css({ marginBottom: '4px', textStyle: '14b', color: 'neutral.80' })} for={name}>
      {label}
    </label>
  {/if}

  {#if description}
    <p class={css({ marginBottom: '4px', textStyle: '12m', color: 'neutral.70' })}>
      {description}
    </p>
  {/if}

  <slot />

  <div
    class={flex({
      align: 'center',
      justify: 'space-between',
      gap: '4px',
      textStyle: '12r',
      marginTop: '4px',
      color: { base: 'red.600', _dark: 'red.500' },
    })}
  >
    <div class={flex({ align: 'center', gap: '4px' })}>
      <FormValidationMessage for={name} let:message>
        <Icon icon={InfoIcon} size={12} />
        {message}
      </FormValidationMessage>
    </div>

    {#if 'right-text' in $$slots}
      <span class={css({ textStyle: '12m', color: 'neutral.70' })}>
        <slot name="right-text" />
      </span>
    {/if}
  </div>
</fieldset>
