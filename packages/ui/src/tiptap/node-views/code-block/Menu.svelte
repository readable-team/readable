<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { bundledLanguagesInfo } from 'shiki';
  import IconCheck from '~icons/lucide/check';
  import IconChevronDown from '~icons/lucide/chevron-down';
  import IconChevronUp from '~icons/lucide/chevron-up';
  import IconSearch from '~icons/lucide/search';
  import { createFloatingActions } from '../../../actions';
  import { Icon } from '../../../components';
  import type { NodeViewProps } from '../../lib';

  export let open = false;

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let query = '';

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom',
    offset: 6,
    onClickOutside: () => (open = false),
  });

  const languages = [
    ...bundledLanguagesInfo.map((language) => ({ id: language.id, name: language.name })),
    { id: 'text', name: 'Plain Text' },
  ].toSorted((a, b) => a.name.localeCompare(b.name));

  $: currentLanguage = languages.find((language) => language.id === node.attrs.language)?.name ?? '?';
</script>

<button
  class={css({
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '14px',
  })}
  type="button"
  on:click={() => (open = true)}
  use:anchor
>
  {currentLanguage}

  {#if open}
    <Icon icon={IconChevronUp} />
  {:else}
    <Icon icon={IconChevronDown} />
  {/if}
</button>

{#if open}
  <div
    class={css({
      position: 'relative',
      paddingBottom: '8px',
      backgroundColor: '[#292D3E]',
      maxHeight: '360px',
      overflowY: 'auto',
      scrollbar: 'hidden',
      zIndex: '50',
      boxShadow: '[2px 2px 8px 0 {colors.gray.900/15}]',
    })}
    use:floating
  >
    <div class={css({ position: 'sticky', top: '0', padding: '14px', backgroundColor: '[#292D3E]' })}>
      <label
        class={flex({
          align: 'center',
          gap: '4px',
          paddingY: '7px',
          paddingLeft: '8px',
          paddingRight: '10px',
          backgroundColor: 'gray.600',
        })}
      >
        <Icon style={css.raw({ color: 'gray.400' })} icon={IconSearch} />
        <input
          class={css({ fontSize: '13px', color: 'gray.100' })}
          placeholder="언어를 검색하세요"
          type="text"
          bind:value={query}
        />
      </label>
    </div>

    <ul>
      {#each languages.filter((language) => language.name
          .toLowerCase()
          .includes(query.toLowerCase())) as language (language.id)}
        <li>
          <button
            class={flex({
              align: 'center',
              justify: 'space-between',
              gap: '4px',
              paddingX: '14px',
              paddingY: '6px',
              fontSize: '13px',
              color: 'gray.100',
              width: 'full',
              backgroundColor: { _hover: 'gray.600', _focus: 'gray.600' },
            })}
            aria-pressed={node.attrs.language === language.id}
            tabIndex={0}
            type="button"
            on:click={() => {
              updateAttributes({ language: language.id });
              open = false;
            }}
          >
            {language.name}

            {#if node.attrs.language === language.id}
              <Icon style={css.raw({ 'color': 'brand.400', '& *': { strokeWidth: '[2]' } })} icon={IconCheck} />
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
