import { random } from '@ctrl/tinycolor';
import { renderAsync } from '@resvg/resvg-js';
import { renderToStaticMarkup } from 'react-dom/server';

const generateRandomGradient = () => {
  const first = random({
    luminosity: 'bright',
  });

  const second = first.triad()[1];

  return {
    from: first.toHexString(),
    to: second.toHexString(),
  };
};

export const generateRandomAvatar = async () => {
  const gradient = generateRandomGradient();
  const element = (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <g>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
        <rect fill="url(#gradient)" x="0" y="0" width="512" height="512" />
      </g>
    </svg>
  );

  const markup = renderToStaticMarkup(element);
  const rendered = await renderAsync(markup);

  return new File([rendered.asPng()], 'avatar.png', { type: 'image/png' });
};
