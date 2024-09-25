<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon } from '@readable/ui/components';
  import CodeXmlIcon from '~icons/lucide/code-xml';
  import Lighthouse from './Lighthouse.svelte';
  import SectionTitle from './SectionTitle.svelte';

  const cards = [
    {
      icon: CodeXmlIcon,
      title: 'SSR',
      description: '서버 사이드 렌더링',
    },
    {
      icon: CodeXmlIcon,
      title: 'Site Map',
      description: '사이트 맵',
    },
    {
      icon: CodeXmlIcon,
      title: '소셜 미디어 최적화',
      description: '소셜 미디어 최적화',
    },
    {
      icon: CodeXmlIcon,
      title: '웹 접근성 최적화',
      description: '웹 접근성 최적화',
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
    })}
  >
    <SectionTitle>
      <span slot="subtitle" class={css({ color: '[#13AC60]' })}>SEO</span>
      <span slot="title">
        발견될 수 있는
        <br />
        도움센터
      </span>
      <span slot="description">
        <span>별도의 설정 없이도&nbsp;</span>
        <em>접근성이 고려된 설계</em>
        <span>
          와 잘 만들어져 있는
          <br />
          메타데이터 덕분에 검색 엔진에 잘 인덱싱될 수 있습니다.
        </span>
        <div class={css({ marginTop: '13px', fontSize: '14px', fontWeight: '[500]', color: 'text.tertiary' })}>
          *라이트하우스 스코어
        </div>
      </span>
    </SectionTitle>

    <div
      class={flex({
        marginTop: '80px',
        gap: '60px',
        justifyContent: 'center',
      })}
    >
      <Lighthouse title="Performance" />
      <Lighthouse title="Accessibility" />
      <Lighthouse title="Best Practices" />
      <Lighthouse title="SEO" />
    </div>

    <div class={flex({ marginTop: '80px', justifyContent: 'space-between' })}>
      {#each cards as card (card.title)}
        <div
          class={flex({
            width: '300px',
            height: '138px',
            flexDirection: 'column',
            gap: '6px',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: 'surface.primary',
            boxShadow: 'emphasize',
          })}
        >
          <div class={flex({ alignItems: 'center', gap: '8px' })}>
            <Icon style={css.raw({ color: '[#13AC60]' })} icon={card.icon} size={24} />
            <div class={css({ fontSize: '22px', fontWeight: '[700]' })}>{card.title}</div>
          </div>

          <div class={css({ fontSize: '16px', fontWeight: '[500]', color: 'text.tertiary' })}>
            {card.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
