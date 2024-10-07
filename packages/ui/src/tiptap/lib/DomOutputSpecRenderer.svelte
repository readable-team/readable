<script lang="ts">
  import { document } from 'zeed-dom';
  import type { DOMOutputSpec } from '@tiptap/pm/model';
  import type { VElement } from 'zeed-dom';

  export let domOutputSpec: DOMOutputSpec | undefined;

  let element: VElement;

  function createElementFromSpec(spec: DOMOutputSpec): VElement {
    const [tag, attrs, ...children] = spec as [string, Record<string, string>, ...DOMOutputSpec[]];
    const el = document.createElement(tag as string);

    if (attrs && typeof attrs === 'object') {
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value as string);
      }
    }

    for (const child of children) {
      if (typeof child === 'string') {
        el.append(document.createTextNode(child));
      } else {
        el.append(createElementFromSpec(child as DOMOutputSpec));
      }
    }

    return el;
  }

  $: if (domOutputSpec) {
    element = createElementFromSpec(domOutputSpec);
  }

  let tag: keyof HTMLElementTagNameMap | undefined;
  $: if (element) {
    tag = element.tagName.toLowerCase() as keyof HTMLElementTagNameMap;
  }
</script>

{#if element}
  <svelte:element this={tag} {...element.attributes} {...$$restProps}>
    {@html element.innerHTML}
  </svelte:element>
{/if}
