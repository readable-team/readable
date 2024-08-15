<script lang="ts">
  import { css, cx } from '@readable/styled-system/css';
  import { center, flex, grid, gridItem } from '@readable/styled-system/patterns';
  import { Helmet, Icon } from '@readable/ui/components';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import CheckIcon from '~icons/lucide/check';
  import XIcon from '~icons/lucide/x';
  import BrowserHero from '$assets/hero/browser.svg?component';
  import TableCheckIcon from '$assets/icons/table-check.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import GlyphLogo from '$assets/logos/glyph.svg?component';
  import PlanetLogo from '$assets/logos/planet.svg?component';
  import ZerobasedLogo from '$assets/logos/zerobased.svg?component';
  import type { ComponentType } from 'svelte';

  const keywords = ['도움센터', '유저 가이드', '업데이트 노트', '개발자 문서'];

  let i = 0;
  $: idx = i % keywords.length;

  const labelStyle = css({ fontSize: '12px', fontWeight: 'bold' });

  const inputStyle = css({
    borderWidth: '1px',
    borderColor: 'neutral.30',
    borderRadius: '4px',
    paddingX: '12px',
    paddingY: '11px',
    fontSize: '14px',
    backgroundColor: 'neutral.0',
  });

  const tableContents: Record<string, ComponentType | string>[] = [
    {
      title: '콘텐츠 최신화',
      readable: TableCheckIcon,
      zendesk: XIcon,
      notion: XIcon,
    },
    {
      title: '쉬운 브랜딩',
      readable: TableCheckIcon,
      zendesk: '복잡함 / 유료 (1인당 월 $149)',
      notion: XIcon,
    },
    {
      title: '검색',
      readable: TableCheckIcon,
      zendesk: CheckIcon,
      notion: CheckIcon,
    },
    {
      title: '커스텀 도메인',
      readable: TableCheckIcon,
      zendesk: CheckIcon,
      notion: '유료 (월 $10)',
    },
    {
      title: '24/7 지원',
      readable: TableCheckIcon,
      zendesk: '애드온',
      notion: XIcon,
    },
    {
      title: '다국어',
      readable: '준비 중',
      zendesk: '유료 (1인당 월 $149)',
      notion: XIcon,
    },
    {
      title: '동시 편집',
      readable: TableCheckIcon,
      zendesk: XIcon,
      notion: CheckIcon,
    },
    {
      title: '위지윅 에디터',
      readable: TableCheckIcon,
      zendesk: CheckIcon,
      notion: CheckIcon,
    },
    {
      title: '마크다운 에디터',
      readable: '준비 중',
      zendesk: XIcon,
      notion: XIcon,
    },
    {
      title: '데이터 셀프 호스팅',
      readable: 'Git 연동 준비 중',
      zendesk: XIcon,
      notion: XIcon,
    },
    {
      title: 'SEO',
      readable: TableCheckIcon,
      zendesk: CheckIcon,
      notion: CheckIcon,
    },
    {
      title: '스테이징 영역',
      readable: TableCheckIcon,
      zendesk: CheckIcon,
      notion: XIcon,
    },
    {
      title: '가격',
      readable: '무료',
      zendesk: '유료 (1인당 월 $69)',
      notion: '유료 (1인당 월 $12)',
    },
  ];

  onMount(() => {
    const interval = setInterval(() => {
      i += 1;
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<Helmet
  description="빨리 움직이는 팀을 위한 가이드 문서 도구. 낡지 않는 도움센터를 지금 생성해 보세요."
  title="이용자들이 사랑할 도움센터, 리더블"
  trailing={null}
/>

<div
  class={css({
    paddingTop: '80px',
    background:
      '[linear-gradient(110deg, rgba(251, 96, 189, 0.00) -5.83%, rgba(251, 96, 189, 0.10) -0.54%, rgba(251, 96, 189, 0.03) 31.21%, rgba(251, 96, 189, 0.00) 47.09%, rgba(249, 106, 25, 0.02) 61.91%, rgba(249, 106, 25, 0.10) 83.08%)]',
    overflow: 'hidden',
  })}
>
  <div class={flex({ marginX: 'auto', maxWidth: '1200px', paddingX: '48px' })}>
    <div class={css({ flex: 'none' })}>
      <FullLogo class={css({ height: '24px', marginBottom: '100px' })} />

      <div class={css({ fontSize: '[60px]', fontWeight: '[900]', marginBottom: '64px' })}>
        <div>이용자들이 사랑할</div>
        <div class={css({ position: 'relative' })}>
          &nbsp;
          {#key i}
            <div class={flex({ position: 'absolute', inset: '0' })}>
              <div
                class={flex({
                  textGradient: 'to-r',
                  gradientFrom: '[#F96A19]',
                  gradientTo: '[#FB60BD]',
                })}
                in:fly={{ y: 50, opacity: 0 }}
                out:fly={{ y: -20, opacity: 0 }}
              >
                {keywords[idx]}
              </div>
            </div>
          {/key}
        </div>
        <div>만들기</div>
      </div>

      <a
        class={css({
          display: 'inline-block',
          borderRadius: 'full',
          paddingX: '46px',
          paddingY: '12px',
          fontSize: '18px',
          fontWeight: '[900]',
          color: 'white',
          backgroundColor: 'neutral.100',
        })}
        href="#contact"
      >
        지금 신청하기
      </a>
    </div>

    <div class={css({ flexGrow: '1', minWidth: '160px' })} />

    <div class={css({ marginRight: '-48px', paddingTop: '100px' })}>
      <BrowserHero class={css({ height: '450px' })} />
    </div>
  </div>

  <div
    class={css({ height: '114px', backgroundGradient: 'to-b', gradientFrom: 'transparent', gradientTo: 'white' })}
  ></div>
</div>

<div
  class={center({ flexDirection: 'column', marginTop: '80px', marginX: 'auto', paddingX: '80px', maxWidth: '1200px' })}
>
  <div class={css({ textStyle: '16sb', color: 'neutral.50', marginBottom: '24px', lineHeight: '[1.6]' })}>
    다양한 규모의 팀이 리더블과 함께하고 있습니다
  </div>

  <div class={flex({ width: 'full', justify: 'space-between', align: 'center', color: 'neutral.50' })}>
    <GlyphLogo class={css({ height: '24px' })} />
    <ZerobasedLogo class={css({ height: '24px' })} />
    <PlanetLogo class={css({ height: '24px' })} />
    <a
      class={css({
        display: 'inline-block',
        borderWidth: '1px',
        borderColor: 'neutral.50',
        borderStyle: 'dashed',
        borderRadius: 'full',
        paddingX: '24px',
        paddingY: '14px',
        backgroundColor: '[#F4F4F5]',
      })}
      href="#contact"
    >
      그 다음은?
    </a>
  </div>
</div>

<div
  class={center({ flexDirection: 'column', marginX: 'auto', marginTop: '160px', paddingX: '48px', maxWidth: '1200px' })}
>
  <section class={grid({ columns: 2, gap: '40px' })}>
    <div
      class={css({
        borderRadius: '16px',
        padding: '40px',
        background:
          '[linear-gradient(160deg, rgba(236, 219, 249, 0.60) 0%, rgba(181, 209, 253, 0.60) 70.43%, rgba(183, 189, 255, 0.60) 100%)]',
        height: '860px',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
        <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#3730A3]' })}>
          쉴 새 없이 변화하는 제품에
          <br />
          정적인 가이드 문서를 맞추는 것, 어렵습니다.
        </h3>

        <p class={css({ fontSize: '24px', fontWeight: '[800]', flexGrow: '1', marginTop: '8px', color: '[#818CF8]' })}>
          정확한 유저 가이드 문서는 성공적인 고객 경험에 필수적인 요소입니다.
          <br />
          부정확한 문서는 제품과 기업에 대한 신뢰를 저해하는 요인이지만, 문서가 낡지 않게 관리하는 것은 번거롭고 어려운 일입니다.
        </p>

        <img class={css({ size: '120px' })} alt="무한대" src="/images/infinity.png" />
      </div>
    </div>

    <div class={flex({ direction: 'column' })}>
      <div class={flex({ flexDirection: 'column', justifyContent: 'center', flexGrow: '1' })}>
        <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
          <div class={flex({ align: 'center' })}>
            <span
              class={css({
                textGradient: 'to-l',
                gradientFrom: '[#F96A19]',
                gradientTo: '[#FB60BD]',
              })}
            >
              빠른 팀
            </span>
            <span>을 위한</span>
          </div>
          <div>가이드 문서 도구</div>
        </h2>

        <p
          class={css({
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'neutral.70',
            marginTop: '24px',
            lineHeight: '[1.6]',
          })}
        >
          제품과 문서를 손쉽게 동기화하는 확실한 방법,
          <br />
          리더블이 낡은 문서 고민을 끝내 드려요.
        </p>
      </div>

      <div
        class={css({
          borderRadius: '16px',
          padding: '40px',
          background:
            '[linear-gradient(127deg, rgba(236, 254, 187, 0.60) 0%, rgba(160, 218, 139, 0.54) 84.75%, rgba(169, 221, 137, 0.60) 100%)]',
          height: '465px',
        })}
      >
        <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
          <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#365314]' })}>
            낡고 부정확한 문서, 이제 안녕!
          </h3>
          <p
            class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#65A30D]', marginTop: '8px', flexGrow: '1' })}
          >
            리더블은 제품의 변화를 감지해 가이드 문서에서 변경이 필요한 부분을 찾아냅니다. 더 이상 문서가 제품의 뒤에
            있지 않게 하세요. 최신 상태로 유지되는 문서로 고객 신뢰를 높여 보세요.
          </p>

          <img class={css({ size: '120px' })} alt="흔드는 손" src="/images/waving-hand.png" />
        </div>
      </div>
    </div>
  </section>

  <div class={css({ width: 'full', marginBottom: '48px', marginTop: '160px' })}>
    <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
      <div class={flex({ align: 'center', gap: '10px' })}>
        <span>실제로</span>
        <span
          class={css({
            textGradient: 'to-l',
            gradientFrom: '[#F96A19]',
            gradientTo: '[#FB60BD]',
          })}
        >
          도움이 되는
        </span>
      </div>
      <div>도움센터</div>
    </h2>

    <p
      class={css({ fontSize: '24px', fontWeight: 'bold', color: 'neutral.70', marginTop: '24px', lineHeight: '[1.6]' })}
    >
      마음에 드는 쓸만한 도움센터가 없어 고민하시나요?
      <br />
      도움센터가 고객에게 실제로 도움이 되기 위해서 마땅히
      <br />
      갖춰야 할 덕목들, 빠짐없이 갖췄어요
    </p>
  </div>

  <section class={grid({ columns: 5, rowGap: '28px', columnGap: '28px' })}>
    <div
      class={gridItem({
        colSpan: 3,
        rowSpan: 1,
        borderRadius: '16px',
        padding: '60px',
        backgroundColor: '[#DBEAFE/50]',
        height: '480px',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
        <div
          class={center({
            gap: '4px',
            borderWidth: '[0.5px]',
            borderColor: '[#93C5FD]',
            borderRadius: 'full',
            marginBottom: '20px',
            paddingX: '16px',
            paddingY: '6px',
            width: 'fit',
            fontSize: '14px',
            fontWeight: '[800]',
            color: '[#1E40AF]',
            backgroundColor: 'neutral.0',
          })}
        >
          <Icon icon={CheckIcon} size={16} />
          <div>콘텐츠 최신화</div>
        </div>

        <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#1E40AF]' })}>언제나 새로운 도움센터</h3>
        <p class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#60A5FA]', flexGrow: '1', marginTop: '4px' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록 동기화하고 고객에게 낡지 않은 콘텐츠를 제공해요. 리더블에서
          자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>

        <img class={css({ size: '100px' })} alt="반짝임" src="/images/sparkles.png" />
      </div>
    </div>

    <div
      class={gridItem({
        colSpan: 2,
        rowSpan: 1,
        borderRadius: '16px',
        padding: '60px',
        backgroundColor: '[#FFEDD5/50]',
        height: '480px',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
        <div
          class={center({
            gap: '4px',
            borderWidth: '[0.5px]',
            borderColor: '[#FCD34D]',
            borderRadius: 'full',
            marginBottom: '20px',
            paddingX: '16px',
            paddingY: '6px',
            width: 'fit',
            fontSize: '14px',
            fontWeight: '[800]',
            color: '[#9A3412]',
            backgroundColor: 'neutral.0',
          })}
        >
          <Icon icon={CheckIcon} size={16} />
          <div>SEO</div>
        </div>

        <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#9A3412]' })}>찾을 수 있는 도움센터</h3>
        <p class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#FBBF24]', flexGrow: '1', marginTop: '4px' })}>
          고객이 필요한 바로 그 내용이 담긴 도움센터, 웹 검색결과에서 한번에 발견될 수 있도록 SEO를 충분히 고려했어요.
        </p>

        <img class={css({ size: '100px' })} alt="테크놀로지스트" src="/images/technologist.png" />
      </div>
    </div>

    <div
      class={gridItem({
        colSpan: 2,
        rowSpan: 1,
        borderRadius: '16px',
        padding: '60px',
        backgroundColor: '[#E0E7FF/50]',
        height: '480px',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
        <div
          class={center({
            gap: '4px',
            borderWidth: '[0.5px]',
            borderColor: '[#A5B4FC]',
            borderRadius: 'full',
            marginBottom: '20px',
            paddingX: '16px',
            paddingY: '6px',
            width: 'fit',
            fontSize: '14px',
            fontWeight: '[800]',
            color: '[#3730A3]',
            backgroundColor: 'neutral.0',
          })}
        >
          <Icon icon={CheckIcon} size={16} />
          <div>내비게이션</div>
        </div>

        <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#3730A3]' })}>쉬운 탐색과 꽤 쓸만한 검색</h3>
        <p class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#818CF8]', flexGrow: '1', marginTop: '4px' })}>
          잘 구조화된 문서들을 사이드바로 자유롭게 탐색하고, 도움센터 내부 검색으로 필요한 내용을 곧바로 찾을 수 있어요.
        </p>

        <img class={css({ size: '100px' })} alt="돋보기" src="/images/minifying-glass.png" />
      </div>
    </div>

    <div
      class={gridItem({
        colSpan: 3,
        rowSpan: 1,
        borderRadius: '16px',
        padding: '60px',
        backgroundColor: '[#ECFCCB]',
        height: '480px',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full', lineHeight: '[1.6]' })}>
        <div
          class={center({
            gap: '4px',
            borderWidth: '[0.5px]',
            borderColor: '[#86EFAC]',
            borderRadius: 'full',
            marginBottom: '20px',
            paddingX: '16px',
            paddingY: '6px',
            width: 'fit',
            fontSize: '14px',
            fontWeight: '[800]',
            color: '[#3F6212]',
            backgroundColor: 'neutral.0',
          })}
        >
          <Icon icon={CheckIcon} size={16} />
          <div>접근성</div>
        </div>

        <h3 class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#3F6212]' })}>누구라도, 무엇을 쓰더라도</h3>
        <p class={css({ fontSize: '24px', fontWeight: '[800]', color: '[#39C522]', flexGrow: '1', marginTop: '4px' })}>
          접근성을 고려한 설계로 고객이 어떤 기기를 사용하든지, 나이나 신체적 특성 등에 상관없이 원하는 내용을 손쉽게
          찾아 읽을 수 있어요.
        </p>

        <img class={css({ width: '195px', height: '110px' })} alt="돋보기" src="/images/couple.png" />
      </div>
    </div>
  </section>

  <section class={css({ marginTop: '160px', width: 'full' })}>
    <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
      <mark
        class={css({
          textGradient: 'to-l',
          gradientFrom: '[#F96A19]',
          gradientTo: '[#FB60BD]',
        })}
      >
        모든 것이
      </mark>
      <br />
      그냥 돼요, 리더블로
    </h2>

    <p
      class={css({
        marginTop: '24px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'neutral.70',
        lineHeight: '[1.6]',
        maxWidth: '512px',
      })}
    >
      도움센터에 필수적인 요구사항들을 고려해서 직접 개발하는 것은 비용이 많이 들고 번거로운 일입니다.
      <br />
      리더블이 모두 해 두었습니다. 찾을 수 있고 읽을 수 있는 꽤 쓸만한 도움센터를 만들 수 있도록 도와드려요.
      <br />
      지금 가이드 문서가 없어도 바로 시작해 보세요.
    </p>

    <table class={css({ marginTop: '72px', width: 'full', borderSpacing: '0', tableLayout: 'fixed' })}>
      <thead>
        <tr>
          <th class={css({ borderBottomWidth: '1px', borderColor: 'neutral.70', width: '200px' })} />
          <th
            class={css({
              borderBottomWidth: '1px',
              borderColor: 'neutral.20',
              paddingY: '18px',
              backgroundColor: 'neutral.90',
            })}
          >
            <FullLogo class={css({ color: 'neutral.0', height: '20px' })} />
          </th>
          <th
            class={css({
              borderBottomWidth: '1px',
              borderColor: 'neutral.70',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: 'gray.100/50',
            })}
          >
            Zendesk
          </th>
          <th
            class={css({ borderBottomWidth: '1px', borderColor: 'neutral.70', fontSize: '20px', fontWeight: 'bold' })}
          >
            Notion
          </th>
        </tr>
      </thead>
      <tbody>
        {#each tableContents as content (content.title)}
          <tr class={css({ _last: { '& > td': { borderBottomWidth: '1px', borderColor: 'gray.1000' } } })}>
            <td
              class={css({
                borderBottomWidth: '[0.5px]',
                borderColor: 'neutral.20',
                paddingX: '20px',
                paddingY: '16px',
                textStyle: '14b',
              })}
            >
              {content.title}
            </td>
            <td
              class={css({
                borderBottomWidth: '[0.5px]',
                borderColor: 'neutral.20',
                paddingY: '16px',
                textStyle: '14b',
                textAlign: 'center',
                backgroundColor: 'neutral.90',
                color: 'neutral.0',
              })}
            >
              {#if typeof content.readable === 'string'}
                {content.readable}
              {:else}
                <Icon style={css.raw({ marginX: 'auto' })} icon={content.readable} size={20} />
              {/if}
            </td>
            <td
              class={css({
                borderBottomWidth: '[0.5px]',
                borderColor: 'neutral.20',
                paddingY: '16px',
                textStyle: '14b',
                textAlign: 'center',
                backgroundColor: 'gray.100/50',
              })}
            >
              {#if typeof content.zendesk === 'string'}
                {content.zendesk}
              {:else}
                <Icon style={css.raw({ marginX: 'auto' })} icon={content.zendesk} size={20} />
              {/if}
            </td>
            <td
              class={css({
                borderBottomWidth: '[0.5px]',
                borderColor: 'neutral.20',
                paddingY: '16px',
                textStyle: '14b',
                textAlign: 'center',
              })}
            >
              {#if typeof content.notion === 'string'}
                {content.notion}
              {:else}
                <Icon style={css.raw({ marginX: 'auto' })} icon={content.notion} size={20} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>

<div
  id="contact"
  class={center({
    flexDirection: 'column',
    position: 'relative',
    marginTop: '240px',
    paddingBottom: '120px',
    background:
      '[linear-gradient(110deg, rgba(251, 96, 189, 0.00) -5.83%, rgba(251, 96, 189, 0.10) -0.54%, rgba(251, 96, 189, 0.03) 31.21%, rgba(251, 96, 189, 0.00) 47.09%, rgba(249, 106, 25, 0.02) 61.91%, rgba(249, 106, 25, 0.10) 83.08%)]',
    scrollMarginTop: '56px',
  })}
>
  <div class={css({ position: 'absolute', inset: '0' })}>
    <div class={css({ height: '1/2', backgroundGradient: 'to-t', gradientFrom: 'transparent', gradientTo: 'white' })} />
  </div>

  <div class={css({ fontSize: '[36px]', fontWeight: '[800]', lineHeight: '[1.6]', zIndex: '0' })}>지금 신청하기</div>
  <div
    class={css({
      marginTop: '12px',
      fontSize: '[16px]',
      fontWeight: 'bold',
      color: 'neutral.70',
      lineHeight: '[1.6]',
      zIndex: '0',
    })}
  >
    제품과 문서를 동기화하고 신뢰할 수 있는 가이드 문서를 만들어 보세요
  </div>

  <form
    class={css({
      marginTop: '72px',
      width: 'full',
      maxWidth: '512px',
      zIndex: '0',
    })}
  >
    <div class={flex({ direction: 'column', gap: '20px' })}>
      <fieldset class={flex({ direction: 'column', gap: '4px' })}>
        <label class={labelStyle} for="company">회사 이름</label>
        <input name="company" class={inputStyle} placeholder="회사 이름을 입력해주세요" type="text" />
      </fieldset>

      <fieldset class={flex({ direction: 'column', gap: '4px' })}>
        <label class={labelStyle} for="name">신청자 이름</label>
        <input name="name" class={inputStyle} placeholder="신청자 이름을 입력해주세요" type="text" />
      </fieldset>

      <fieldset class={flex({ direction: 'column', gap: '4px' })}>
        <label class={labelStyle} for="number">연락처</label>
        <input name="number" class={inputStyle} placeholder="연락처를 입력해주세요" type="text" />
      </fieldset>

      <fieldset class={flex({ direction: 'column', gap: '4px' })}>
        <label class={labelStyle} for="email">이메일 주소</label>
        <input name="email" class={inputStyle} placeholder="이메일 주소를 입력해주세요" type="text" />
      </fieldset>

      <label class={css({ display: 'flex', alignItems: 'center', gap: '4px' })}>
        <div
          class={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none',
          })}
        >
          <input
            class={cx(
              css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
                size: '13px',
                borderWidth: '1px',
                borderColor: 'gray.500',
                borderRadius: '0',
                cursor: 'pointer',
                appearance: 'none',
                _checked: { borderWidth: '0', backgroundColor: 'gray.900' },
              }),
              'peer',
            )}
            type="checkbox"
            on:change
          />
          <!-- bind:checked -->
          <Icon
            style={css.raw({
              display: 'none',
              position: 'absolute',
              top: '1/2',
              left: '1/2',
              translate: 'auto',
              translateX: '-1/2',
              translateY: '-1/2',
              color: 'white',
              cursor: 'pointer',
              _peerChecked: { display: 'block' },
            })}
            icon={CheckIcon}
            size={12}
          />
        </div>

        <span class={css({ textStyle: '14m', color: 'neutral.70', cursor: 'pointer' })}>개인정보활용동의</span>
      </label>
    </div>

    <button
      class={css({
        borderRadius: '4px',
        marginTop: '48px',
        fontSize: '14px',
        fontWeight: '[800]',
        color: 'neutral.0',
        backgroundColor: 'neutral.100',
        width: 'full',
        height: '40px',
      })}
      type="submit"
    >
      신청하기
    </button>
  </form>
</div>
