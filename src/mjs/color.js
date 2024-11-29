/**
 * color.js
 */

/* shared */
import { convert, resolve } from '../lib/color/css-color.min.js';
import { getType } from './common.js';

const { colorToHex, colorToRgb, numberToHex } = convert;

/* constant */
const MAX_RGB = 255;

/**
 * convert rgb to hex color
 * @param {Array.<number>} rgb - [r, g, b, a] r|g|b: 0..255 a: 0..1|undefined
 * @returns {string} - hex color;
 */
export const convertRgbToHex = rgb => {
  if (!Array.isArray(rgb)) {
    throw new TypeError(`Expected Array but got ${getType(rgb)}.`);
  }
  const [r, g, b, a] = rgb;
  const res = colorToHex(`rgb(${r} ${g} ${b} / ${isNaN(a) ? 1 : a})`, {
    alpha: true
  });
  return res;
};

/**
 * get color in hex color notation
 * @param {string} value - value
 * @param {object} [opt] - options
 * @returns {?string|Array} - hex color or array of [property, hex] pair
 */
export const getColorInHex = (value, opt = {}) => {
  const { alpha, currentColor, property } = opt;
  const format = alpha ? 'hexAlpha' : 'hex';
  const res = resolve(value, {
    currentColor,
    format,
    key: property
  });
  return res;
};

/**
 * composite two layered colors
 * @param {string} overlay - overlay color
 * @param {string} base - base color
 * @returns {string} - hex color
 */
export const compositeLayeredColors = (overlay, base) => {
  const [rO, gO, bO, aO] = colorToRgb(overlay);
  const [rB, gB, bB, aB] = colorToRgb(base);
  const alpha = 1 - (1 - aO) * (1 - aB);
  let hex;
  if (aO === 1) {
    hex = colorToHex(`rgb(${rO} ${gO} ${bO})`);
  } else if (aO === 0) {
    hex = colorToHex(`rgb(${rB} ${gB} ${bB} / ${aB})`, {
      alpha: true
    });
  } else if (alpha) {
    const alphaO = aO / alpha;
    const alphaB = aB * (1 - aO) / alpha;
    const r = numberToHex(rO * alphaO + rB * alphaB);
    const g = numberToHex(gO * alphaO + gB * alphaB);
    const b = numberToHex(bO * alphaO + bB * alphaB);
    const a = numberToHex(alpha * MAX_RGB);
    if (a === 'ff') {
      hex = `#${r}${g}${b}`;
    } else {
      hex = `#${r}${g}${b}${a}`;
    }
  }
  return hex;
};
