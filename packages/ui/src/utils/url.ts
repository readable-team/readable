import { tokenize } from 'linkifyjs';

export const addHttpScheme = (url: string) => {
  if (!url.includes('://')) {
    return `http://${url}`;
  }
  return url;
};

export const isValidLinkStructure = (maybeLink: string): boolean => {
  const tokens = tokenize(maybeLink).map((token) => token.toObject('http://'));

  if (tokens.length === 1) {
    return tokens[0].isLink;
  }

  if (tokens.length === 3 && tokens[1].isLink) {
    return ['()', '[]'].includes(tokens[0].value + tokens[2].value);
  }

  return false;
};

export const createAnchorId = (title: string): string => {
  return encodeURIComponent(title.trim().toLowerCase().replaceAll(' ', '-'));
};
