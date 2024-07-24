<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import FileTextIcon from '~icons/lucide/file-text';
  import PaintRollerIcon from '~icons/lucide/paint-roller';
  import SettingsIcon from '~icons/lucide/settings';
  import NavItem from './NavItem.svelte';

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
        gap: '3px',
      })}
    >
      <li>
        <!-- FIXME: count -->
        <NavItem count={99} icon={FileTextIcon} path={`${sitePath}/pages`} title="페이지" />
      </li>
      <li>
        <NavItem icon={PaintRollerIcon} path={`${sitePath}/design`} title="디자인" />
      </li>
      <li>
        <NavItem icon={SettingsIcon} path={`${sitePath}/settings`} title="설정" />
      </li>
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
