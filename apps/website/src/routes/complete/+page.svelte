<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Helmet } from '@readable/ui/components';
  import HeroLight from '$assets/hero/light.svg?component';
  import Header from '../Header.svelte';
</script>

<Helmet
  description="빨리 움직이는 팀을 위한 가이드 문서 도구. 낡지 않는 도움센터를 지금 생성해 보세요."
  image={{ src: 'https://cdn.rdbl.app/opengraph/cover.png', size: 'large' }}
  title="제출 완료"
  trailing="리더블"
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

<Helmet
  description="콘텐츠에만 집중하세요. 나머지는 리더블이 해드려요. 낡지 않는 가이드 문서를 지금 생성해 보세요"
  image={{ src: 'https://cdn.rdbl.app/opengraph/cover.png', size: 'large' }}
  title="빨리 움직이는 팀을 위한 가이드 문서 도구, 리더블"
  trailing={null}
/>

<Header darkSections={[]} theme="dark" />

<div
  class={flex({
    justify: 'center',
    direction: 'column',
    grow: '1',
    paddingY: { base: '204px', lg: '[280px]' },
    backgroundColor: 'neutral.100',
    color: 'white',
  })}
>
  <div class={css({ marginX: 'auto', paddingX: '20px', maxWidth: '726px' })}>
    <h1
      class={css({
        marginBottom: { base: '10px', lg: '16px' },
        fontSize: { base: '24px', lg: '[45px]' },
        fontWeight: '[800]',
        textAlign: 'center',
      })}
    >
      감사합니다
    </h1>

    <p class={css({ textStyle: { base: '14m', lg: '22m' }, textAlign: 'center' })}>
      제출이 완료되었습니다.
      <br />
      확인 후 연락드리겠습니다.
    </p>
  </div>
</div>
