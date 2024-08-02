export const load = (event) => {
  return {
    hostnameOverride: event.cookies.get('RDBL_HOSTNAME_OVERRIDE'),
  };
};
