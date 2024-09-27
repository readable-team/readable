<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import Lighthouse from './Lighthouse.svelte';
  import SectionTitle from './SectionTitle.svelte';

  const cards = [
    {
      icon: CodeXmlIcon,
      title: 'SSR',
      description: '검색엔진이 읽을 수 있도록 서버에서 HTML을 렌더링합니다',
    },
    {
      icon: CodeXmlIcon,
      title: '사이트맵',
      description: '검색엔진이 페이지를 쉽게 발견할 수 있도록 사이트맵을 자동 생성합니다',
    },
    {
      icon: CodeXmlIcon,
      title: 'OpenGraph',
      description: '메신저와 소셜 미디어 링크 미리보기를 위한 OpenGraph 메타데이터를 자동 지원합니다',
    },
    {
      icon: CodeXmlIcon,
      title: '웹 접근성 최적화',
      description: '시맨틱한 마크업과 표준적인 설계 덕분에 검색 엔진에 최적화되어 있습니다',
    },
  ];
</script>

<div class={css({ background: '[linear-gradient(180deg, #FFF 54.93%, #FBFFFA 100%)]' })}>
  <div
    class={css({
      width: '1280px',
      marginX: 'auto',
      paddingX: '20px',
      paddingY: '120px',
      lgDown: {
        width: 'full',
        paddingY: '54px',
      },
    })}
  >
    <SectionTitle>
      <span slot="subtitle" class={css({ color: '[#13AC60]' })}>SEO</span>
      <span slot="title">
        누구나
        <br />
        찾아올 수 있는
      </span>
      <span slot="description">
        <span>별도의 설정 없이도&nbsp;</span>
        <em>접근성이 고려된 설계</em>
        <span>
          와 잘 만들어져 있는
          <br class={css({ hideBelow: 'md' })} />
          메타데이터 덕분에 검색 엔진에 잘 인덱싱될 수 있습니다
        </span>
        <div
          class={css({
            marginTop: '13px',
            fontSize: { base: '13px', lg: '14px' },
            fontWeight: '[500]',
            color: 'text.tertiary',
          })}
        >
          *라이트하우스 스코어
        </div>
      </span>
    </SectionTitle>

    <div
      class={flex({
        marginTop: '80px',
        marginX: 'auto',
        width: 'full',
        maxWidth: '984px',
        align: 'flex-start',
        justifyContent: 'space-between',
        lgDown: {
          marginTop: '54px',
          gap: '16px',
        },
      })}
    >
      <Lighthouse title="Performance" />
      <Lighthouse title="Accessibility" />
      <Lighthouse title="Best Practices" />
      <Lighthouse title="SEO" />
    </div>

    <div
      class={grid({
        columns: { base: 1, md: 2, lg: 4 },
        marginTop: '80px',
        justifyContent: 'space-between',
        lgDown: {
          marginTop: '54px',
          gap: '16px',
        },
      })}
    >
      {#each cards as card (card.title)}
        <div
          class={flex({
            width: '300px',
            flexDirection: 'column',
            gap: '6px',
            padding: '24px',
            borderRadius: '10px',
            backgroundColor: 'surface.primary',
            boxShadow: 'emphasize',
            lgDown: {
              width: 'full',
              height: '91px', // TODO: 높이 다시 맞추기
              padding: '16px',
            },
          })}
        >
          <div
            class={flex({
              alignItems: 'center',
              gap: '8px',
              lgDown: {
                gap: '6px',
              },
            })}
          >
            <Icon style={css.raw({ color: '[#13AC60]', hideFrom: 'lg' })} icon={card.icon} size={20} />
            <Icon style={css.raw({ color: '[#13AC60]', hideBelow: 'lg' })} icon={card.icon} size={24} />

            <div
              class={css({
                fontSize: '22px',
                fontWeight: '[700]',
                lgDown: {
                  fontSize: '15px',
                },
              })}
            >
              {card.title}
            </div>
          </div>

          <div
            class={css({
              fontSize: '16px',
              fontWeight: '[500]',
              color: 'text.tertiary',
              lgDown: {
                fontSize: '13px',
              },
            })}
          >
            {card.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
