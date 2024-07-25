<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';
  import { Icon, LogoPlaceholder } from '@readable/ui/components';
  import ExternalLinkIcon from '~icons/lucide/external-link';

  export let sitePath: string;
  export let usersiteUrl: string;
</script>

<aside
  class={flex({
    flexDirection: 'column',
    gap: '10px',
    width: '232px',
    padding: '20px',
    backgroundColor: 'sidebar.surface',
  })}
>
  <div>사이트(메뉴버튼)</div>

  <a
    class={css({
      'display': 'flex',
      'gap': '6px',
      'height': '40px',
      'paddingX': '12px',
      'alignItems': 'center',
      'borderRadius': '8px',
      'backgroundColor': 'neutral.10',
      'color': 'neutral.90',
      '&:hover': {
        backgroundColor: 'neutral.40',
      },
    })}
    href={usersiteUrl}
    rel="noopener noreferrer"
    target="_blank"
  >
    <LogoPlaceholder size={20} />
    <span>사이트 바로가기</span>
    <Icon
      style={{
        marginLeft: 'auto',
        color: 'neutral.50',
      }}
      icon={ExternalLinkIcon}
      size={16}
    />
  </a>

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
