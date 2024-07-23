import { defineSemanticTokens } from '@pandacss/dev';
import { semanticColors } from './colors';

export const semanticTokens = defineSemanticTokens({
  colors: semanticColors,
});
