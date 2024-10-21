<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, Modal } from '@readable/ui/components';
  import XIcon from '~icons/lucide/x';
  import type { SystemStyleObject } from '@readable/styled-system/types';

  export let open = false;
  export let style: SystemStyleObject | undefined = undefined;
</script>

<Modal style={css.raw({ width: '600px' }, style)} close={() => (open = false)} bind:open>
  <div
    class={flex({
      position: 'sticky',
      top: '0',
      zIndex: '10',
      backgroundColor: 'surface.primary',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingX: '32px',
      paddingY: '20px',
      borderBottomWidth: '1px',
      borderColor: 'border.secondary',
    })}
  >
    <h2 class={css({ textStyle: '16sb' })}>
      <slot name="title" />
    </h2>
    <button type="button" on:click={() => (open = false)}>
      <Icon icon={XIcon} size={20} />
    </button>
  </div>

  <div class={css({ paddingX: '32px', paddingY: '24px' })}>
    <slot />
  </div>
</Modal>
