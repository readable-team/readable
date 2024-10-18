<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, FormProvider, Icon, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import diff from 'fast-diff';
  import { getContext } from 'svelte';
  import { z } from 'zod';
  import FileTextIcon from '~icons/lucide/file-text';
  import InfoIcon from '~icons/lucide/info';
  import { graphql } from '$graphql';
  import { TitledModal } from '$lib/components';

  export let open: boolean;

  const site = getContext<{
    id: string;
  }>('site');

  let lastQuery: string | null = null;
  let loading = false;
  let outdateds: Awaited<ReturnType<typeof findOutdatedContent.refetch>>['findOutdatedContent'] = [];

  $: if (open) {
    lastQuery = null;
    loading = false;
    outdateds = [];
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
  const { form, context } = createMutationForm({
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

<TitledModal bind:open>
  <svelte:fragment slot="title">콘텐츠 최신화</svelte:fragment>

  {#if lastQuery === null}
    <FormProvider {context} {form}>
      <input name="siteId" hidden value={site.id} />
      <FormField name="query">
        <TextInput name="query" placeholder="변경된 사항을 입력해주세요" />
      </FormField>

      <Button style={css.raw({ width: 'full' })} type="submit">낡은 문서 찾기</Button>
    </FormProvider>
  {:else if loading}
    <div>...</div>
  {:else if outdateds.length > 0}
    <div class={flex({ flexDirection: 'column', gap: '16px', maxHeight: '[60vh]' })}>
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
              marginLeft: '4px',
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
                    borderRadius: '6px',
                    paddingY: '6px',
                    paddingX: '8px',
                    color: 'text.primary',
                    '& > del': {
                      backgroundColor: '[#FF818266]',
                      textDecorationColor: '[rgba(200, 100, 100, 0.4)]',
                    },
                    '& > ins': {
                      backgroundColor: '[#ABFEBC]',
                      textDecoration: 'none',
                    },
                  })}
                >
                  {@html diff(fix.original, fix.suggestion)
                    .map(([type, text]) => {
                      if (type === 0) return text;
                      if (type === -1) return `<del>${text}</del>`;
                      if (type === 1) return `<ins>${text}</ins>`;
                    })
                    .join('')}
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
    <div>최신화할 콘텐츠가 없습니다</div>
  {/if}
</TitledModal>
