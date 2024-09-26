<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { center, flex } from '@readable/styled-system/patterns';
  import { HorizontalDivider, Icon } from '@readable/ui/components';
  import CircleXIcon from '~icons/lucide/circle-x';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import SearchIcon from '~icons/lucide/search';
  import SparklesIcon from '$assets/icons/sparkles.svg?component';
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
      lgDown: {
        width: 'full',
        paddingY: '54px',
      },
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
        lgDown: {
          marginTop: '54px',
        },
      })}
    >
      <div
        class={flex({
          flexDirection: 'column',
          position: 'relative',
          zIndex: '100',
          marginX: 'auto',
          borderRadius: { base: '16px', lg: '[22px]' },
          width: 'full',
          maxWidth: '867px',
          padding: '8px',
          backgroundColor: 'surface.primary',
          boxShadow: 'strong',
        })}
      >
        <div class={flex({ align: 'center', shrink: 0 })}>
          <div
            class={flex({
              alignItems: 'center',
              borderWidth: '2px',
              borderColor: '[#9C3BE8]',
              borderRadius: { base: '8px', lg: '14px' },
              paddingX: { base: '12px', lg: '18px' },
              textStyle: { base: '14m', lg: '16m' },
              backgroundColor: { base: 'white', _dark: 'darkgray.1000' },
              width: 'full',
              height: { base: '36px', lg: '49px' },
            })}
          >
            <span class={css({ padding: '2px', color: 'neutral.50' })}>
              <Icon style={css.raw({ hideFrom: 'lg' })} icon={SearchIcon} size={16} />
              <Icon style={css.raw({ hideBelow: 'lg' })} icon={SearchIcon} size={18} />
            </span>

            <p class={css({ marginLeft: '8px', width: 'full' })}>팀 이름을 변경하려면 어떻게 해야해?</p>

            <div class={css({ marginLeft: '14px', color: 'neutral.50' })}>
              <Icon style={css.raw({ hideFrom: 'lg' })} icon={CircleXIcon} size={16} />
              <Icon style={css.raw({ hideBelow: 'lg' })} icon={CircleXIcon} size={18} />
            </div>
          </div>
        </div>

        <div
          class={flex({
            gap: '12px',
            marginTop: '12px',
            paddingX: '18px',
            paddingY: '16px',
          })}
        >
          <Icon style={css.raw({ color: '[#9C3BE8]' })} icon={SparklesIcon} size={20} />

          <div>
            <p class={css({ textStyle: '14r' })}>
              팀 이름을 변경하려면 팀 대시보드의 팀 설정 탭으로 이동해야 합니다.
              <br />
              여기서 팀의 기본 정보를 변경할 수 있으며, 팀 로고와 함께 팀 이름도 수정할 수 있습니다. 이러한 변경 사항은 팀의
              모든 멤버에게 적용되지만,
              <br />
              팀 로고와 팀 이름은 사이트에 노출되지 않습니다.
            </p>

            <HorizontalDivider style={css.raw({ marginTop: '12px', marginBottom: '8px' })} />

            <div>
              <div class={flex({ gap: '6px', alignItems: 'center' })}>
                <div
                  class={center({
                    size: '17px',
                    backgroundColor: 'neutral.30',
                    color: 'text.tertiary',
                    textStyle: '12sb',
                    borderRadius: 'full',
                  })}
                >
                  1
                </div>
                <span
                  class={css({
                    textStyle: { base: '12r', lg: '13r' },
                    color: 'text.secondary',
                    textDecoration: 'underline',
                  })}
                >
                  팀과 사이트
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class={flex({
        marginTop: '100px',
        gap: '15px',
        lgDown: {
          marginTop: '74px',
          flexDirection: 'column',
          gap: '40px',
        },
      })}
    >
      {#each cards as card (card.title)}
        <div
          class={flex({
            flexDirection: 'column',
            gap: '6px',
            flex: '1',
          })}
        >
          <div class={flex({ alignItems: 'center', gap: '8px', lgDown: { gap: '6px' } })}>
            <Icon style={css.raw({ color: '[#9C3BE8]', lgDown: { size: '16px' } })} icon={card.icon} size={24} />
            <div class={css({ fontSize: '22px', fontWeight: '[700]', lgDown: { fontSize: '14px' } })}>{card.title}</div>
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
                  lgDown: {
                    paddingX: '7px',
                    paddingY: '3px',
                    fontSize: '10px',
                  },
                })}
              >
                Coming Soon
              </div>
            {/if}
          </div>

          <div
            class={css({
              fontSize: '16px',
              fontWeight: '[500]',
              color: 'text.tertiary',
              whiteSpace: 'pre-line',
              lgDown: {
                fontSize: '12px',
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
