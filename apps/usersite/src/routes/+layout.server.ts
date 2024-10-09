export const load = (event) => {
  return {
    hasCmd: event.request.headers.get('user-agent')?.includes('Macintosh') || false,
  };
};
