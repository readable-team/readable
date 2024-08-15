<script lang="ts">
  import { css } from '@readable/styled-system/css';
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
  });

  onMount(() => {
    const interval = setInterval(() => {
      i += 1;
    }, 2000);

    return () => clearInterval(interval);
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
      notion: XIcon,
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
</script>

<Helmet title="5초만에 만드는 도움센터, 리더블" trailing={null} />

<div
  class={css({
    paddingTop: '80px',
    background:
      '[linear-gradient(110deg, rgba(251, 96, 189, 0.00) -5.83%, rgba(251, 96, 189, 0.10) -0.54%, rgba(251, 96, 189, 0.03) 31.21%, rgba(251, 96, 189, 0.00) 47.09%, rgba(249, 106, 25, 0.02) 61.91%, rgba(249, 106, 25, 0.10) 83.08%)]',
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
        CTA TEXT
      </a>
    </div>

    <div class={css({ flexGrow: '1', minWidth: '160px' })} />

    <div class={css({ marginRight: '-48px', paddingTop: '100px', overflow: 'hidden' })}>
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
  <div class={css({ textStyle: '16sb', color: 'neutral.50', marginBottom: '24px' })}>
    다양한 규모의 팀이 리더블과 함께 하고 있습니다.
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
  <div class={css({ width: 'full', marginBottom: '48px' })}>
    <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
      도리의 거의 첨병에
      <br />
      그때야
      <mark>안정합니다</mark>
      <br />
      하나의 통일하여.
    </h2>
    <p class={css({ fontWeight: 'bold', color: 'neutral.70' })}>
      아주 귀의만, 선을 대한 품질도 영선공만 인체에 간석지를 구한다. 계산은 피로서 사람의 허용된 한계를 되어 수 지나다.
    </p>
  </div>

  <section class={grid({ columns: 3, rowGap: '24px', columnGap: '24px', minChildWidth: '426px' })}>
    <div
      class={gridItem({
        colSpan: 1,
        rowSpan: 1,
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '520px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>
    <div
      class={gridItem({
        colSpan: 2,
        rowSpan: 1,
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '520px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>

    <div
      class={gridItem({
        colSpan: 2,
        rowSpan: 1,
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '520px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>
    <div
      class={gridItem({
        colSpan: 1,
        rowSpan: 1,
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '520px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>
  </section>

  <section class={grid({ columns: 2, gap: '36px', marginTop: '160px' })}>
    <div
      class={css({
        borderRadius: '4px',
        padding: '40px',
        backgroundColor: 'gray.100/50',
        height: '860px',
        boxShadow: 'normal',
      })}
    >
      <div class={flex({ direction: 'column', height: 'full' })}>
        <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

        <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
          잊고 살던 가이드 문서, 실제 제품과 동일하도록.
        </h3>
        <p class={css({ fontWeight: '[500]' })}>
          아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
        </p>
      </div>
    </div>

    <div class={flex({ direction: 'column' })}>
      <div class={css({ paddingY: '44px', paddingRight: '92px' })}>
        <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
          도리의 거의 첨병에
          <br />
          그때야
          <mark>안정합니다</mark>
          <br />
          하나의 통일하여.
        </h2>
        <p class={css({ fontWeight: 'bold', color: 'neutral.70' })}>
          아주 귀의만, 선을 대한 품질도 영선공만 인체에 간석지를 구한다. 계산은 피로서 사람의 허용된 한계를 되어 수
          지나다.
        </p>
      </div>
      <div
        class={css({
          marginTop: 'auto',
          borderRadius: '4px',
          padding: '40px',
          backgroundColor: 'gray.100/50',
          height: '465px',
          boxShadow: 'normal',
        })}
      >
        <div class={flex({ direction: 'column', height: 'full' })}>
          <div class={css({ width: 'full', height: '240px', backgroundColor: 'neutral.30' })} />

          <h3 class={css({ marginTop: 'auto', fontSize: '24px', fontWeight: 'bold' })}>
            잊고 살던 가이드 문서, 실제 제품과 동일하도록.
          </h3>
          <p class={css({ fontWeight: '[500]' })}>
            아웃데이트된 문서, 리더블에서 자동으로 쏙쏙 잡아 놓치지 않게 해드려요.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class={css({ marginTop: '160px', width: 'full' })}>
    <h2 class={css({ fontSize: '[46px]', fontWeight: '[900]' })}>
      <mark>모든 것이</mark>
      <br />
      그냥 돼요, 리더블로
    </h2>

    <p class={css({ marginTop: '24px', fontWeight: 'bold', color: 'neutral.70', maxWidth: '512px' })}>
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
  })}
>
  <div class={css({ position: 'absolute', inset: '0' })}>
    <div class={css({ height: '1/2', backgroundGradient: 'to-t', gradientFrom: 'transparent', gradientTo: 'white' })} />
  </div>

  <div class={css({ fontSize: '[36px]', fontWeight: '[800]', zIndex: '0' })}>지금 신청하기</div>
  <div class={css({ marginTop: '12px', fontSize: '[16px]', fontWeight: '[500]', zIndex: '0' })}>
    제품과 문서를 동기화하고 신뢰할 수 있는 가이드 문서를 만들어 보세요
  </div>

  <form
    class={css({
      borderRadius: '4px',
      padding: '24px',
      backgroundColor: 'white',
      boxShadow: 'normal',
      marginTop: '72px',
      width: 'full',
      maxWidth: '412px',
      zIndex: '0',
    })}
  >
    <div class={flex({ direction: 'column', gap: '20px' })}>
      <fieldset class={flex({ direction: 'column', gap: '4px' })}>
        <label class={labelStyle} for="company">회사이름</label>
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
