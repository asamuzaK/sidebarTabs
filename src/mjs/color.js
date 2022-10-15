/**
 * color.js
 * NOTE: 'currentColor' keyword is not supported
 */

/* shared */
import { getType, isString, logWarn } from './common.js';

/* constants */
const DEG = 360;
const DOUBLE = 2;
const GRAD = 400;
const HALF = 0.5;
const HEX = 16;
const INTERVAL = 60;
const NUM_MAX = 255;
const PCT_MAX = 100;
const LINEAR_COEF = 12.92;
const LINEAR_EXP = 2.4;
const LINEAR_FIX = 0.055;
const REG_ANGLE = 'deg|g?rad|turn';
const REG_COLOR_SPACE = '((?:ok)?l(?:ab|ch)|h(?:sl|wb)|srgb(?:-linear)?|xyz(?:-d(?:50|65))?)';
const REG_NUM = '-?(?:(?:0|[1-9]\\d*)(?:\\.\\d*)?|\\.\\d+)';
const REG_PCT = `${REG_NUM}%`;
const REG_HSL_HWB = `${REG_NUM}(?:${REG_ANGLE})?\\s+${REG_PCT}\\s+${REG_PCT}(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_HSL_LV3 = `${REG_NUM}(?:${REG_ANGLE})?\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT}(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB = `(?:${REG_NUM}\\s+${REG_NUM}\\s+${REG_NUM}|${REG_PCT}\\s+${REG_PCT}\\s+${REG_PCT})(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB_LV3 = `(?:${REG_NUM}\\s*,\\s*${REG_NUM}\\s*,\\s*${REG_NUM}|${REG_PCT}\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT})(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_COLOR_TYPE = `(?:[a-z]+|#(?:[\\da-f]{3}|[\\da-f]{4}|[\\da-f]{6}|[\\da-f]{8})|hsla?\\(\\s*(?:${REG_HSL_HWB}|${REG_HSL_LV3})\\s*\\)|hwb\\(\\s*${REG_HSL_HWB}\\s*\\)|rgba?\\(\\s*(?:${REG_RGB}|${REG_RGB_LV3})\\s*\\))`;
const REG_COLOR_MIX_PART = `${REG_COLOR_TYPE}(?:\\s+${REG_PCT})?`;
const REG_COLOR_MIX = `in\\s+${REG_COLOR_SPACE}\\s*,\\s*(${REG_COLOR_MIX_PART})\\s*,\\s*(${REG_COLOR_MIX_PART})`;

export const colorname = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkgrey: '#a9a9a9',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  grey: '#808080',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32'
};

/**
 * number to hex string
 *
 * @param {number} value - value
 * @returns {string} - hex
 */
export const numberToHexString = async value => {
  if (typeof value !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(value)}.`);
  } else if (Number.isNaN(value)) {
    throw new TypeError(`${value} is not a number.`);
  }
  let hex = Math.round(value).toString(HEX);
  if (hex < 0 || hex > NUM_MAX) {
    throw new RangeError(`${value} is not between 0 and ${NUM_MAX}.`);
  }
  if (hex.length === 1) {
    hex = `0${hex}`;
  }
  return hex;
};

/**
 * angle to deg
 *
 * @param {string} angle - angle
 * @returns {number} - deg 0..360
 */
export const angleToDeg = async angle => {
  if (!isString(angle)) {
    throw new TypeError(`Expected String but got ${getType(angle)}.`);
  }
  const reg = new RegExp(`^(${REG_NUM})(${REG_ANGLE})?$`);
  if (!reg.test(angle)) {
    throw new Error(`Invalid property value: ${angle}`);
  }
  const [, val, unit] = angle.match(reg);
  const value = val.startsWith('.') ? `0${val}` : val;
  let deg;
  switch (unit) {
    case 'grad':
      deg = parseFloat(value) * DEG / GRAD;
      break;
    case 'rad':
      deg = parseFloat(value) * DEG / (Math.PI * DOUBLE);
      break;
    case 'turn':
      deg = parseFloat(value) * DEG;
      break;
    default:
      deg = parseFloat(value);
  }
  deg %= DEG;
  if (deg < 0) {
    deg += DEG;
  }
  return deg;
};

/**
 * hex to rgb
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const hexToRgb = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  if (!(/^#[\da-f]{6}$/i.test(value) || /^#[\da-f]{8}$/i.test(value) ||
        /^#[\da-f]{4}$/i.test(value) || /^#[\da-f]{3}$/i.test(value))) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const arr = [];
  if (/^#[\da-f]{6}$/.test(value)) {
    const [, r, g, b] = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    arr.push(
      parseInt(r, HEX),
      parseInt(g, HEX),
      parseInt(b, HEX),
      1
    );
  } else if (/^#[\da-f]{8}$/.test(value)) {
    const [, r, g, b, a] =
      value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    arr.push(
      parseInt(r, HEX),
      parseInt(g, HEX),
      parseInt(b, HEX),
      parseInt(a, HEX) / NUM_MAX
    );
  } else if (/^#[\da-f]{4}$/i.test(value)) {
    const [, r, g, b, a] =
      value.match(/^#([\da-f])([\da-f])([\da-f])([\da-f])$/i);
    arr.push(
      parseInt(`${r}${r}`, HEX),
      parseInt(`${g}${g}`, HEX),
      parseInt(`${b}${b}`, HEX),
      parseInt(`${a}${a}`, HEX) / NUM_MAX
    );
  } else if (/^#[\da-f]{3}$/i.test(value)) {
    const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/i);
    arr.push(
      parseInt(`${r}${r}`, HEX),
      parseInt(`${g}${g}`, HEX),
      parseInt(`${b}${b}`, HEX),
      1
    );
  }
  return arr;
};

/**
 * hex to linear rgb
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b|a: 0..1
 */
export const hexToLinearRgb = async value => {
  const CONDITION = 0.04045;
  const [rr, gg, bb, a] = await hexToRgb(value);
  let r = parseFloat(rr) / NUM_MAX;
  let g = parseFloat(gg) / NUM_MAX;
  let b = parseFloat(bb) / NUM_MAX;
  if (r > CONDITION) {
    r = Math.pow((r + LINEAR_FIX) / (1 + LINEAR_FIX), LINEAR_EXP);
  } else {
    r = (r / LINEAR_COEF);
  }
  if (g > CONDITION) {
    g = Math.pow((g + LINEAR_FIX) / (1 + LINEAR_FIX), LINEAR_EXP);
  } else {
    g = (g / LINEAR_COEF);
  }
  if (b > CONDITION) {
    b = Math.pow((b + LINEAR_FIX) / (1 + LINEAR_FIX), LINEAR_EXP);
  } else {
    b = (b / LINEAR_COEF);
  }
  return [r, g, b, a];
};

/**
 * hex to hsl
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [h, s, l, a] h: 0..360 s|l: 0..100 a: 0..1
 */
export const hexToHsl = async value => {
  const [rr, gg, bb, a] = await hexToRgb(value);
  const r = parseFloat(rr) / NUM_MAX;
  const g = parseFloat(gg) / NUM_MAX;
  const b = parseFloat(bb) / NUM_MAX;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = (max === min && (max === 1 || max === 0))
    ? 0
    : d / (1 - Math.abs(max + min - 1));
  const l = (max + min) * HALF;
  let h = 0;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d;
        break;
      case g:
        h = (b - r) / d + DOUBLE;
        break;
      case b:
      default:
        h = (r - g) / d + DOUBLE * DOUBLE;
        break;
    }
    h = h * INTERVAL % DEG;
    if (h < 0) {
      h += DEG;
    }
  }
  return [
    h,
    s * PCT_MAX,
    l * PCT_MAX,
    a
  ];
};

/**
 * hex to hwb
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [h, w, b, a] h: 0..360 w|b: 0..100 a: 0..1
 */
export const hexToHwb = async value => {
  const [rr, gg, bb, a] = await hexToRgb(value);
  const r = parseFloat(rr) / NUM_MAX;
  const g = parseFloat(gg) / NUM_MAX;
  const b = parseFloat(bb) / NUM_MAX;
  const [h] = await hexToHsl(value);
  const w = Math.min(r, g, b);
  const bk = 1 - Math.max(r, g, b);
  return [
    h,
    w * PCT_MAX,
    bk * PCT_MAX,
    a
  ];
};

/**
 * parse rgb()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const parseRgb = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`rgba?\\(\\s*((?:${REG_RGB}|${REG_RGB_LV3}))\\s*\\)`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [r, g, b, a] = val.replace(/[,/]/g, ' ').split(/\s+/);
  if (r.startsWith('.')) {
    r = `0${r}`;
  }
  if (r.endsWith('%')) {
    r = parseFloat(r) * NUM_MAX / PCT_MAX;
  } else {
    r = parseFloat(r);
  }
  if (g.startsWith('.')) {
    g = `0${g}`;
  }
  if (g.endsWith('%')) {
    g = parseFloat(g) * NUM_MAX / PCT_MAX;
  } else {
    g = parseFloat(g);
  }
  if (b.startsWith('.')) {
    b = `0${b}`;
  }
  if (b.endsWith('%')) {
    b = parseFloat(b) * NUM_MAX / PCT_MAX;
  } else {
    b = parseFloat(b);
  }
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / PCT_MAX;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  return [
    Math.min(Math.max(r, 0), NUM_MAX),
    Math.min(Math.max(g, 0), NUM_MAX),
    Math.min(Math.max(b, 0), NUM_MAX),
    a
  ];
};

/**
 * parse hsl()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const parseHsl = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg =
    new RegExp(`hsla?\\(\\s*((?:${REG_HSL_HWB}|${REG_HSL_LV3}))\\s*\\)`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [h, s, l, a] = val.replace(/[,/]/g, ' ').split(/\s+/);
  h = await angleToDeg(h);
  if (s.startsWith('.')) {
    s = `0${s}`;
  }
  s = Math.min(Math.max(parseFloat(s), 0), PCT_MAX);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  l = Math.min(Math.max(parseFloat(l), 0), PCT_MAX);
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / PCT_MAX;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  let max, min;
  if (l < PCT_MAX * HALF) {
    max = (l + l * (s / PCT_MAX)) * NUM_MAX / PCT_MAX;
    min = (l - l * (s / PCT_MAX)) * NUM_MAX / PCT_MAX;
  } else {
    max = (l + (PCT_MAX - l) * (s / PCT_MAX)) * NUM_MAX / PCT_MAX;
    min = (l - (PCT_MAX - l) * (s / PCT_MAX)) * NUM_MAX / PCT_MAX;
  }
  const factor = (max - min) / INTERVAL;
  let r, g, b;
  // < 60
  if (h >= 0 && h < INTERVAL) {
    r = max;
    g = h * factor + min;
    b = min;
  // < 120
  } else if (h < INTERVAL * DOUBLE) {
    r = (INTERVAL * DOUBLE - h) * factor + min;
    g = max;
    b = min;
  // < 180
  } else if (h < DEG * HALF) {
    r = min;
    g = max;
    b = (h - INTERVAL * DOUBLE) * factor + min;
  // < 240
  } else if (h < INTERVAL * DOUBLE * DOUBLE) {
    r = min;
    g = (INTERVAL * DOUBLE * DOUBLE - h) * factor + min;
    b = max;
  // < 300
  } else if (h < DEG - INTERVAL) {
    r = (h - (INTERVAL * DOUBLE * DOUBLE)) * factor + min;
    g = min;
    b = max;
  // < 360
  } else if (h < DEG) {
    r = max;
    g = min;
    b = (DEG - h) * factor + min;
  }
  return [
    Math.min(Math.max(r, 0), NUM_MAX),
    Math.min(Math.max(g, 0), NUM_MAX),
    Math.min(Math.max(b, 0), NUM_MAX),
    a
  ];
};

/**
 * parse hwb()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const parseHwb = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`hwb\\(\\s*(${REG_HSL_HWB})\\s*\\)`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [h, w, b, a] = val.replace('/', ' ').split(/\s+/);
  h = await angleToDeg(h);
  if (w.startsWith('.')) {
    w = `0${w}`;
  }
  w = Math.min(Math.max(parseFloat(w), 0), PCT_MAX) / PCT_MAX;
  if (b.startsWith('.')) {
    b = `0${b}`;
  }
  b = Math.min(Math.max(parseFloat(b), 0), PCT_MAX) / PCT_MAX;
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / PCT_MAX;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  const arr = [];
  if (w + b >= 1) {
    const v = (w / (w + b)) * NUM_MAX;
    arr.push(v, v, v, a);
  } else {
    const [rr, gg, bb] = await parseHsl(`hsl(${h} 100% 50%)`);
    const factor = (1 - w - b) / NUM_MAX;
    arr.push(
      (rr * factor + w) * NUM_MAX,
      (gg * factor + w) * NUM_MAX,
      (bb * factor + w) * NUM_MAX,
      a
    );
  }
  return arr;
};

/**
 * convert linear rgb to hex
 *
 * @param {Array} rgb - [r, g, b, a] r|g|b|a: 0..1
 * @returns {string} - hex
 */
export const convertLinearRgbToHex = async rgb => {
  if (!Array.isArray(rgb)) {
    throw new TypeError(`Expected Array but got ${getType(rgb)}.`);
  }
  let [r, g, b, a] = rgb;
  if (typeof r !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(r)}.`);
  } else if (Number.isNaN(r)) {
    throw new Error(`${r} is not a number.`);
  } else if (r < 0 || r > 1) {
    throw new RangeError(`${r} is not between 0 and 1.`);
  }
  if (typeof g !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(g)}.`);
  } else if (Number.isNaN(g)) {
    throw new Error(`${g} is not a number.`);
  } else if (g < 0 || g > 1) {
    throw new RangeError(`${g} is not between 0 and 1.`);
  }
  if (typeof b !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(b)}.`);
  } else if (Number.isNaN(b)) {
    throw new Error(`${b} is not a number.`);
  } else if (b < 0 || b > 1) {
    throw new RangeError(`${b} is not between 0 and 1.`);
  }
  if (typeof a !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(a)}.`);
  } else if (Number.isNaN(a)) {
    throw new Error(`${a} is not a number.`);
  } else if (a < 0 || a > 1) {
    throw new RangeError(`${a} is not between 0 and 1.`);
  }
  const CONDITION = 809 / 258400;
  if (r > CONDITION) {
    r = Math.pow(r, 1 / LINEAR_EXP) * (1 + LINEAR_FIX) - LINEAR_FIX;
  } else {
    r *= LINEAR_COEF;
  }
  if (g > CONDITION) {
    g = Math.pow(g, 1 / LINEAR_EXP) * (1 + LINEAR_FIX) - LINEAR_FIX;
  } else {
    g *= LINEAR_COEF;
  }
  if (b > CONDITION) {
    b = Math.pow(b, 1 / LINEAR_EXP) * (1 + LINEAR_FIX) - LINEAR_FIX;
  } else {
    b *= LINEAR_COEF;
  }
  const [rr, gg, bb, aa] = await Promise.all([
    numberToHexString(r * NUM_MAX),
    numberToHexString(g * NUM_MAX),
    numberToHexString(b * NUM_MAX),
    numberToHexString(a * NUM_MAX)
  ]);
  let hex;
  if (aa === 'ff') {
    hex = `#${rr}${gg}${bb}`;
  } else {
    hex = `#${rr}${gg}${bb}${aa}`;
  }
  return hex;
};

/**
 * convert color to hex
 * NOTE: convertColorToHex('transparent') resolves as null
 *       convertColorToHex('transparent', true) resolves as #00000000
 *       convertColorToHex('currentColor') warns not supported, resolves as null
 *       'color()', 'lab()', 'oklab()', 'lch()', 'oklch()' are not yet supported
 *
 * @param {string} value - value
 * @param {boolean} alpha - add alpha channel value
 * @returns {?string} - hex
 */
export const convertColorToHex = async (value, alpha = false) => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  let hex;
  value = value.toLowerCase().trim();
  // named-color
  if (/^[a-z]+$/.test(value)) {
    if (Object.prototype.hasOwnProperty.call(colorname, value)) {
      hex = colorname[value];
    } else if (value === 'transparent' && alpha) {
      hex = '#00000000';
    } else if (/currentcolor/.test(value)) {
      await logWarn('currentcolor keyword is not supported.');
    }
  // hex-color
  } else if (value.startsWith('#')) {
    if (/^#[\da-f]{6}$/.test(value)) {
      hex = value;
    } else if (/^#[\da-f]{8}$/.test(value)) {
      if (alpha) {
        hex = value;
      } else {
        const [, r, g, b] =
          value.match(/^#([\da-f][\da-f])([\da-f][\da-f])([\da-f][\da-f])/);
        hex = `#${r}${g}${b}`;
      }
    } else if (/^#[\da-f]{4}$/i.test(value)) {
      const [, r, g, b, a] =
        value.match(/^#([\da-f])([\da-f])([\da-f])([\da-f])$/);
      hex = alpha
        ? `#${r}${r}${g}${g}${b}${b}${a}${a}`
        : `#${r}${r}${g}${g}${b}${b}`;
    } else if (/^#[\da-f]{3}$/i.test(value)) {
      const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/);
      hex = `#${r}${r}${g}${g}${b}${b}`;
    }
  } else {
    let r, g, b, a;
    // rgb()
    if (value.startsWith('rgb')) {
      [r, g, b, a] = await parseRgb(value);
    // hsl()
    } else if (value.startsWith('hsl')) {
      [r, g, b, a] = await parseHsl(value);
    // hwb()
    } else if (value.startsWith('hwb')) {
      [r, g, b, a] = await parseHwb(value);
    }
    if (typeof r === 'number' && !Number.isNaN(r) &&
        typeof g === 'number' && !Number.isNaN(g) &&
        typeof b === 'number' && !Number.isNaN(b) &&
        typeof a === 'number' && !Number.isNaN(a)) {
      const [rr, gg, bb, aa] = await Promise.all([
        numberToHexString(r),
        numberToHexString(g),
        numberToHexString(b),
        numberToHexString(a * NUM_MAX)
      ]);
      if (!alpha || aa === 'ff') {
        hex = `#${rr}${gg}${bb}`;
      } else {
        hex = `#${rr}${gg}${bb}${aa}`;
      }
    }
  }
  return hex || null;
};

/**
 * convert color-mix() to hex
 * NOTE: 'lab', 'oklab', 'lch', 'oklch', 'xyz', 'xyz-d50', 'xyz-d65',
 *       'srgb-linear' colorspaces are not yet supported
 *
 * @param {string} value - value
 * @returns {?string} - hex
 */
export const convertColorMixToHex = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`color-mix\\(\\s*${REG_COLOR_MIX}\\s*\\)`, 'i');
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, colorSpace, colorPartA, colorPartB] = value.match(reg);
  const pctReg = new RegExp(`\\s+(${REG_PCT})$`);
  let colorA, pctA, colorB, pctB;
  if (colorPartA.endsWith('%')) {
    [, pctA] = colorPartA.match(pctReg);
    colorA = colorPartA.replace(new RegExp(`${pctA}$`), '').trim();
  } else {
    colorA = colorPartA;
  }
  if (colorPartB.endsWith('%')) {
    [, pctB] = colorPartB.match(pctReg);
    colorB = colorPartB.replace(new RegExp(`${pctB}$`), '').trim();
  } else {
    colorB = colorPartB;
  }
  // normalize percentages and set multipler
  let pA, pB, multipler;
  if (pctA && pctB) {
    const p1 = parseFloat(pctA) / PCT_MAX;
    const p2 = parseFloat(pctB) / PCT_MAX;
    if (p1 < 0 || p1 > 1) {
      throw new RangeError(`${pctA} is not between 0% and 100%.`);
    }
    if (p2 < 0 || p2 > 1) {
      throw new RangeError(`${pctB} is not between 0% and 100%.`);
    }
    const factor = p1 + p2;
    if (factor === 0) {
      throw new Error(`Invalid property value: ${value}`);
    }
    pA = p1 / factor;
    pB = p2 / factor;
    multipler = factor < 1 ? factor : 1;
  } else {
    if (pctA) {
      pA = parseFloat(pctA) / PCT_MAX;
      if (pA < 0 || pA > 1) {
        throw new RangeError(`${pctA} is not between 0% and 100%.`);
      }
      pB = 1 - pA;
    } else if (pctB) {
      pB = parseFloat(pctB) / PCT_MAX;
      if (pB < 0 || pB > 1) {
        throw new RangeError(`${pctB} is not between 0% and 100%.`);
      }
      pA = 1 - pB;
    } else {
      pA = HALF;
      pB = HALF;
    }
    multipler = 1;
  }
  const colorAHex = await convertColorToHex(colorA, true);
  const colorBHex = await convertColorToHex(colorB, true);
  let hex;
  // in srgb
  if (colorAHex && colorBHex && colorSpace === 'srgb') {
    const [rA, gA, bA, aA] = await hexToRgb(colorAHex);
    const [rB, gB, bB, aB] = await hexToRgb(colorBHex);
    const factorA = aA * pA;
    const factorB = aB * pB;
    const a = (factorA + factorB);
    const factor = PCT_MAX / (a * NUM_MAX);
    const r = (rA * factorA + rB * factorB) * factor;
    const g = (gA * factorA + gB * factorB) * factor;
    const b = (bA * factorA + bB * factorB) * factor;
    const rgb = `rgb(${r}% ${g}% ${b}% / ${a * multipler})`;
    hex = await convertColorToHex(rgb, true);
  // in hsl
  } else if (colorAHex && colorBHex && colorSpace === 'hsl') {
    const [hA, sA, lA, aA] = await hexToHsl(colorAHex);
    const [hB, sB, lB, aB] = await hexToHsl(colorBHex);
    const factorA = aA * pA;
    const factorB = aB * pB;
    const a = (factorA + factorB);
    const h = (hA * pA + hB * pB) % DEG;
    const s = (sA * factorA + sB * factorB) / a;
    const l = (lA * factorA + lB * factorB) / a;
    const hsl = `hsl(${h} ${s}% ${l}% / ${a * multipler})`;
    hex = await convertColorToHex(hsl, true);
  // in hwb
  } else if (colorAHex && colorBHex && colorSpace === 'hwb') {
    const [hA, wA, bA, aA] = await hexToHwb(colorAHex);
    const [hB, wB, bB, aB] = await hexToHwb(colorBHex);
    const factorA = aA * pA;
    const factorB = aB * pB;
    const a = (factorA + factorB);
    const h = (hA * pA + hB * pB) % DEG;
    const w = (wA * factorA + wB * factorB) / a;
    const b = (bA * factorA + bB * factorB) / a;
    const hwb = `hwb(${h} ${w}% ${b}% / ${a * multipler})`;
    hex = await convertColorToHex(hwb, true);
  // in srgb-linear
  } else if (colorAHex && colorBHex && colorSpace === 'srgb-linear') {
    const [rA, gA, bA, aA] = await hexToLinearRgb(colorAHex);
    const [rB, gB, bB, aB] = await hexToLinearRgb(colorBHex);
    const factorA = aA * pA;
    const factorB = aB * pB;
    const a = (factorA + factorB);
    const r = (rA * factorA + rB * factorB) * a;
    const g = (gA * factorA + gB * factorB) * a;
    const b = (bA * factorA + bB * factorB) * a;
    hex = await convertLinearRgbToHex([r, g, b, a * multipler]);
  }
  return hex || null;
};

/**
 * composite two layered colors
 *
 * @param {string} overlay - overlay color
 * @param {string} base - base color
 * @returns {?string} - hex
 */
export const compositeLayeredColors = async (overlay, base) => {
  const overlayHex = await convertColorToHex(overlay, true);
  const baseHex = await convertColorToHex(base, true);
  let hex;
  if (overlayHex && baseHex) {
    const [overlayR, overlayG, overlayB, overlayA] = await hexToRgb(overlayHex);
    const [baseR, baseG, baseB, baseA] = await hexToRgb(baseHex);
    const alpha = 1 - (1 - overlayA) * (1 - baseA);
    if (overlayA === 1) {
      hex = overlayHex;
    } else if (overlayA === 0) {
      hex = baseHex;
    } else if (alpha) {
      const overlayAlpha = overlayA / alpha;
      const baseAlpha = baseA * (1 - overlayA) / alpha;
      const [r, g, b, a] = await Promise.all([
        numberToHexString(baseR * baseAlpha + overlayR * overlayAlpha),
        numberToHexString(baseG * baseAlpha + overlayG * overlayAlpha),
        numberToHexString(baseB * baseAlpha + overlayB * overlayAlpha),
        numberToHexString(alpha * NUM_MAX)
      ]);
      if (a === 'ff') {
        hex = `#${r}${g}${b}`;
      } else {
        hex = `#${r}${g}${b}${a}`;
      }
    }
  }
  return hex || null;
};

/**
 * get color in hexadecimal color syntax
 *
 * @param {string} value - value
 * @param {object} opt - options
 * @returns {Array|?string} - hex
 */
export const getColorInHex = async (value, opt = {}) => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const { alpha, prop } = opt;
  let hex;
  if (value.startsWith('color-mix')) {
    hex = await convertColorMixToHex(value);
  } else {
    hex = await convertColorToHex(value, !!alpha);
  }
  return prop ? [prop, hex] : (hex || null);
};
