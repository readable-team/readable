<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { TiptapEditor } from '@readable/ui/tiptap';
</script>

<div class={css({ margin: '100px', borderWidth: '4px', padding: '20px' })}>
  <TiptapEditor style={css.raw({ height: '[2000px]' })} />
</div>
