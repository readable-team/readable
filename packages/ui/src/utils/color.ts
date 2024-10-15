export function hexToRgb(hex: string) {
  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);

  if (!result) {
    throw new Error('Wrong Implementation: Invalid hex color');
  }

  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

// see: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
export function getLuminance(r: number, g: number, b: number) {
  const RsRGB = r / 255;
  const GsRGB = g / 255;
  const BsRGB = b / 255;

  // 감마 보정 함수
  const processChannel = (channel: number) => {
    return channel <= 0.040_45 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const R = processChannel(RsRGB);
  const G = processChannel(GsRGB);
  const B = processChannel(BsRGB);

  // 상대 휘도 계산 (ITU-R BT.709)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// see: https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
export function getContrastRatio(luminance1: number, luminance2: number) {
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (brighter + 0.05) / (darker + 0.05);
}

export function getAccessibleTextColor(bgColor: { r: number; g: number; b: number }): `#${string}` {
  const bgLuminance = getLuminance(bgColor.r, bgColor.g, bgColor.b);

  // 텍스트 색상 후보들
  const blackTextColor = '#09090B'; // gray.1000
  const whiteTextColor = '#FFFFFF'; // white

  const blackTextRgb = hexToRgb(blackTextColor);
  const whiteTextRgb = hexToRgb(whiteTextColor);

  const blackTextLuminance = getLuminance(blackTextRgb.r, blackTextRgb.g, blackTextRgb.b);
  const whiteTextLuminance = getLuminance(whiteTextRgb.r, whiteTextRgb.g, whiteTextRgb.b);

  const blackTextContrastRatio = getContrastRatio(bgLuminance, blackTextLuminance);
  const whiteTextContrastRatio = getContrastRatio(bgLuminance, whiteTextLuminance);

  if (whiteTextContrastRatio >= 4.5 || blackTextContrastRatio >= 4.5) {
    return whiteTextContrastRatio >= blackTextContrastRatio ? whiteTextColor : blackTextColor;
  } else {
    // NOTE: 배경 #777777은 텍스트 #09090B 또는 #FFFFFF로 명암비 4.5:1을 만족시키지 못하므로 #000000 사용
    return '#000000';
  }
}
