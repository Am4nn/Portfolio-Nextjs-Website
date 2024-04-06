/**
 * Media query breakpoints
 */
export const media = {
  desktop: 2080,
  laptop: 1680,
  tablet: 1040,
  mobile: 696,
  mobileS: 400,
};

/**
 * Convert a px string to a number
 */
export const pxToNum = (px: string) => Number(px.replace('px', ''));

/**
 * Convert a number to a px string
 */
export const numToPx = (num: number) => `${num}px`;

/**
 * Convert pixel values to rem for a11y
 */
export const pxToRem = (px: number) => `${px / 16}rem`;

/**
 * Convert ms token values to a raw numbers for ReactTransitionGroup
 * Transition delay props
 */
export const msToNum = (msString: string) => Number(msString.replace('ms', ''));

/**
 * Convert a number to an ms string
 */
export const numToMs = (num: number) => `${num}ms`;

/**
 * Convert an rgb theme property (e.g. rgbBlack: '0 0 0')
 * to values that can be spread into a ThreeJS Color class
 */
export const rgbToThreeColor = (rgb: string) =>
  rgb?.split(' ').map(value => Number(value) / 255) || [];

/**
 * Convert a JS object into `--` prefixed css custom properties.
 * Optionally pass a second param for normal styles
 */
export function cssProps(props: any, style = {}) {
  let result: any = {};

  const keys = Object.keys(props);

  for (const key of keys) {
    let value = props[key];

    if (typeof value === 'number' && key === 'delay') {
      value = numToMs(value);
    }

    if (typeof value === 'number' && key !== 'opacity') {
      value = numToPx(value);
    }

    if (typeof value === 'number' && key === 'opacity') {
      value = `${value * 100}%`;
    }

    result[`--${key}`] = value;
  }

  return { ...result, ...style };
}

/**
 * Concatenate classNames together
 */
export function classes(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}