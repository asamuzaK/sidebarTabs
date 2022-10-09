/**
 * color.js
 * NOTE: "currentColor" keyword is not supported
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
const REG_ANGLE = 'deg|g?rad|turn';
const REG_NUM = '-?(?:(?:0|[1-9]\\d*)(?:\\.\\d*)?|\\.\\d+)';
const REG_PCT = `${REG_NUM}%`;
const REG_HSL_HWB = `${REG_NUM}(?:${REG_ANGLE})?\\s+${REG_PCT}\\s+${REG_PCT}(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_HSL_LV3 = `${REG_NUM}(?:${REG_ANGLE})?\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT}(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB = `(?:${REG_NUM}\\s+${REG_NUM}\\s+${REG_NUM}|${REG_PCT}\\s+${REG_PCT}\\s+${REG_PCT})(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB_LV3 = `(?:${REG_NUM}\\s*,\\s*${REG_NUM}\\s*,\\s*${REG_NUM}|${REG_PCT}\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT})(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_COLORSPACE = '((?:ok)?l(?:ab|ch)|h(?:sl|wb)|srgb(?:-linear)?|xyz(?:-d(?:50|65))?)';
const REG_COLOR = `(?:[a-z]+|#(?:[\\da-f]{3}|[\\da-f]{4}|[\\da-f]{6}|[\\da-f]{8})|hsla?\\(\\s*(?:${REG_HSL_HWB}|${REG_HSL_LV3})\\s*\\)|rgba?\\(\\s*(?:${REG_RGB}|${REG_RGB_LV3})\\s*\\))`;
const REG_COLOR_MIX_PART = `${REG_COLOR}(?:\\s+${REG_PCT})?`;
const REG_COLOR_MIX = `in\\s+${REG_COLORSPACE}\\s*,\\s*(${REG_COLOR_MIX_PART})\\s*,\\s*(${REG_COLOR_MIX_PART})`;

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
 * convert angle to deg
 *
 * @param {string} angle - angle
 * @returns {number} - deg
 */
export const convertAngleToDeg = async angle => {
  if (!isString(angle)) {
    throw new TypeError(`Expected String but got ${getType(angle)}.`);
  }
  const reg = new RegExp(`^(${REG_NUM})(${REG_ANGLE})?$`);
  let deg;
  if (reg.test(angle)) {
    const [, val, unit] = angle.match(reg);
    const value = val.startsWith('.') ? `0${val}` : val;
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
  }
  if (typeof deg === 'number' && !Number.isNaN(deg)) {
    deg %= DEG;
    if (deg < 0) {
      deg += DEG;
    }
  } else {
    deg = Number.NaN;
  }
  return deg;
};

/**
 * parse hsl()
 *
 * @param {string} value - value
 * @returns {Array} - [r, g, b, a]
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
  h = await convertAngleToDeg(h);
  if (s.startsWith('.')) {
    s = `0${s}`;
  }
  s = Math.min(PCT_MAX, Math.max(parseFloat(s), 0));
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  l = Math.min(PCT_MAX, Math.max(parseFloat(l), 0));
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
  if (!(Number.isNaN(Number(h)) || Number.isNaN(Number(s)) ||
        Number.isNaN(Number(l)) || Number.isNaN(Number(a)))) {
    let max, min, r, g, b;
    if (l < PCT_MAX * HALF) {
      max = NUM_MAX / PCT_MAX * (l + l * (s / PCT_MAX));
      min = NUM_MAX / PCT_MAX * (l - l * (s / PCT_MAX));
    } else {
      max = NUM_MAX / PCT_MAX * (l + (PCT_MAX - l) * (s / PCT_MAX));
      min = NUM_MAX / PCT_MAX * (l - (PCT_MAX - l) * (s / PCT_MAX));
    }
    // < 60
    if (h >= 0 && h < INTERVAL) {
      r = max;
      g = h / INTERVAL * (max - min) + min;
      b = min;
    // < 120
    } else if (h < INTERVAL * DOUBLE) {
      r = (INTERVAL * DOUBLE - h) / INTERVAL * (max - min) + min;
      g = max;
      b = min;
    // < 180
    } else if (h < DEG * HALF) {
      r = min;
      g = max;
      b = (h - INTERVAL * DOUBLE) / INTERVAL * (max - min) + min;
    // < 240
    } else if (h < DEG * HALF + INTERVAL) {
      r = min;
      g = (DEG * HALF + INTERVAL - h) / INTERVAL * (max - min) + min;
      b = max;
    // < 300
    } else if (h < DEG - INTERVAL) {
      r = (h - INTERVAL - DEG * HALF) / INTERVAL * (max - min) + min;
      g = min;
      b = max;
    // < 360
    } else if (h < DEG) {
      r = max;
      g = min;
      b = (DEG - h) / INTERVAL * (max - min) + min;
    }
    arr.push(
      Math.min(NUM_MAX, Math.max(r, 0)),
      Math.min(NUM_MAX, Math.max(g, 0)),
      Math.min(NUM_MAX, Math.max(b, 0)),
      Math.min(1, Math.max(a, 0))
    );
  }
  return arr;
};

/**
 * parse hwb()
 *
 * @param {string} value - value
 * @returns {Array} - [r, g, b, a]
 */
export const parseHwb = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg =
    new RegExp(`hwb\\(\\s*(${REG_HSL_HWB})\\s*\\)`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [h, w, b, a] = val.replace('/', ' ').split(/\s+/);
  h = await convertAngleToDeg(h);
  if (w.startsWith('.')) {
    w = `0${w}`;
  }
  w = Math.min(PCT_MAX, Math.max(parseFloat(w), 0)) / PCT_MAX;
  if (b.startsWith('.')) {
    b = `0${b}`;
  }
  b = Math.min(PCT_MAX, Math.max(parseFloat(b), 0)) / PCT_MAX;
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
  if (!(Number.isNaN(Number(h)) || Number.isNaN(Number(w)) ||
        Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
    if (w + b >= 1) {
      const v = (w / (w + b)) * NUM_MAX;
      arr.push(v, v, v, a);
      console.log(arr);
    } else {
      let [rr, gg, bb] = await parseHsl(`hsl(${h} 100% 50%)`);
      rr = (rr / NUM_MAX * (1 - w - b) + w) * NUM_MAX;
      gg = (gg / NUM_MAX * (1 - w - b) + w) * NUM_MAX;
      bb = (bb / NUM_MAX * (1 - w - b) + w) * NUM_MAX;
      arr.push(rr, gg, bb, a);
      console.log(arr);
    }
  }
  return arr;
};

/**
 * parse rgb()
 *
 * @param {string} value - value
 * @returns {Array} - [r, g, b, a]
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
  const arr = [
    Math.min(NUM_MAX, Math.max(r, 0)),
    Math.min(NUM_MAX, Math.max(g, 0)),
    Math.min(NUM_MAX, Math.max(b, 0)),
    Math.min(1, Math.max(a, 0))
  ];
  return arr;
};

/**
 * parse hex-color
 *
 * @param {string} value - value
 * @returns {Array} - [r, g, b, a]
 */
export const parseHex = async value => {
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
 * number to hex string
 *
 * @param {number} value - value
 * @returns {string} - hex
 */
export const numberToHexString = async value => {
  if (Number.isNaN(Number(value))) {
    throw new TypeError(`${getType(value)} is not a Number.`);
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
 * convert color to hex
 * NOTE: convertColorToHex('transparent') resolves null
 *       convertColorToHex('transparent', true) resolves #00000000
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
  if (/^[a-z]+$/i.test(value)) {
    if (/currentcolor/.test(value)) {
      logWarn('currentcolor keyword is not supported.');
    } else if (Object.prototype.hasOwnProperty.call(colorname, value)) {
      hex = colorname[value];
    } else if (value === 'transparent' && alpha) {
      hex = '#00000000';
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
  // rgb()
  } else if (value.startsWith('rgb')) {
    const [r, g, b, a] = await parseRgb(value);
    if (!(Number.isNaN(Number(r)) || Number.isNaN(Number(g)) ||
          Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
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
  // hsl()
  } else if (value.startsWith('hsl')) {
    const [r, g, b, a] = await parseHsl(value);
    if (!(Number.isNaN(Number(r)) || Number.isNaN(Number(g)) ||
          Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
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
  // hwb()
  } else if (value.startsWith('hwb')) {
    const [r, g, b, a] = await parseHwb(value);
    if (!(Number.isNaN(Number(r)) || Number.isNaN(Number(g)) ||
          Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
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
  // normalize percentage and set multipler
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
    if (p1 + p2 === 0) {
      throw new Error(`Invalid property value: ${value}`);
    }
    pA = p1 / (p1 + p2);
    pB = p2 / (p1 + p2);
    multipler = p1 + p2 < 1 ? p1 + p2 : 1;
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
  let hex;
  // srgb
  if (colorSpace === 'srgb') {
    const [rA, gA, bA, aA] =
      await convertColorToHex(colorA, true).then(parseHex);
    const [rB, gB, bB, aB] =
      await convertColorToHex(colorB, true).then(parseHex);
    const a = aA * pA + aB * pB;
    const r = (rA * aA * pA / NUM_MAX + rB * aB * pB / NUM_MAX) * PCT_MAX / a;
    const g = (gA * aA * pA / NUM_MAX + gB * aB * pB / NUM_MAX) * PCT_MAX / a;
    const b = (bA * aA * pA / NUM_MAX + bB * aB * pB / NUM_MAX) * PCT_MAX / a;
    const rgb = `rgb(${r}% ${g}% ${b}% / ${a * multipler})`;
    hex = await convertColorToHex(rgb, true);
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
  if (!isString(overlay)) {
    throw new TypeError(`Expected String but got ${getType(overlay)}.`);
  }
  if (!isString(base)) {
    throw new TypeError(`Expected String but got ${getType(base)}.`);
  }
  const overlayHex = await convertColorToHex(overlay, true);
  const baseHex = await convertColorToHex(base, true);
  let hex;
  if (overlayHex && baseHex) {
    const [overlayR, overlayG, overlayB, overlayA] = await parseHex(overlayHex);
    const [baseR, baseG, baseB, baseA] = await parseHex(baseHex);
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
