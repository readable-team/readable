import { defineTokens } from '@pandacss/dev';

export const shadows = defineTokens.shadows({
  normal: {
    value: [
      '0 1px 5px 0 rgba(80, 84, 90, 0.06)',
      '0 0px 3px 0 rgba(80, 84, 90, 0.04)',
      '0px 0px 7px 0 rgba(80, 84, 90, 0.04)',
    ],
  },
  emphasize: {
    value: [
      '0px 2px 8px 0 rgba(80, 84, 90, 0.12)',
      '0px 1px 4px 0 rgba(80, 84, 90, 0.08)',
      '0px 0px 1px 0 rgba(80, 84, 90, 0.08)',
    ],
  },
  strong: {
    value: [
      '0px 6px 12px 0 rgba(80, 84, 90, 0.12)',
      '0px 4px 8px 0 rgba(80, 84, 90, 0.08)',
      '0px 0px 4px 0 rgba(80, 84, 90, 0.08)',
    ],
  },
  heavy: {
    value: [
      '0px 16px 20px rgba(80, 84, 90, 0.12)',
      '0px 8px 16px 0 rgba(80, 84, 90, 0.08)',
      '0px 0px 8px 0 rgba(80, 84, 90, 0.08)',
    ],
  },
});
