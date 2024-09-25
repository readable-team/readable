<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import FlaskConicalIcon from '~icons/lucide/flask-conical';
  import FlowerIcon from '~icons/lucide/flower';

  const cards = [
    {
      icon: FlaskConicalIcon,
      title: 'SEO 최적화',
      description: 'SEO 최적화',
    },
    {
      icon: FlowerIcon,
      title: '반응형 디자인 구현',
      description: '반응형 디자인 구현',
    },
    {
      icon: FlaskConicalIcon,
      title: '메타 태그',
      description: '메타 태그',
    },
    {
      icon: FlowerIcon,
      title: '페이지 로딩 속도',
      description: '페이지 로딩 속도',
    },
    {
      icon: FlaskConicalIcon,
      title: '문서 분석 및 인사이트',
      description: '문서 분석 및 인사이트',
    },
    {
      icon: FlowerIcon,
      title: '문서 레이아웃 최적화',
      description: '문서 레이아웃 최적화',
    },
    {
      icon: FlaskConicalIcon,
      title: '콘텐츠 가독성 개선',
      description: '콘텐츠 가독성 개선',
    },
    {
      icon: FlowerIcon,
      title: '접근성',
      description: '접근성',
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
  })}
>
  <h1
    class={css({
      fontSize: '[45px]',
      fontWeight: '[800]',
      lineHeight: '[138%]',
      letterSpacing: '-0.9px',
      textAlign: 'center',
    })}
  >
    리더블에서는 콘텐츠 작성에만 집중하세요 <br />
    나머지 모든 것은 자동으로 최적화됩니다
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
    })}
  >
    리더블은 도움센터 구축의 복잡성을 제거했습니다. <br />
    더 이상 기술적인 세부사항에 시간을 낭비하지 마세요.
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
    <div class={cx(css({ display: 'flex', gap: '16px' }), 'scrollLeft')}>
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
          })}
        >
          <Icon icon={card.icon} size={24} />
          <p
            class={css({
              marginTop: '10px',
              fontSize: '[18px]',
              fontWeight: '[700]',
              color: 'text.primary',
            })}
          >
            {card.title}
          </p>
          <p
            class={css({
              marginTop: '4px',
              fontSize: '[14px]',
              fontWeight: '[500]',
            })}
          >
            {card.description}
          </p>
        </div>
      {/each}
    </div>

    <!-- 아랫줄 카드 (오른쪽으로 이동) -->
    <div class={cx(css({ display: 'flex', gap: '16px' }), 'scrollRight')}>
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
          })}
        >
          <Icon icon={card.icon} size={24} />
          <p
            class={css({
              marginTop: '10px',
              fontSize: '[18px]',
              fontWeight: '[700]',
              color: 'text.primary',
            })}
          >
            {card.title}
          </p>
          <p
            class={css({
              marginTop: '4px',
              fontSize: '[14px]',
              fontWeight: '[500]',
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
