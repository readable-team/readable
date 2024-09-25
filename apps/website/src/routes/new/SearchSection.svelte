<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import SearchDemo from './SearchDemo.svelte';
  import SectionTitle from './SectionTitle.svelte';

  const cards = [
    {
      icon: CodeXmlIcon,
      title: '효율적인 문서 검색',
      description: `사용자가 원하는 정보를 빠르고 효과적으로 찾을 수 있게 해줍니다.
키워드를 입력하면 관련된 문서, 페이지, 또는 데이터를 검색 결과로 제공합니다.`,
    },
    {
      icon: CodeXmlIcon,
      title: 'AI 피드백',
      description: `고객이 자주 물어보는 검색어를 기반으로 콘텐츠를 제안하여
사이트의 정보 격차를 해소하고 사용자 니즈를 충족합니다`,
      comingSoon: true,
    },
  ];
</script>

<div class={css({ background: '[linear-gradient(180deg, #FFF 54.06%, #FDFAFF 100%)]' })}>
  <div
    class={css({
      width: '1280px',
      marginX: 'auto',
      paddingX: '20px',
      paddingY: '120px',
    })}
  >
    <SectionTitle>
      <span slot="subtitle" class={css({ color: '[#9C3BE8]' })}>Search</span>
      <span slot="title">
        발견될 수 있는
        <br />
        도움센터
      </span>
      <span slot="description">
        <span>단순 키워드 검색만으로 고객의 질문을 이해하고&nbsp;</span>
        <em>맞춤형 답변을 제공하는 AI 검색</em>
        <br />
        <span>고객 데이터를 기반으로 개인화된 해결책을 제안하고 있습니다</span>
      </span>
    </SectionTitle>

    <div
      class={center({
        marginTop: '100px',
      })}
    >
      <SearchDemo />
    </div>

    <div class={flex({ marginTop: '100px', gap: '15px' })}>
      {#each cards as card (card.title)}
        <div
          class={flex({
            flexDirection: 'column',
            gap: '6px',
            flex: '1',
          })}
        >
          <div class={flex({ alignItems: 'center', gap: '8px' })}>
            <Icon style={css.raw({ color: '[#9C3BE8]' })} icon={card.icon} size={24} />
            <div class={css({ fontSize: '22px', fontWeight: '[700]' })}>{card.title}</div>
            {#if card.comingSoon}
              <div
                class={center({
                  borderRadius: 'full',
                  backgroundColor: '[#A861E1]',
                  color: 'neutral.0',
                  paddingX: '8px',
                  paddingY: '4px',
                  fontSize: '14px',
                  fontWeight: '[700]',
                  textTransform: 'uppercase',
                })}
              >
                Coming Soon
              </div>
            {/if}
          </div>

          <div class={css({ fontSize: '16px', fontWeight: '[500]', color: 'text.tertiary', whiteSpace: 'pre-line' })}>
            {card.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
