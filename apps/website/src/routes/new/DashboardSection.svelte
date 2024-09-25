<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import ChevronLeftIcon from '~icons/lucide/chevron-left';
  import ChevronRightIcon from '~icons/lucide/chevron-right';
  import Branding from '$assets/dashboard-section/branding.svg?component';
  import Collaboration from '$assets/dashboard-section/collaboration.svg?component';
  import ContentUpdate from '$assets/dashboard-section/content-update.svg?component';
  import EditingExperience from '$assets/dashboard-section/editing-experience.png';
  import ModifyUrl from '$assets/dashboard-section/modify-url.svg?component';

  let currentScroll = 0;
  let carouselEl: HTMLDivElement;

  const contents = [
    {
      title: '콘텐츠 최신화',
      description: '마우스 사용이 어려운 사용자도 쉽게 탐색할 수 있도록 직관적인 키보드 내비게이션을 제공',
      badge: 'COMING SOON',
      asset: ContentUpdate,
      assetStyle: css({
        marginTop: { base: '11px', lg: '40px' },
        marginLeft: { base: '38px', lg: '56px' },
        paddingTop: { base: '16px', lg: '28px' },
        paddingX: { base: '20px', lg: '24px' },
      }),
    },
    {
      title: '공동 협업',
      description:
        '실시간 공동 편집으로 문서를 즉시 수정하고, 실시간 발행 상태를 확인하며 사이트 진행 상황을 투명하게 관리할 수 있습니다',
      asset: Collaboration,
      assetStyle: css({
        marginLeft: { base: '38px', lg: '56px' },
        paddingY: { base: '54px', lg: '84px' },
        paddingLeft: { base: '13px', lg: '22px' },
        paddingRight: { base: '12px', lg: '21px' },
        lg: { marginTop: '17px' },
      }),
    },
    {
      title: '직관적인 편집 경험',
      description: '사용자가 복잡한 기술 지식 없이도 쉽고 효율적으로 콘텐츠를 생성하고 수정할 수 있습니다',
      asset: EditingExperience,
      assetStyle: css({
        marginTop: { base: '25px', lg: '53px' },
        marginLeft: { base: '43px', lg: '66px' },
        paddingTop: { base: '16px', lg: '28px' },
        paddingLeft: { base: '20px', lg: '24px' },
        width: { base: '192px', lg: '320px' },
      }),
    },
    {
      title: '브랜딩',
      description:
        '웹사이트의 테마 색상, 콜아웃, 카테고리 호버 등 브랜드 이미지에 완벽히 일치시킵니다.\n시각적 일관성으로 브랜드 가치를 높이세요',
      asset: Branding,
      assetStyle: css({
        marginLeft: { base: '38px', lg: '56px' },
        paddingTop: { base: '39px', lg: '55px' },
        paddingLeft: { base: '20px', lg: '33px' },
        paddingRight: { base: '19px', lg: '32px' },
        paddingBottom: { base: '28px', lg: '54px' },
        lg: { marginTop: '17px' },
      }),
    },
    {
      title: '커스텀 URL',
      description:
        '기존 URL을 그대로 사용할 수 있는 커스텀 도메인 설정을 제공합니다. 브랜드 연속성을 유지하며 새로운 시스템으로 쉽게 전환하세요',
      asset: ModifyUrl,
      assetStyle: css({
        marginTop: { base: '11px', lg: '21px' },
        marginLeft: { base: '38px', lg: '56px' },
        paddingTop: { base: '16px', lg: '28px' },
        paddingLeft: { base: '20px', lg: '24px' },
      }),
    },
  ];

  function scrollNext() {
    const containerWidth = carouselEl.clientWidth;
    const newScroll = currentScroll + containerWidth;
    carouselEl.scrollTo({ left: newScroll, behavior: 'smooth' });
  }

  function scrollPrev() {
    const containerWidth = carouselEl.clientWidth;
    const newScroll = currentScroll - containerWidth;
    carouselEl.scrollTo({ left: newScroll, behavior: 'smooth' });
  }
</script>

<div
  class={css({ paddingY: '54px', backgroundColor: 'neutral.100', lg: { paddingTop: '120px', paddingBottom: '80px' } })}
>
  <div class={css({ marginX: 'auto', maxWidth: '1280px' })}>
    <h2
      class={css({
        fontSize: { base: '18px', lg: '[45px]' },
        fontWeight: '[800]',
        color: 'white',
        textAlign: 'center',
      })}
    >
      원활한 협업과 스마트한 문서 관리
    </h2>
    <p
      class={css({
        marginTop: { base: '10px', lg: '16px' },
        textStyle: { base: '13m', lg: '22m' },
        color: 'white',
        textAlign: 'center',
        opacity: '80',
      })}
    >
      빨리 움직이는 팀을 위한 가이드 문서 도구,
      <br />
      실시간 협업과 간편한 설정으로 문서를 만들어보세요
    </p>

    <div class={css({ marginTop: { base: '40px', lg: '80px' }, overflow: 'hidden' })}>
      <div
        bind:this={carouselEl}
        class={flex({
          align: 'center',
          gap: { base: '16px', lg: '20px' },
          paddingX: { base: '20px', lg: '23px' },
          overflow: 'auto',
          scrollbar: 'hidden',
          scrollSnapType: 'x',
          scrollSnapStrictness: 'mandatory',
        })}
        on:scroll={(e) => {
          currentScroll = e.currentTarget.scrollLeft;
        }}
      >
        {#each contents as { title, badge, description, asset, assetStyle } (title)}
          <div
            class={css({
              flexShrink: '0',
              borderWidth: '1px',
              borderColor: 'border.primary',
              borderRadius: '[20px]',
              paddingTop: { base: '22px', lg: '34px' },
              width: { base: '230px', lg: '376px' },
              height: { base: '284px', lg: '442px' },
              backgroundColor: 'surface.primary',
              scrollSnapAlign: 'center',
              overflow: 'hidden',
            })}
          >
            <div class={css({ paddingX: { base: '20px', lg: '32px' } })}>
              <p
                class={flex({
                  align: 'center',
                  gap: { base: '6px', lg: '8px' },
                  textStyle: { base: '14b', lg: '22b' },
                })}
              >
                {title}
                {#if badge}
                  <span
                    class={css({
                      borderRadius: 'full',
                      paddingX: { base: '7px', lg: '8px' },
                      paddingY: { base: '3px', lg: '4px' },
                      fontSize: { base: '10px', lg: '14px' },
                      fontWeight: 'bold',
                      color: 'neutral.0',
                      backgroundColor: 'neutral.50',
                    })}
                  >
                    {badge}
                  </span>
                {/if}
              </p>
              <p class={css({ marginTop: '10px', textStyle: { base: '12m', lg: '16m' }, color: 'text.tertiary' })}>
                {description}
              </p>
            </div>

            <div class={assetStyle}>
              {#if typeof asset === 'string'}
                <img alt={title} src={asset} />
              {:else}
                <Icon style={css.raw({ size: 'full' })} icon={asset} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div
      class={flex({
        align: 'center',
        justify: 'flex-end',
        gap: '14px',
        marginTop: { base: '30px', lg: '36px' },
        marginRight: '20px',
        hideBelow: 'lg',
      })}
    >
      <button
        class={css({
          borderRadius: 'full',
          paddingY: '8px',
          paddingLeft: '7px',
          paddingRight: '9px',
          color: 'neutral.80',
          backgroundColor: 'neutral.50',
          _disabled: { color: 'neutral.50', backgroundColor: 'neutral.80' },
        })}
        disabled={currentScroll <= 0}
        type="button"
        on:click={scrollPrev}
      >
        <Icon icon={ChevronLeftIcon} size={24} />
      </button>
      <button
        class={css({
          borderRadius: 'full',
          paddingY: '8px',
          paddingLeft: '9px',
          paddingRight: '7px',
          color: 'neutral.80',
          backgroundColor: 'neutral.50',
          _disabled: { color: 'neutral.50', backgroundColor: 'neutral.80' },
        })}
        disabled={carouselEl && currentScroll >= carouselEl.scrollWidth - carouselEl.clientWidth}
        type="button"
        on:click={scrollNext}
      >
        <Icon icon={ChevronRightIcon} size={24} />
      </button>
    </div>
  </div>
</div>
