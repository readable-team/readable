<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { flex } from '@readable/styled-system/patterns';

  const labelStyle = css({ fontSize: '12px', fontWeight: 'bold' });

  const inputStyle = css({
    borderWidth: '1px',
    borderColor: 'neutral.30',
    borderRadius: '4px',
    paddingX: '12px',
    paddingY: '11px',
    fontSize: '14px',
  });
</script>

<form
  class={css({
    borderRadius: '4px',
    padding: '24px',
    boxShadow: 'normal',
    width: 'full',
    maxWidth: '412px',
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
