export const conditions = {
  extend: {
    busy: '&:is([aria-busy="true"])',
    light: '[data-theme=light] &',
    dark: '[data-theme=dark] &',
    enabled: '&:is(:enabled, a[aria-disabled="false"])',
    disabled: '&:is(:disabled, [aria-disabled="true"])',
    hasDisabledInput: '&:has(input:disabled)',
    hasReadonlyInput: '&:has(input:read-only)',
    hasFocusedInput: '&:has(input:focus)',
    hasInvalidInput: '&:has(input[aria-invalid])',
    hasFilledInput: '&:has(input:not(:placeholder-shown)), &:has(input[aria-live="polite"])',
    currentLocation: '&[aria-current="location"]',
  },
};
