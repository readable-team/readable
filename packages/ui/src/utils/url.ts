export const addHttpScheme = (url: string) => {
  if (!url.includes('://')) {
    return `http://${url}`;
  }
  return url;
};

// FIXME: 안 됨
export const isValidUrl = (url: string) => {
  try {
    new URL(addHttpScheme(url));
    return true;
  } catch {
    return false;
  }
};
