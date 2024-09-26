<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import FlaskConicalIcon from '~icons/lucide/flask-conical';
  import FlowerIcon from '~icons/lucide/flower';
  import SearchIcon from '~icons/lucide/search';

  const cards = [
    {
      icon: FlowerIcon,
      title: '반응형 디자인',
      description: '모든 디바이스에 최적화된 사용자 경험',
    },
    {
      icon: FlaskConicalIcon,
      title: 'SEO',
      description: '검색 엔진 최적화',
    },
    {
      icon: SearchIcon,
      title: '키워드 검색',
      description: '실시간 검색 엔진 인덱싱',
    },
    {
      icon: SearchIcon,
      title: 'AI 검색',
      description: 'RAG 기반 자연어 검색',
    },
    {
      icon: FlowerIcon,
      title: '버전 관리',
      description: '콘텐츠 변경 이력 추적',
    },
    {
      icon: FlaskConicalIcon,
      title: '동시 편집',
      description: '막힘 없는 실시간 협업',
    },
    {
      icon: FlaskConicalIcon,
      title: '접근성',
      description: '모두를 위한 포용적 디자인',
    },
    {
      icon: FlaskConicalIcon,
      title: '다국어',
      description: '글로벌 사용자용 다국어 지원',
    },
    {
      icon: FlaskConicalIcon,
      title: '접속자 통계 및 인사이트',
      description: '사용자 데이터 수집 및 행동 분석 ',
    },
    {
      icon: FlowerIcon,
      title: '콘텐츠 최신화',
      description: '지속적인 업데이트로 신뢰성 향상',
    },
  ];

  const topCards = cards.slice(0, Math.ceil(cards.length / 2));
  const bottomCards = cards.slice(Math.ceil(cards.length / 2));
</script>

<div
  class={flex({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingY: '120px',
    backgroundColor: 'neutral.20',
    lgDown: {
      paddingY: '54px',
    },
  })}
>
  <h1
    class={css({
      fontSize: '[45px]',
      fontWeight: '[800]',
      lineHeight: '[138%]',
      letterSpacing: '-0.9px',
      textAlign: 'center',
      lgDown: {
        fontSize: '18px',
      },
    })}
  >
    콘텐츠에만 집중하세요
    <br />
    나머지는 리더블이 해드려요
  </h1>
  <p
    class={css({
      marginTop: '16px',
      color: 'text.secondary',
      fontSize: '[22px]',
      fontWeight: '[500]',
      lineHeight: '[144%]',
      letterSpacing: '-0.088px',
      textAlign: 'center',
      lgDown: {
        marginTop: '10px',
        fontSize: '13px',
      },
    })}
  >
    리더블은 도움센터 구축의 복잡성을 제거했습니다.
    <br />
    더 이상 기술적인 세부사항에 시간을 소모하지 마세요
  </p>

  <div
    class={flex({
      position: 'relative',
      marginTop: '86px',
      width: 'full',
      maxWidth: '1280px',
      marginX: 'auto',
      flexDirection: 'column',
      gap: '16px',
      overflow: 'hidden',
      lgDown: {
        marginTop: '40px',
        gap: '10px',
      },
    })}
  >
    <div
      class={css({
        position: 'absolute',
        top: '0',
        left: '0',
        width: '80px',
        height: 'full',
        background: '[linear-gradient(270deg, rgba(244, 244, 245, 0.00) 0%, #F4F4F5 93.07%)]',
        zIndex: '10',
      })}
    />
    <div
      class={css({
        position: 'absolute',
        top: '0',
        right: '0',
        width: '80px',
        height: 'full',
        background: '[linear-gradient(90deg, rgba(244, 244, 245, 0.00) 0%, #F4F4F5 93.07%)]',
        zIndex: '10',
      })}
    />

    <!-- 윗줄 카드 (왼쪽으로 이동) -->
    <div
      class={cx(
        css({
          display: 'flex',
          gap: '16px',
          lgDown: {
            gap: '14px',
          },
        }),
        'scrollLeft',
      )}
    >
      {#each [...topCards, ...topCards] as card, index (index)}
        <div
          class={flex({
            flexShrink: 0,
            width: '296px',
            height: '138px',
            borderWidth: '1px',
            borderColor: 'border.primary',
            borderRadius: '8px',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px',
            backgroundColor: 'white',
            color: 'text.tertiary',
            lgDown: {
              width: '220px',
              height: '105px',
              padding: '16px',
            },
          })}
        >
          <Icon style={css.raw({ lgDown: { size: '16px' } })} icon={card.icon} size={24} />
          <p
            class={css({
              marginTop: '10px',
              fontSize: '[18px]',
              fontWeight: '[700]',
              color: 'text.primary',
              lgDown: {
                fontSize: '14px',
              },
            })}
          >
            {card.title}
          </p>
          <p
            class={css({
              marginTop: '4px',
              fontSize: '[14px]',
              fontWeight: '[500]',
              lgDown: {
                marginTop: '2px',
                fontSize: '12px',
              },
            })}
          >
            {card.description}
          </p>
        </div>
      {/each}
    </div>

    <!-- 아랫줄 카드 (오른쪽으로 이동) -->
    <div
      class={cx(
        css({
          display: 'flex',
          gap: '16px',
          lgDown: {
            gap: '14px',
          },
        }),
        'scrollRight',
      )}
    >
      {#each [...bottomCards, ...bottomCards] as card, index (index)}
        <div
          class={flex({
            flexShrink: 0,
            width: '296px',
            height: '138px',
            borderWidth: '1px',
            borderColor: 'border.primary',
            borderRadius: '8px',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px',
            backgroundColor: 'white',
            color: 'text.tertiary',
            lgDown: {
              width: '220px',
              height: '105px',
              padding: '16px',
            },
          })}
        >
          <Icon style={css.raw({ lgDown: { size: '16px' } })} icon={card.icon} size={24} />
          <p
            class={css({
              marginTop: '10px',
              fontSize: '[18px]',
              fontWeight: '[700]',
              color: 'text.primary',
              lgDown: {
                fontSize: '14px',
              },
            })}
          >
            {card.title}
          </p>
          <p
            class={css({
              marginTop: '4px',
              fontSize: '[14px]',
              fontWeight: '[500]',
              lgDown: {
                marginTop: '2px',
                fontSize: '12px',
              },
            })}
          >
            {card.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  @keyframes scrollLeft {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-1280px + 32px));
    }
  }

  @keyframes scrollRight {
    0% {
      transform: translateX(calc(-1280px + 32px));
    }
    100% {
      transform: translateX(0);
    }
  }

  .scrollLeft {
    animation: scrollLeft 40s linear infinite;
  }

  .scrollRight {
    animation: scrollRight 40s linear infinite;
  }
</style>
