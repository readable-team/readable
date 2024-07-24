<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';

  export let sitePath: string;
</script>

<aside
  class={flex({
    flexDirection: 'column',
    width: '232px',
    padding: '20px',
    backgroundColor: 'sidebar.surface',
  })}
>
  <div>사이트(메뉴버튼)</div>
  <div>사이트 바로가기(사이드바버튼)</div>
  <nav>
    <ul
      class={flex({
        flexDirection: 'column',
        gap: '2px',
      })}
    >
      <li><a href={`${sitePath}/pages`}>페이지</a></li>
      <li><a href={`${sitePath}/design`}>디자인</a></li>
      <li><a href={`${sitePath}/settings`}>설정</a></li>
    </ul>
  </nav>
  <div
    class={css({
      marginTop: 'auto',
    })}
  >
    유저 프로필
  </div>
</aside>
