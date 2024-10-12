import './app.css';

import Widget from './Widget.svelte';

if (!document.currentScript) {
  throw new Error('Readable SDK must be included in the page');
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const src = document.currentScript.getAttribute('src')!;
const siteId = document.currentScript.dataset.siteId;

if (!siteId) {
  throw new Error('Site ID is required');
}

const stylesheetUrl = new URL('style.css', src).toString();
const link = document.createElement('link');
link.href = stylesheetUrl;
link.rel = 'stylesheet';
document.head.append(link);

setTimeout(() => {
  const dom = document.createElement('div');
  dom.classList.add('rdbl-widget');
  dom.style.display = 'contents';
  document.body.append(dom);
  new Widget({ target: dom, props: { siteId }, intro: true });
}, 1000);
