<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Helmet, Icon } from '@readable/ui/components';
  import IconGithub from '~icons/simple-icons/github';
  import HeroLight from '$assets/hero/light.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import A11ySection from './A11ySection.svelte';
  import ClientsSection from './ClientsSection.svelte';
  import CtaSection from './CtaSection.svelte';
  import DashboardSection from './DashboardSection.svelte';
  import Header from './Header.svelte';
  import HeroSection from './HeroSection.svelte';
  import HookingSection from './HookingSection.svelte';
  import MachineFriendlySection from './MachineFriendlySection.svelte';
  import SearchSection from './SearchSection.svelte';

  let heroSection: HTMLElement;
  let dashboardSection: HTMLElement;
  $: darkSections = [heroSection, dashboardSection].filter(Boolean);
</script>

<Helmet
  description="빨리 움직이는 팀을 위한 가이드 문서 도구. 낡지 않는 도움센터를 지금 생성해 보세요."
  image={{ src: 'https://cdn.rdbl.app/opengraph/cover.png', size: 'large' }}
  title="이용자들이 사랑할 도움센터, 리더블"
  trailing={null}
/>

<HeroLight
  class={css({
    position: 'absolute',
    top: '-121px',
    left: '0',
    right: '0',
    marginX: 'auto',
    zIndex: '50',
    width: '1280px',
    height: '360px',
    lgDown: {
      width: 'full',
      height: '300px',
    },
  })}
/>

<Header {darkSections} />

<HeroSection bind:section={heroSection} />

<HookingSection />

<MachineFriendlySection />

<SearchSection />

<A11ySection />

<DashboardSection bind:section={dashboardSection} />

<ClientsSection />

<CtaSection />

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
  <div class={flex({ align: 'center', justify: 'space-between' })}>
    <FullLogo class={css({ height: { base: '20px', lg: '24px' } })} />

    <a aria-label="GitHub" href="https://github.com/readable-team" rel="noopener noreferrer" target="_blank">
      <Icon style={css.raw({ color: 'neutral.100', hideFrom: 'lg' })} icon={IconGithub} size={24} />
      <Icon style={css.raw({ color: 'neutral.100', hideBelow: 'lg' })} icon={IconGithub} size={32} />
    </a>
  </div>

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
