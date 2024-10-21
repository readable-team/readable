<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { Button, FormField, FormProvider, Icon } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import diff from 'fast-diff';
  import { getContext } from 'svelte';
  import { z } from 'zod';
  import FileTextIcon from '~icons/lucide/file-text';
  import InfoIcon from '~icons/lucide/info';
  import { graphql } from '$graphql';
  import { TitledModal } from '$lib/components';
  import AiIcon from './@ai/AiIcon.svelte';
  import AiLoading from './@ai/AiLoading.svelte';

  export let open: boolean;

  const site = getContext<{
    id: string;
  }>('site');

  let lastQuery: string | null = null;
  let loading = false;
  let outdateds: Awaited<ReturnType<typeof findOutdatedContent.refetch>>['findOutdatedContent'] = [];

  function reset() {
    lastQuery = null;
    loading = false;
    outdateds = [];
  }

  $: if (open) {
    reset();
  }

  const findOutdatedContent = graphql(`
    query FindOutdatedsModal_Query($query: String!, $siteId: String!) @manual {
      findOutdatedContent(query: $query, siteId: $siteId) {
        fixes {
          nodeId
          original
          reason
          relevance
          suggestion
        }
        page {
          id
          title
        }
      }
    }
  `);

  // FIXME: query를 위해 mutation form을..?
  const { form, context, data } = createMutationForm({
    schema: z.object({
      query: z.string(),
      siteId: z.string(),
    }),
    mutation: async ({ query, siteId }) => {
      loading = true;
      lastQuery = query;
      const result = await findOutdatedContent.refetch({ query, siteId });
      outdateds = result?.findOutdatedContent ?? [];
      loading = false;
    },
  });
</script>

<TitledModal style={css.raw({ width: '700px' })} bind:open>
  <svelte:fragment slot="title">콘텐츠 최신화</svelte:fragment>

  {#if lastQuery === null}
    <FormProvider {context} {form}>
      <input name="siteId" hidden value={site.id} />
      <FormField name="query" noMessage>
        <label
          class={flex({
            align: 'center',
            borderWidth: '1px',
            borderColor: { base: 'gray.300', _dark: 'darkgray.700' },
            borderRadius: '10px',
            paddingX: '16px',
            paddingY: '10px',
            textStyle: '16r',
            color: 'gray.1000',
            backgroundColor: 'white',
            transition: 'common',
            _hover: {
              borderColor: 'brand.400',
            },
            '&:has(textarea:focus)': {
              borderColor: 'brand.600',
            },
          })}
        >
          <textarea
            name="query"
            class={css({
              flexGrow: '1',
              width: 'full',
              minWidth: '0',
              resize: 'none',
            })}
            placeholder="콘텐츠에 반영해야 할 변경 사항을 자유롭게 입력해주세요"
            rows="4"
          />
        </label>
      </FormField>
      <Button
        style={css.raw({ width: 'full', marginTop: '18px' })}
        disabled={$data.query?.trim() === ''}
        glossy
        type="submit"
      >
        낡은 문서 찾기
      </Button>
    </FormProvider>
  {:else if loading}
    <div
      class={flex({
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        paddingX: '18px',
        paddingY: '24px',
        borderRadius: '8px',
        backgroundColor: 'neutral.10',
        borderWidth: '1px',
        borderColor: 'border.primary',
        color: 'text.secondary',
        textStyle: '16sb',
      })}
    >
      <AiIcon variant="gradient" />
      <p>낡은 문서를 찾는 중입니다. 잠시만 기다려주세요.</p>
      <AiLoading />
    </div>
  {:else if outdateds.length > 0}
    <div class={flex({ flexDirection: 'column', gap: '16px' })}>
      {#each outdateds as outdated (outdated.page.id)}
        <div>
          <div
            class={flex({
              alignItems: 'center',
              gap: '4px',
              textStyle: '16sb',
              color: 'text.secondary',
              marginBottom: '8px',
            })}
          >
            <Icon icon={FileTextIcon} size={16} />
            {outdated.page.title}
          </div>
          <div
            class={css({
              marginLeft: '2px',
              borderLeftWidth: '1px',
              borderColor: 'border.secondary',
              paddingLeft: '8px',
            })}
          >
            {#each outdated.fixes as fix, index (index)}
              <div
                class={css({
                  marginBottom: '8px',
                })}
              >
                <div
                  class={css({
                    marginBottom: '4px',
                    borderWidth: '1px',
                    borderColor: 'border.secondary',
                    backgroundColor: 'neutral.10',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    color: 'text.primary',
                  })}
                >
                  <div
                    class={css({
                      backgroundColor: '[#ffdbdb77]',
                      '& del': {
                        backgroundColor: '[#FF818266]',
                        textDecorationColor: '[rgba(200, 100, 100, 0.4)]',
                      },
                    })}
                  >
                    {@html diff(fix.original, fix.suggestion)
                      .map(([type, text]) => {
                        if (type === 0) return text;
                        if (type === -1) return `<del>${text}</del>`;
                      })
                      .join('')}
                  </div>
                  <div
                    class={css({
                      backgroundColor: '[#d4ffdd77]',
                      '& ins': {
                        backgroundColor: '[#ABFEBC]',
                        textDecoration: 'none',
                      },
                    })}
                  >
                    {@html diff(fix.original, fix.suggestion)
                      .map(([type, text]) => {
                        if (type === 0) return text;
                        if (type === 1) return `<ins>${text}</ins>`;
                      })
                      .join('')}
                  </div>
                </div>
                <div
                  class={flex({
                    alignItems: 'center',
                    gap: '4px',
                    marginX: '8px',
                    textStyle: '14r',
                    color: 'text.secondary',
                  })}
                >
                  <Icon style={css.raw({})} icon={InfoIcon} size={16} />
                  <span>{fix.reason}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div
      class={center({
        flexDirection: 'column',
        gap: '24px',
        paddingX: '18px',
        paddingY: '24px',
        borderRadius: '8px',
        backgroundColor: 'neutral.10',
        borderWidth: '1px',
        borderColor: 'border.primary',
        color: 'text.secondary',
        textStyle: '16sb',
      })}
    >
      <div class={flex({ alignItems: 'center', gap: '12px' })}>
        <AiIcon variant="gray" />
        <p>축하합니다! 최신화할 콘텐츠가 없습니다.</p>
      </div>

      <Button style={css.raw({ width: 'full' })} variant="secondary" on:click={reset}>다시 찾기</Button>
    </div>
  {/if}
</TitledModal>
