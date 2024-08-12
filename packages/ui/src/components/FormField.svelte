<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import InfoIcon from '~icons/lucide/info';
  import { setFormField } from '../forms';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import Icon from './Icon.svelte';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;

  setFormField({
    name,
  });
</script>

<fieldset class={css({ display: 'flex', flexDirection: 'column' }, style)}>
  <slot />

  <div
    class={css({
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      textStyle: '12r',
      marginTop: '8px',
      color: { base: 'red.600', _dark: 'red.500' },
    })}
  >
    <FormValidationMessage for={name} let:message>
      <Icon icon={InfoIcon} size={12} />
      {message}
    </FormValidationMessage>
  </div>
</fieldset>
