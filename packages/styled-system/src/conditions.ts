export const conditions = {
  extend: {
    busy: '&:is([aria-busy="true"])',
    light: '[data-theme=light] &',
    dark: '[data-theme=dark] &',
    hasDisabledInput: '&:has(input:disabled)',
    hasFocusedInput: '&:has(input:focus)',
    hasInvalidInput: '&:has(input[aria-invalid])',
    hasFilledInput: '&:has(input:not(:placeholder-shown)), &:has(input[aria-live="polite"])',
  },
};
