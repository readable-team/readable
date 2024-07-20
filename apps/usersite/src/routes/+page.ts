export const load = async (event) => {
  return {
    site: event.url.hostname,
  };
};
