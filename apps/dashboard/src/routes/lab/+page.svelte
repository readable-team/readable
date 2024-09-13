<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Button, Icon, TextInput } from '@readable/ui/components';
  import PlusIcon from '~icons/lucide/plus';
  import Trash2Icon from '~icons/lucide/trash-2';
  import { goto } from '$app/navigation';
  import { graphql } from '$graphql';
  import { Img } from '$lib/components';
  import { invokeAlert } from '$lib/components/invoke-alert';

  let newSiteName = '';

  $: query = graphql(`
    query LabPage_Query {
      me {
        id
        teams {
          id
          name
          avatar {
            id
            ...Img_image
          }
          sites {
            id
            name
            logo {
              id
              ...Img_image
            }
          }
        }
      }
    }
  `);

  const deleteSite = graphql(`
    mutation LabPage_DeleteSite($input: DeleteSiteInput!) {
      deleteSite(input: $input) {
        id
      }
    }
  `);

  const createSite = graphql(`
    mutation LabPage_CreateSite($input: CreateSiteInput!) {
      createSite(input: $input) {
        id
      }
    }
  `);

  function handleDeleteSite(siteId: string, siteName: string) {
    invokeAlert({
      title: `"${siteName}" 사이트를 삭제하시겠어요?`,
      content: '사이트를 삭제하면 복구할 수 없습니다.',
      actionText: '삭제',
      variant: 'danger',
      action: async () => {
        await deleteSite({ siteId });
        // 페이지를 새로고침하여 변경사항을 반영합니다.
        location.reload();
      },
    });
  }

  async function handleCreateSite(teamId: string) {
    if (newSiteName.trim() === '') {
      alert('사이트 이름을 입력해주세요.');
      return;
    }

    try {
      const result = await createSite({
        teamId,
        name: newSiteName,
      });
      newSiteName = ''; // 입력 필드 초기화
      await goto(`/${result.id}`); // 새로 생성된 사이트로 이동
    } catch (err) {
      console.error('사이트 생성 중 오류 발생:', err);
      alert('사이트 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }
</script>

<div class={css({ maxWidth: '600px', padding: '20px' })}>
  <h1 class={css({ textStyle: '28eb', marginBottom: '20px' })}>실험실</h1>

  <ul class={css({ listStyle: 'none', padding: '0' })}>
    {#if $query.me}
      {#each $query.me.teams as team (team.id)}
        <div class={css({ borderWidth: '1px', borderColor: 'border.primary', borderRadius: '8px', padding: '16px' })}>
          <li
            class={flex({
              gap: '12px',
              marginBottom: '12px',
            })}
          >
            <Img
              style={css.raw({
                borderWidth: '1px',
                borderColor: 'border.image',
                borderRadius: 'full',
                size: '32px',
              })}
              $image={team.avatar}
              alt={`${team.name}의 아바타`}
              size={32}
            />
            <span class={css({ textStyle: '16m' })}>{team.name}</span>
          </li>
          <h3 class={css({ textStyle: '18b', marginBottom: '16px', marginTop: '32px' })}>사이트</h3>
          <ul class={css({ listStyle: 'none', padding: '0' })}>
            {#each team.sites as site (site.id)}
              <li
                class={flex({
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                })}
              >
                <a
                  class={flex({
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    _hover: { textDecoration: 'underline' },
                  })}
                  href={`/${site.id}`}
                >
                  {#if site.logo}
                    <Img
                      style={css.raw({
                        borderWidth: '1px',
                        borderColor: 'border.image',
                        borderRadius: '4px',
                        size: '32px',
                      })}
                      $image={site.logo}
                      alt={`${site.name}의 로고`}
                      size={32}
                    />
                  {/if}
                  <span class={css({ textStyle: '16m' })}>{site.name}</span>
                  <span class={css({ textStyle: '14r', color: 'text.tertiary' })}>({team.name})</span>
                </a>
                <button
                  class={css({
                    padding: '4px',
                    borderRadius: '4px',
                    color: 'text.danger',
                    _hover: { backgroundColor: 'danger.10' },
                  })}
                  type="button"
                  on:click={() => handleDeleteSite(site.id, site.name)}
                >
                  <Icon icon={Trash2Icon} size={16} />
                </button>
              </li>
            {/each}
          </ul>
          <div class={flex({ alignItems: 'center', gap: '12px', marginBottom: '20px' })}>
            <TextInput
              style={css.raw({ flex: '1' })}
              placeholder={`${team.name}에 사이트 추가`}
              size="sm"
              bind:value={newSiteName}
            />
            <Button size="sm" on:click={() => handleCreateSite(team.id)}>
              <Icon icon={PlusIcon} size={16} />
              <span>사이트 생성</span>
            </Button>
          </div>
        </div>
      {/each}
    {/if}
  </ul>
</div>
