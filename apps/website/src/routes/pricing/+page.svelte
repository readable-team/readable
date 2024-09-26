<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex, grid } from '@readable/styled-system/patterns';
  import { Button, HorizontalDivider, Icon } from '@readable/ui/components';
  import BlocksIcon from '~icons/lucide/blocks';
  import BookTextIcon from '~icons/lucide/book-text';
  import FileIcon from '~icons/lucide/file';
  import MonitorSmartphone from '~icons/lucide/monitor-smartphone';
  import PaintbrushIcon from '~icons/lucide/paintbrush';
  import SearchIcon from '~icons/lucide/search';
  import SendIcon from '~icons/lucide/send';
  import UserRoundIcon from '~icons/lucide/user-round';
  import HeroLight from '$assets/hero/light.svg?component';
  import { env } from '$env/dynamic/public';
  import Header from '../Header.svelte';
  import SegmentButtons from '../SegmentButtons.svelte';

  let selectedPrice = 'monthly';

  $: plans = [
    {
      name: 'Individual',
      price: '무료',
      features: [
        { icon: UserRoundIcon, feature: '1명의 멤버' },
        { icon: MonitorSmartphone, feature: '1개의 사이트' },
        { icon: FileIcon, feature: '5,000 페이지뷰' },
        { icon: BlocksIcon, feature: '블럭수 무제한' },
        { icon: PaintbrushIcon, feature: '브랜딩 (테마색)' },
        { icon: SearchIcon, feature: '일반 검색' },
      ],
    },
    {
      name: 'Team',
      price: selectedPrice === 'yearly' ? '27,500' : '33,000',
      features: [
        { icon: UserRoundIcon, feature: '무제한 멤버' },
        { icon: MonitorSmartphone, feature: '무제한 사이트 생성' },
        { icon: FileIcon, feature: '무제한 페이지뷰' },
        { icon: BlocksIcon, feature: '블럭수 무제한' },
        { icon: PaintbrushIcon, feature: '브랜딩 (테마색)' },
        { icon: SearchIcon, feature: '일반 + AI 검색' },
        { icon: BookTextIcon, feature: '콘텐츠 최신화 (지원예정)' },
      ],
      addOns: [{ icon: SendIcon, feature: '화이트 라벨링 애드온', price: '22,000원/사이트' }],
    },
    {
      name: 'Enterprise',
      price: '문의',
      features: [
        { icon: UserRoundIcon, feature: '무제한 멤버' },
        { icon: MonitorSmartphone, feature: '무제한 사이트 생성' },
        { icon: FileIcon, feature: '무제한 페이지뷰' },
        { icon: BlocksIcon, feature: '블럭수 무제한' },
        { icon: PaintbrushIcon, feature: '브랜딩 (테마색)' },
        { icon: SearchIcon, feature: '일반 + AI 검색' },
        { icon: BookTextIcon, feature: '콘텐츠 최신화 (지원예정)' },
      ],
    },
  ];
</script>

<HeroLight
  class={css({
    position: 'absolute',
    top: '-121px',
    left: '0',
    right: '0',
    marginX: 'auto',
    zIndex: '50',
  })}
/>

<Header darkSections={[]} theme="dark" />

<div class={css({ backgroundColor: 'neutral.10' })}>
  <div
    class={flex({
      position: 'relative',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'neutral.100',
      overflow: 'hidden',
      color: 'white',
      paddingTop: { base: '128px', lg: '204px' },
      paddingBottom: { base: '84px', lg: '130px' },
    })}
  >
    <h1
      class={css({
        marginBottom: '16px',
        fontSize: { base: '20px', lg: '[45px]' },
        fontWeight: '[800]',
        textAlign: 'center',
      })}
    >
      가격 정책
    </h1>

    <p class={css({ marginBottom: '60px', textStyle: { base: '13m', lg: '22m' }, textAlign: 'center' })}>
      팀과 함께 리더블을 무료로 시작하세요.
      <br />
      무제한 문서 작성, 간편한 협업 기능,
      <br class={css({ hideFrom: 'lg' })} />
      그리고 기본적인 자동화 도구를 즐겨보세요.
    </p>

    <div class={css({ position: 'relative' })}>
      <SegmentButtons
        items={[
          { label: '월 결제', value: 'monthly' },
          { label: '년 결제', value: 'yearly' },
        ]}
        variant="white"
        on:select={(value) => (selectedPrice = value.detail)}
      />
      <span
        class={css({
          position: 'absolute',
          top: '-27px',
          right: '0',
          borderRadius: 'full',
          paddingX: '8px',
          paddingY: '3px',
          backgroundColor: 'accent.60',
          textStyle: '12sb',
          color: 'white',
        })}
      >
        2달 무료
      </span>
    </div>
  </div>

  <div
    class={grid({
      columns: { base: 1, md: 2, lg: 3 },
      gap: { base: '16px', lg: '20px' },
      marginTop: { base: '-60px', lg: '-105px' },
      marginX: 'auto',
      marginBottom: '200px',
      paddingX: '20px',
      width: 'full',
      maxWidth: '1280px',
    })}
  >
    {#each plans as plan (plan.name)}
      <div
        class={flex({
          direction: 'column',
          borderWidth: '2px',
          borderColor: plan.name === 'Team' ? '[#FFA16B]' : 'border.primary',
          borderRadius: '[20px]',
          padding: '24px',
          width: 'full',
          backgroundColor: 'white',
          boxShadow: 'emphasize',
          height: { base: '464px', md: '497px' },
          zIndex: '1',
        })}
      >
        <p
          class={css({
            marginBottom: { base: '6px', lg: '10px' },
            textStyle: { base: '14b', lg: '18b' },
            color: 'text.tertiary',
          })}
        >
          {plan.name}
        </p>

        <p class={css({ textStyle: { base: '22eb', lg: '28eb' } })}>
          {plan.price}
          {#if plan.name === 'Team'}
            <span class={css({ textStyle: { base: '13sb', lg: '16sb' } })}>
              원 / {selectedPrice === 'yearly' ? '년 결제' : '월 결제'}
            </span>
          {/if}
        </p>

        <HorizontalDivider style={css.raw({ marginY: '16px' })} />

        <div class={flex({ direction: 'column', gap: '12px', textStyle: { base: '13m', lg: '14m' } })}>
          {#each plan.features as feature (feature.feature)}
            <div class={flex({ align: 'center', gap: '6px', color: 'text.secondary' })}>
              <Icon icon={feature.icon} size={14} />
              <span>{feature.feature}</span>
            </div>
          {/each}

          {#if plan.addOns}
            <HorizontalDivider />

            {#each plan.addOns as addOn (addOn.feature)}
              <div class={flex({ align: 'center', justify: 'space-between', color: 'text.tertiary' })}>
                <div class={flex({ align: 'center', gap: '6px' })}>
                  <Icon icon={addOn.icon} size={14} />
                  <span>{addOn.feature}</span>
                </div>

                <span>{addOn.price}</span>
              </div>
            {/each}
          {/if}
        </div>

        {#if plan.name === 'Enterprise'}
          <Button
            style={css.raw({ marginTop: 'auto', width: 'full' })}
            href="/contact"
            size="lg"
            type="link"
            variant="secondary"
          >
            문의하기
          </Button>
        {:else}
          <Button
            style={css.raw({ marginTop: 'auto', width: 'full' })}
            href={env.PUBLIC_DASHBOARD_URL}
            size="lg"
            type="link"
            variant={plan.name === 'Team' ? 'primary' : 'secondary'}
          >
            시작하기
          </Button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<footer
  class={flex({
    marginX: 'auto',
    width: 'full',
    maxWidth: '1280px',
    direction: 'column',
    gap: '40px',
    paddingX: { base: '24px', lg: '32px' },
    paddingY: '48px',
    backgroundColor: 'neutral.0',
  })}
>
  <!-- <div class={flex({ align: 'center', justify: 'space-between' })}>
    <FullLogo class={css({ height: { base: '20px', lg: '24px' } })} />

    <a aria-label="GitHub" href="https://github.com/readable-team" rel="noopener noreferrer" target="_blank">
      <Icon style={css.raw({ color: 'neutral.100', hideFrom: 'lg' })} icon={IconGithub} size={24} />
      <Icon style={css.raw({ color: 'neutral.100', hideBelow: 'lg' })} icon={IconGithub} size={32} />
    </a>
  </div> -->

  <div class={flex({ textStyle: { base: '12m', lg: '14m' }, color: 'neutral.70', direction: 'column', gap: '4px' })}>
    <p>주식회사 펜슬컴퍼니 | 대표 배준현 | 서울특별시 강남구 강남대로100길 14, 6층</p>

    <p>
      사업자등록번호 610-88-03078 | <a
        href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078"
        rel="noopener noreferrer"
        target="_blank"
      >
        통신판매업신고 2023-서울강남-4541
      </a>
    </p>

    <p>02-565-7695 | hello@penxle.io</p>
  </div>
</footer>
