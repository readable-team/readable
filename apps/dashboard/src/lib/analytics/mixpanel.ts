import Mixpanel from 'mixpanel-browser';
import { env } from '$env/dynamic/public';

Mixpanel.init(env.PUBLIC_MIXPANEL_TOKEN, {
  api_host: 'https://t.rdbl.app',
  ignore_dnt: true,
  persistence: 'localStorage',
});
