<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import { getFormContext } from '@readable/ui/forms';
  import UploadIcon from '~icons/lucide/upload';
  import Img from '$lib/components/Img.svelte';
  import type { Img_image } from '$graphql';

  export let avatar: Img_image;
  export let name: string;

  const { data } = getFormContext().form ?? {};

  // NOTE: file input에 바인딩해서 쓰면 form reset 시에도 파일이 유지되는 문제가 있어서 form data를 참조해서 사용
  $: file = $data?.[name] as File | undefined;
</script>

<label
  class={cx(
    flex({
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      size: '64px',
      borderWidth: '1px',
      borderColor: 'border.image',
      borderRadius: 'full',
      cursor: 'pointer',
      overflow: 'hidden',
    }),
    'group',
  )}
>
  {#if file}
    <img alt="아바타" src={URL.createObjectURL(file)} />
  {:else}
    <Img style={css.raw({ size: 'full' })} $image={avatar} alt="아바타" size={64} />
  {/if}
  <div
    class={css({
      display: 'none',
      _groupHover: {
        position: 'absolute',
        display: 'flex',
        size: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'neutral.100/16',
        color: 'neutral.0',
        borderRadius: 'full',
        transition: '[opacity 0.2s]',
      },
      _groupActive: {
        backgroundColor: 'neutral.100/24',
      },
    })}
  >
    <Icon icon={UploadIcon} size={28} />
  </div>
  <input {name} accept="image/*" hidden type="file" />
</label>
