<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import InfoIcon from '~icons/lucide/info';
  import { setFormField } from '../forms';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;
  export let label: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let noMessage = false;

  setFormField({
    name,
  });
</script>

<fieldset class={css({ display: 'flex', flexDirection: 'column' }, style)}>
  {#if label}
    <label
      class={flex({
        align: 'center',
        gap: '4px',
        marginBottom: '8px',
        textStyle: '14sb',
        color: { base: 'gray.700', _dark: 'gray.300' },
      })}
      for={name}
    >
      <span>
        {label}
      </span>
      {#if description}
        <Tooltip message={description} placement="right">
          <Icon style={css.raw({ color: 'neutral.50' })} icon={InfoIcon} size={14} />
        </Tooltip>
      {/if}
    </label>
  {/if}

  <slot />

  {#if !noMessage}
    <div
      class={flex({
        align: 'center',
        justify: 'space-between',
        gap: '4px',
        height: '17px',
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
  {/if}
</fieldset>
