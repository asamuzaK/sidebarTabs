/**
 * color.js
 *
 * Ref: CSS Color Module Level 4
 *      §17. Sample code for Color Conversions
 *      https://w3c.github.io/csswg-drafts/css-color-4/#color-conversion-code
 *
 * NOTE: 'currentColor' keyword is not supported
 * TODO: 'none' keyword is not yet supported
 */

/* shared */
import { getType, isString, logWarn } from './common.js';

/* constants */
const HALF = 0.5;
const DOUBLE = 2;
const TRIPLE = 3;
const QUAD = 4;
const DEC = 10;
const HEX = 16;
const DEG = 360;
const DEG_INTERVAL = 60;
const MAX_PCT = 100;
const MAX_RGB = 255;
const POW_SQUARE = 2;
const POW_CUBE = 3;
const POW_LINEAR = 2.4;
const LINEAR_COEF = 12.92;
const LINEAR_OFFSET = 0.055;
const LAB_L = 116;
const LAB_A = 500;
const LAB_B = 200;
const LAB_EPSILON = 216 / 24389;
const LAB_KAPPA = 24389 / 27;

/* white points */
const D50 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
const D65 = [0.3127 / 0.3290, 1, (1 - 0.3127 - 0.3290) / 0.3290];
const MATRIX_D50_TO_D65 = [
  [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
  [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
  [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
];
const MATRIX_D65_TO_D50 = [
  [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
  [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
  [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
];

/* color spaces */
const MATRIX_RGB_TO_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270]
];
const MATRIX_XYZ_TO_RGB = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667]
];
const MATRIX_XYZ_TO_LMS = [
  [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
  [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
  [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
];
const MATRIX_LMS_TO_XYZ = [
  [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
  [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
  [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
];
const MATRIX_OKLAB_TO_LMS = [
  [0.9999999984505196, 0.39633779217376774, 0.2158037580607588],
  [1.0000000088817607, -0.10556134232365633, -0.0638541747717059],
  [1.0000000546724108, -0.08948418209496574, -1.2914855378640917]
];
const MATRIX_LMS_TO_OKLAB = [
  [0.2104542553, 0.7936177850, -0.0040720468],
  [1.9779984951, -2.4285922050, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.8086757660]
];
const MATRIX_P3_TO_XYZ = [
  [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
  [35783 / 156275, 247089 / 357200, 198249 / 2500400],
  [0, 32229 / 714400, 5220557 / 5000800]
];
const MATRIX_REC2020_TO_XYZ = [
  [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314],
  [26158966 / 99577255, 472592308 / 697040785, 8267143 / 139408157],
  [0, 19567812 / 697040785, 295819943 / 278816314]
];
const MATRIX_A98_TO_XYZ = [
  [573536 / 994567, 263643 / 1420810, 187206 / 994567],
  [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
  [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835]
];
const MATRIX_PROPHOTO_TO_XYZ_D50 = [
  [0.7977604896723027, 0.13518583717574031, 0.0313493495815248],
  [0.2880711282292934, 0.7118432178101014, 0.00008565396060525902],
  [0, 0, 0.8251046025104601]
];

/* regexp */
const REG_ANGLE = 'deg|g?rad|turn';
const REG_COLOR_SPACE_COLOR_MIX =
  '(?:ok)?l(?:ab|ch)|h(?:sl|wb)|srgb(?:-linear)?|xyz(?:-d(?:50|65))?';
const REG_COLOR_SPACE_RGB =
  '(?:a98|prophoto)-rgb|display-p3|rec2020|srgb(?:-linear)?';
const REG_COLOR_SPACE_XYZ = 'xyz(?:-d(?:50|65))?';
const REG_NUM =
  '-?(?:(?:0|[1-9]\\d*)(?:\\.\\d*)?|\\.\\d+)(?:[Ee]-?(?:(?:0|[1-9]\\d*)))?';
const REG_PCT = `${REG_NUM}%`;
const REG_HSL_HWB = `${REG_NUM}(?:${REG_ANGLE})?(?:\\s+${REG_PCT}){2}(?:\\s*\\/\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_HSL_LV3 = `${REG_NUM}(?:${REG_ANGLE})?(?:\\s*,\\s*${REG_PCT}){2}(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB = `(?:${REG_NUM}(?:\\s+${REG_NUM}){2}|${REG_PCT}(?:\\s+${REG_PCT}){2})(?:\\s*\\/\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB_LV3 = `(?:${REG_NUM}(?:\\s*,\\s*${REG_NUM}){2}|${REG_PCT}(?:\\s*,\\s*${REG_PCT}){2})(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_LAB = `(?:${REG_NUM}|${REG_PCT})(?:\\s+(?:${REG_NUM}|${REG_PCT})){2}(?:\\s*\\/\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_LCH = `(?:(?:${REG_NUM}|${REG_PCT})\\s+){2}${REG_NUM}(?:${REG_ANGLE})?(?:\\s*\\/\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_COLOR_FUNC = `(?:${REG_COLOR_SPACE_RGB}|${REG_COLOR_SPACE_XYZ})(?:\\s+(?:${REG_NUM}|${REG_PCT})){3}(?:\\s*\\/\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_COLOR_TYPE = `[a-z]+|#(?:[\\da-f]{3}|[\\da-f]{4}|[\\da-f]{6}|[\\da-f]{8})|hsla?\\(\\s*(?:${REG_HSL_HWB}|${REG_HSL_LV3})\\s*\\)|hwb\\(\\s*${REG_HSL_HWB}\\s*\\)|rgba?\\(\\s*(?:${REG_RGB}|${REG_RGB_LV3})\\s*\\)|(?:ok)?lab\\(\\s*${REG_LAB}\\s*\\)|(?:ok)?lch\\(\\s*${REG_LCH}\\s*\\)|color\\(\\s*${REG_COLOR_FUNC}\\s*\\)`;
const REG_COLOR_MIX_PART = `(?:${REG_COLOR_TYPE})(?:\\s+${REG_PCT})?`;
const REG_COLOR_MIX_CAPT = `color-mix\\(\\s*in\\s+(${REG_COLOR_SPACE_COLOR_MIX})\\s*,\\s*(${REG_COLOR_MIX_PART})\\s*,\\s*(${REG_COLOR_MIX_PART})\\s*\\)`;

/* named colors */
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
 * transform matrix
 *
 * @param {Array.<Array.<number>>} mtx - 3 * 3 matrix
 * @param {Array.<number>} vct - vector
 * @returns {Array.<number>} - [p1, p2, p3]
 */
export const transformMatrix = async (mtx, vct) => {
  if (!Array.isArray(mtx)) {
    throw new TypeError(`Expected Array but got ${getType(mtx)}.`);
  } else if (mtx.length !== TRIPLE) {
    throw new Error(`Expected array length of 3 but got ${mtx.length}.`);
  } else {
    for (const i of mtx) {
      if (!Array.isArray(i)) {
        throw new TypeError(`Expected Array but got ${getType(i)}.`);
      } else if (i.length !== TRIPLE) {
        throw new Error(`Expected array length of 3 but got ${i.length}.`);
      } else {
        for (const j of i) {
          if (typeof j !== 'number') {
            throw new TypeError(`Expected Number but got ${getType(j)}.`);
          } else if (Number.isNaN(j)) {
            throw new TypeError(`${j} is not a number.`);
          }
        }
      }
    }
  }
  if (!Array.isArray(vct)) {
    throw new TypeError(`Expected Array but got ${getType(vct)}.`);
  } else if (vct.length !== TRIPLE) {
    throw new Error(`Expected array length of 3 but got ${vct.length}.`);
  } else {
    for (const i of vct) {
      if (typeof i !== 'number') {
        throw new TypeError(`Expected Number but got ${getType(i)}.`);
      } else if (Number.isNaN(i)) {
        throw new TypeError(`${i} is not a number.`);
      }
    }
  }
  const [
    [r1c1, r1c2, r1c3],
    [r2c1, r2c2, r2c3],
    [r3c1, r3c2, r3c3]
  ] = mtx;
  const [v1, v2, v3] = vct;
  const p1 = r1c1 * v1 + r1c2 * v2 + r1c3 * v3;
  const p2 = r2c1 * v1 + r2c2 * v2 + r2c3 * v3;
  const p3 = r3c1 * v1 + r3c2 * v2 + r3c3 * v3;
  return [p1, p2, p3];
};

/**
 * number to hex string
 *
 * @param {number} value - value
 * @returns {string} - hex string
 */
export const numberToHexString = async value => {
  if (typeof value !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(value)}.`);
  } else if (Number.isNaN(value)) {
    throw new TypeError(`${value} is not a number.`);
  } else {
    value = Math.round(value);
    if (value < 0 || value > MAX_RGB) {
      throw new RangeError(`${value} is not between 0 and ${MAX_RGB}.`);
    }
  }
  let hex = value.toString(HEX);
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
  if (isString(angle)) {
    angle = angle.trim();
  } else {
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
      deg = parseFloat(value) * DEG / (MAX_PCT * QUAD);
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
 * rgb to linear rgb
 *
 * @param {Array.<number>} rgb - [r, g, b] r|g|b: 0..1
 * @returns {Array.<number>} - [r, g, b] r|g|b: 0..1
 */
export const rgbToLinearRgb = async rgb => {
  if (!Array.isArray(rgb)) {
    throw new TypeError(`Expected Array but got ${getType(rgb)}.`);
  }
  let [r, g, b] = rgb;
  if (typeof r !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(r)}.`);
  } else if (Number.isNaN(r)) {
    throw new TypeError(`${r} is not a number.`);
  } else if (r < 0 || r > 1) {
    throw new RangeError(`${r} is not between 0 and 1.`);
  }
  if (typeof g !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(g)}.`);
  } else if (Number.isNaN(g)) {
    throw new TypeError(`${g} is not a number.`);
  } else if (g < 0 || g > 1) {
    throw new RangeError(`${g} is not between 0 and 1.`);
  }
  if (typeof b !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(b)}.`);
  } else if (Number.isNaN(b)) {
    throw new TypeError(`${b} is not a number.`);
  } else if (b < 0 || b > 1) {
    throw new RangeError(`${b} is not between 0 and 1.`);
  }
  const COND_POW = 0.04045;
  if (r > COND_POW) {
    r = Math.pow((r + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  } else {
    r = (r / LINEAR_COEF);
  }
  if (g > COND_POW) {
    g = Math.pow((g + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  } else {
    g = (g / LINEAR_COEF);
  }
  if (b > COND_POW) {
    b = Math.pow((b + LINEAR_OFFSET) / (1 + LINEAR_OFFSET), POW_LINEAR);
  } else {
    b = (b / LINEAR_COEF);
  }
  return [r, g, b];
};

/**
 * hex to rgb
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const hexToRgb = async value => {
  if (isString(value)) {
    value = value.toLowerCase().trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  if (!(/^#[\da-f]{6}$/.test(value) || /^#[\da-f]{3}$/.test(value) ||
        /^#[\da-f]{8}$/.test(value) || /^#[\da-f]{4}$/.test(value))) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const arr = [];
  if (/^#[\da-f]{6}$/.test(value)) {
    const [, r, g, b] = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/);
    arr.push(
      parseInt(r, HEX),
      parseInt(g, HEX),
      parseInt(b, HEX),
      1
    );
  } else if (/^#[\da-f]{3}$/.test(value)) {
    const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/);
    arr.push(
      parseInt(`${r}${r}`, HEX),
      parseInt(`${g}${g}`, HEX),
      parseInt(`${b}${b}`, HEX),
      1
    );
  } else if (/^#[\da-f]{8}$/.test(value)) {
    const [, r, g, b, a] =
      value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})$/);
    arr.push(
      parseInt(r, HEX),
      parseInt(g, HEX),
      parseInt(b, HEX),
      parseInt(a, HEX) / MAX_RGB
    );
  } else if (/^#[\da-f]{4}$/.test(value)) {
    const [, r, g, b, a] =
      value.match(/^#([\da-f])([\da-f])([\da-f])([\da-f])$/);
    arr.push(
      parseInt(`${r}${r}`, HEX),
      parseInt(`${g}${g}`, HEX),
      parseInt(`${b}${b}`, HEX),
      parseInt(`${a}${a}`, HEX) / MAX_RGB
    );
  }
  return arr;
};

/**
 * hex to hsl
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [h, s, l, a] h: 0..360 s|l: 0..100 a: 0..1
 */
export const hexToHsl = async value => {
  const [rr, gg, bb, a] = await hexToRgb(value);
  const r = parseFloat(rr) / MAX_RGB;
  const g = parseFloat(gg) / MAX_RGB;
  const b = parseFloat(bb) / MAX_RGB;
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
        h = (r - g) / d + QUAD;
        break;
    }
    h = h * DEG_INTERVAL % DEG;
    if (h < 0) {
      h += DEG;
    }
  }
  return [
    h,
    s * MAX_PCT,
    l * MAX_PCT,
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
  const r = parseFloat(rr) / MAX_RGB;
  const g = parseFloat(gg) / MAX_RGB;
  const b = parseFloat(bb) / MAX_RGB;
  const [h] = await hexToHsl(value);
  const w = Math.min(r, g, b);
  const bk = 1 - Math.max(r, g, b);
  return [
    h,
    w * MAX_PCT,
    bk * MAX_PCT,
    a
  ];
};

/**
 * hex to linear rgb
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b|a: 0..1
 */
export const hexToLinearRgb = async value => {
  const [rr, gg, bb, a] = await hexToRgb(value);
  const [r, g, b] = await rgbToLinearRgb([
    rr / MAX_RGB,
    gg / MAX_RGB,
    bb / MAX_RGB
  ]);
  return [r, g, b, a];
};

/**
 * hex to xyz
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const hexToXyz = async value => {
  const [r, g, b, a] = await hexToLinearRgb(value);
  const [x, y, z] = await transformMatrix(MATRIX_RGB_TO_XYZ, [r, g, b]);
  return [x, y, z, a];
};

/**
 * hex to xyz D50
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const hexToXyzD50 = async value => {
  const [r, g, b, a] = await hexToLinearRgb(value);
  const xyz = await transformMatrix(MATRIX_RGB_TO_XYZ, [r, g, b]);
  const [x, y, z] = await transformMatrix(MATRIX_D65_TO_D50, xyz);
  return [x, y, z, a];
};

/**
 * hex to lab
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [l, a, b, aa]
 *                             l: 0..100 a|b: around -160..160 aa: 0..1
 */
export const hexToLab = async value => {
  const [x, y, z, aa] = await hexToXyzD50(value);
  const xyz = [x, y, z].map((val, i) => val / D50[i]);
  const [f0, f1, f2] = xyz.map(val => val > LAB_EPSILON
    ? Math.cbrt(val)
    : (val * LAB_KAPPA + HEX) / LAB_L
  );
  return [
    (LAB_L * f1) - HEX,
    (f0 - f1) * LAB_A,
    (f1 - f2) * LAB_B,
    aa
  ];
};

/**
 * hex to lch
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [l, c, h, a]
 *                             l: 0..100 c: around 0..230 h: 0..360 a: 0..1
 */
export const hexToLch = async value => {
  const [l, a, b, aa] = await hexToLab(value);
  let c, h;
  // l = 100 should always be white
  // https://github.com/web-platform-tests/wpt/blob/master/css/css-color/lch-009.html
  if (parseFloat(l.toFixed(1)) === 100) {
    c = 0;
    h = 0;
  } else {
    c = Math.sqrt(Math.pow(a, POW_SQUARE) + Math.pow(b, POW_SQUARE));
    h = Math.atan2(b, a) * DEG * HALF / Math.PI;
    if (h < 0) {
      h += DEG;
    }
  }
  return [l, c, h, aa];
};

/**
 * hex to oklab
 *
 * @param {string} value - value
 * @param {boolean} asis - leave value as is
 * @returns {Array.<number>} - [l, a, b, aa] l|aa: 0..1 a|b: around -0.5..0.5
 */
export const hexToOklab = async (value, asis = false) => {
  const [xx, yy, zz, aa] = await hexToXyz(value);
  let x, y, z;
  if (asis) {
    x = xx;
    y = yy;
    z = zz;
  } else {
    [x, y, z] = [xx, yy, zz].map((val, i) => val * D65[i]);
  }
  const lms = await transformMatrix(MATRIX_XYZ_TO_LMS, [x, y, z]);
  const xyzLms = lms.map(c => Math.cbrt(c));
  const [l, a, b] = await transformMatrix(MATRIX_LMS_TO_OKLAB, xyzLms);
  return [l, a, b, aa];
};

/**
 * hex to oklch
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [l, a, b, aa]
 *                             l|aa: 0..1 c: around 0..0.5 h: 0..360
 */
export const hexToOklch = async value => {
  const [ll, a, b, aa] = await hexToOklab(value, true);
  let l, c, h;
  if (parseFloat(ll.toFixed(1)) === 1) {
    l = 1;
    c = 0;
    h = 0;
  } else {
    l = ll;
    c = Math.sqrt(Math.pow(a, POW_SQUARE) + Math.pow(b, POW_SQUARE));
    h = Math.atan2(b, a) * DEG * HALF / Math.PI;
    if (h < 0) {
      h += DEG;
    }
  }
  return [l, c, h, aa];
};

/**
 * parse rgb()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [r, g, b, a] r|g|b: 0..255 a: 0..1
 */
export const parseRgb = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg =
    new RegExp(`^rgba?\\(\\s*((?:${REG_RGB}|${REG_RGB_LV3}))\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [r, g, b, a] = val.replace(/[,/]/g, ' ').split(/\s+/);
  if (r.startsWith('.')) {
    r = `0${r}`;
  }
  if (r.endsWith('%')) {
    r = parseFloat(r) * MAX_RGB / MAX_PCT;
  } else {
    r = parseFloat(r);
  }
  if (g.startsWith('.')) {
    g = `0${g}`;
  }
  if (g.endsWith('%')) {
    g = parseFloat(g) * MAX_RGB / MAX_PCT;
  } else {
    g = parseFloat(g);
  }
  if (b.startsWith('.')) {
    b = `0${b}`;
  }
  if (b.endsWith('%')) {
    b = parseFloat(b) * MAX_RGB / MAX_PCT;
  } else {
    b = parseFloat(b);
  }
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / MAX_PCT;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  return [
    Math.min(Math.max(r, 0), MAX_RGB),
    Math.min(Math.max(g, 0), MAX_RGB),
    Math.min(Math.max(b, 0), MAX_RGB),
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
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg =
    new RegExp(`^hsla?\\(\\s*((?:${REG_HSL_HWB}|${REG_HSL_LV3}))\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [h, s, l, a] = val.replace(/[,/]/g, ' ').split(/\s+/);
  h = await angleToDeg(h);
  if (s.startsWith('.')) {
    s = `0${s}`;
  }
  s = Math.min(Math.max(parseFloat(s), 0), MAX_PCT);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  l = Math.min(Math.max(parseFloat(l), 0), MAX_PCT);
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / MAX_PCT;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  let max, min;
  if (l < MAX_PCT * HALF) {
    max = (l + l * (s / MAX_PCT)) * MAX_RGB / MAX_PCT;
    min = (l - l * (s / MAX_PCT)) * MAX_RGB / MAX_PCT;
  } else {
    max = (l + (MAX_PCT - l) * (s / MAX_PCT)) * MAX_RGB / MAX_PCT;
    min = (l - (MAX_PCT - l) * (s / MAX_PCT)) * MAX_RGB / MAX_PCT;
  }
  const factor = (max - min) / DEG_INTERVAL;
  let r, g, b;
  // < 60
  if (h >= 0 && h < DEG_INTERVAL) {
    r = max;
    g = h * factor + min;
    b = min;
  // < 120
  } else if (h < DEG_INTERVAL * DOUBLE) {
    r = (DEG_INTERVAL * DOUBLE - h) * factor + min;
    g = max;
    b = min;
  // < 180
  } else if (h < DEG * HALF) {
    r = min;
    g = max;
    b = (h - DEG_INTERVAL * DOUBLE) * factor + min;
  // < 240
  } else if (h < DEG_INTERVAL * QUAD) {
    r = min;
    g = (DEG_INTERVAL * QUAD - h) * factor + min;
    b = max;
  // < 300
  } else if (h < DEG - DEG_INTERVAL) {
    r = (h - (DEG_INTERVAL * QUAD)) * factor + min;
    g = min;
    b = max;
  // < 360
  } else if (h < DEG) {
    r = max;
    g = min;
    b = (DEG - h) * factor + min;
  }
  return [
    Math.min(Math.max(r, 0), MAX_RGB),
    Math.min(Math.max(g, 0), MAX_RGB),
    Math.min(Math.max(b, 0), MAX_RGB),
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
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^hwb\\(\\s*(${REG_HSL_HWB})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  let [h, w, b, a] = val.replace('/', ' ').split(/\s+/);
  h = await angleToDeg(h);
  if (w.startsWith('.')) {
    w = `0${w}`;
  }
  w = Math.min(Math.max(parseFloat(w), 0), MAX_PCT) / MAX_PCT;
  if (b.startsWith('.')) {
    b = `0${b}`;
  }
  b = Math.min(Math.max(parseFloat(b), 0), MAX_PCT) / MAX_PCT;
  if (isString(a)) {
    if (a.startsWith('.')) {
      a = `0${a}`;
    }
    if (a.endsWith('%')) {
      a = parseFloat(a) / MAX_PCT;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  const arr = [];
  if (w + b >= 1) {
    const v = (w / (w + b)) * MAX_RGB;
    arr.push(v, v, v, a);
  } else {
    const [rr, gg, bb] = await parseHsl(`hsl(${h} 100% 50%)`);
    const factor = (1 - w - b) / MAX_RGB;
    arr.push(
      (rr * factor + w) * MAX_RGB,
      (gg * factor + w) * MAX_RGB,
      (bb * factor + w) * MAX_RGB,
      a
    );
  }
  return arr;
};

/**
 + parse lab()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const parseLab = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^lab\\(\\s*(${REG_LAB})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const COEF_PCT = 1.25;
  const COND_POW = 8;
  const [, val] = value.match(reg);
  let [l, a, b, aa] = val.replace('/', ' ').split(/\s+/);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  l = parseFloat(l);
  if (l < 0) {
    l = 0;
  }
  if (a.startsWith('.')) {
    a = `0${a}`;
  }
  if (a.endsWith('%')) {
    a = parseFloat(a) * COEF_PCT;
  } else {
    a = parseFloat(a);
  }
  if (b.endsWith('%')) {
    b = parseFloat(b) * COEF_PCT;
  } else {
    b = parseFloat(b);
  }
  if (isString(aa)) {
    if (aa.startsWith('.')) {
      aa = `0${aa}`;
    }
    if (aa.endsWith('%')) {
      aa = parseFloat(aa) / MAX_PCT;
    } else {
      aa = parseFloat(aa);
    }
  } else {
    aa = 1;
  }
  const fl = (l + HEX) / LAB_L;
  const fa = (a / LAB_A + fl);
  const fb = (fl - b / LAB_B);
  const powFl = Math.pow(fl, POW_CUBE);
  const powFa = Math.pow(fa, POW_CUBE);
  const powFb = Math.pow(fb, POW_CUBE);
  const xyz = [
    powFa > LAB_EPSILON ? powFa : (fa * LAB_L - HEX) / LAB_KAPPA,
    l > COND_POW ? powFl : l / LAB_KAPPA,
    powFb > LAB_EPSILON ? powFb : (fb * LAB_L - HEX) / LAB_KAPPA
  ];
  const [x, y, z] = xyz.map((val, i) => val * D50[i]);
  return [x, y, z, aa];
};

/**
 + parse lch()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const parseLch = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^lch\\(\\s*(${REG_LCH})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const COEF_PCT = 1.5;
  const [, val] = value.match(reg);
  let [l, c, h, aa] = val.replace('/', ' ').split(/\s+/);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  l = parseFloat(l);
  if (l < 0) {
    l = 0;
  }
  if (c.startsWith('.')) {
    c = `0${c}`;
  }
  if (c.endsWith('%')) {
    c = parseFloat(c) * COEF_PCT;
  } else {
    c = parseFloat(c);
  }
  h = await angleToDeg(h);
  if (isString(aa)) {
    if (aa.startsWith('.')) {
      aa = `0${aa}`;
    }
    if (aa.endsWith('%')) {
      aa = parseFloat(aa) / MAX_PCT;
    } else {
      aa = parseFloat(aa);
    }
  } else {
    aa = 1;
  }
  const a = c * Math.cos(h * Math.PI / (DEG * HALF));
  const b = c * Math.sin(h * Math.PI / (DEG * HALF));
  const [x, y, z] = await parseLab(`lab(${l} ${a} ${b})`);
  return [x, y, z, aa];
};

/**
 + parse oklab()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const parseOklab = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^oklab\\(\\s*(${REG_LAB})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const COEF_PCT = 0.4;
  const [, val] = value.match(reg);
  let [l, a, b, aa] = val.replace('/', ' ').split(/\s+/);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  if (l.endsWith('%')) {
    l = parseFloat(l) / MAX_PCT;
  } else {
    l = parseFloat(l);
  }
  if (l < 0) {
    l = 0;
  }
  if (a.startsWith('.')) {
    a = `0${a}`;
  }
  if (a.endsWith('%')) {
    a = parseFloat(a) * COEF_PCT / MAX_PCT;
  } else {
    a = parseFloat(a);
  }
  if (b.endsWith('%')) {
    b = parseFloat(b) * COEF_PCT / MAX_PCT;
  } else {
    b = parseFloat(b);
  }
  if (isString(aa)) {
    if (aa.startsWith('.')) {
      aa = `0${aa}`;
    }
    if (aa.endsWith('%')) {
      aa = parseFloat(aa) / MAX_PCT;
    } else {
      aa = parseFloat(aa);
    }
  } else {
    aa = 1;
  }
  const lms = await transformMatrix(MATRIX_OKLAB_TO_LMS, [l, a, b]);
  const xyzLms = lms.map(c => Math.pow(c, POW_CUBE));
  const xyz = await transformMatrix(MATRIX_LMS_TO_XYZ, xyzLms);
  const [x, y, z] = xyz.map((val, i) => val / D65[i]);
  return [x, y, z, aa];
};

/**
 + parse oklab()
 *
 * @param {string} value - value
 * @returns {Array.<number>} - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 */
export const parseOklch = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^oklch\\(\\s*(${REG_LAB})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const COEF_PCT = 0.4;
  const [, val] = value.match(reg);
  let [l, c, h, aa] = val.replace('/', ' ').split(/\s+/);
  if (l.startsWith('.')) {
    l = `0${l}`;
  }
  if (l.endsWith('%')) {
    l = parseFloat(l) / MAX_PCT;
  } else {
    l = parseFloat(l);
  }
  if (l < 0) {
    l = 0;
  }
  if (parseFloat(l.toFixed(1)) === 1) {
    l = 1;
    c = 0;
    h = 0;
  } else {
    if (c.startsWith('.')) {
      c = `0${c}`;
    }
    if (c.endsWith('%')) {
      c = parseFloat(c) * COEF_PCT / MAX_PCT;
    } else {
      c = parseFloat(c);
    }
    if (c < 0) {
      c = 0;
    }
    h = await angleToDeg(h);
  }
  if (isString(aa)) {
    if (aa.startsWith('.')) {
      aa = `0${aa}`;
    }
    if (aa.endsWith('%')) {
      aa = parseFloat(aa) / MAX_PCT;
    } else {
      aa = parseFloat(aa);
    }
  } else {
    aa = 1;
  }
  const a = c * Math.cos(h * Math.PI / (DEG * HALF));
  const b = c * Math.sin(h * Math.PI / (DEG * HALF));
  const lms = await transformMatrix(MATRIX_OKLAB_TO_LMS, [l, a, b]);
  const xyzLms = lms.map(c => Math.pow(c, POW_CUBE));
  const [x, y, z] = await transformMatrix(MATRIX_LMS_TO_XYZ, xyzLms);
  return [x, y, z, aa];
};

/**
 * convert rgb to hex color
 *
 * @param {Array.<number>} rgb - [r, g, b, a] r|g|b: 0..255 a: 0..1|undefined
 * @returns {string} - hex color;
 */
export const convertRgbToHex = async rgb => {
  if (!Array.isArray(rgb)) {
    throw new TypeError(`Expected Array but got ${getType(rgb)}.`);
  }
  let [r, g, b, a] = rgb;
  if (typeof r !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(r)}.`);
  } else if (Number.isNaN(r)) {
    throw new TypeError(`${r} is not a number.`);
  } else if (r < 0 || r > MAX_RGB) {
    throw new RangeError(`${r} is not between 0 and ${MAX_RGB}.`);
  }
  if (typeof g !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(g)}.`);
  } else if (Number.isNaN(g)) {
    throw new TypeError(`${g} is not a number.`);
  } else if (g < 0 || g > MAX_RGB) {
    throw new RangeError(`${g} is not between 0 and ${MAX_RGB}.`);
  }
  if (typeof b !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(b)}.`);
  } else if (Number.isNaN(b)) {
    throw new TypeError(`${b} is not a number.`);
  } else if (b < 0 || b > MAX_RGB) {
    throw new RangeError(`${b} is not between 0 and ${MAX_RGB}.`);
  }
  a ??= 1;
  if (typeof a !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(a)}.`);
  } else if (Number.isNaN(a)) {
    throw new TypeError(`${a} is not a number.`);
  } else if (a < 0 || a > 1) {
    throw new RangeError(`${a} is not between 0 and 1.`);
  }
  const [rr, gg, bb, aa] = await Promise.all([
    numberToHexString(r),
    numberToHexString(g),
    numberToHexString(b),
    numberToHexString(a * MAX_RGB)
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
 * convert linear rgb to hex color
 *
 * @param {Array} rgb - [r, g, b, a] r|g|b|a: 0..1
 * @returns {string} - hex color
 */
export const convertLinearRgbToHex = async rgb => {
  if (!Array.isArray(rgb)) {
    throw new TypeError(`Expected Array but got ${getType(rgb)}.`);
  }
  let [r, g, b, a] = rgb;
  if (typeof r !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(r)}.`);
  } else if (Number.isNaN(r)) {
    throw new TypeError(`${r} is not a number.`);
  } else if (r < 0 || r > 1) {
    throw new RangeError(`${r} is not between 0 and 1.`);
  }
  if (typeof g !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(g)}.`);
  } else if (Number.isNaN(g)) {
    throw new TypeError(`${g} is not a number.`);
  } else if (g < 0 || g > 1) {
    throw new RangeError(`${g} is not between 0 and 1.`);
  }
  if (typeof b !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(b)}.`);
  } else if (Number.isNaN(b)) {
    throw new TypeError(`${b} is not a number.`);
  } else if (b < 0 || b > 1) {
    throw new RangeError(`${b} is not between 0 and 1.`);
  }
  if (typeof a !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(a)}.`);
  } else if (Number.isNaN(a)) {
    throw new TypeError(`${a} is not a number.`);
  } else if (a < 0 || a > 1) {
    throw new RangeError(`${a} is not between 0 and 1.`);
  }
  const COND_POW = 809 / 258400;
  if (r > COND_POW) {
    r = Math.pow(r, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  } else {
    r *= LINEAR_COEF;
  }
  if (g > COND_POW) {
    g = Math.pow(g, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  } else {
    g *= LINEAR_COEF;
  }
  if (b > COND_POW) {
    b = Math.pow(b, 1 / POW_LINEAR) * (1 + LINEAR_OFFSET) - LINEAR_OFFSET;
  } else {
    b *= LINEAR_COEF;
  }
  const [rr, gg, bb, aa] = await Promise.all([
    numberToHexString(r * MAX_RGB),
    numberToHexString(g * MAX_RGB),
    numberToHexString(b * MAX_RGB),
    numberToHexString(a * MAX_RGB)
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
 * convert xyz to hex color
 *
 * @param {Array} xyz - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 * @returns {string} - hex color
 */
export const convertXyzToHex = async xyz => {
  if (!Array.isArray(xyz)) {
    throw new TypeError(`Expected Array but got ${getType(xyz)}.`);
  }
  const [x, y, z, a] = xyz;
  if (typeof x !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(x)}.`);
  } else if (Number.isNaN(x)) {
    throw new TypeError(`${x} is not a number.`);
  }
  if (typeof y !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(y)}.`);
  } else if (Number.isNaN(y)) {
    throw new TypeError(`${y} is not a number.`);
  }
  if (typeof z !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(z)}.`);
  } else if (Number.isNaN(z)) {
    throw new TypeError(`${z} is not a number.`);
  }
  if (typeof a !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(a)}.`);
  } else if (Number.isNaN(a)) {
    throw new TypeError(`${a} is not a number.`);
  } else if (a < 0 || a > 1) {
    throw new RangeError(`${a} is not between 0 and 1.`);
  }
  const [r, g, b] = await transformMatrix(MATRIX_XYZ_TO_RGB, [x, y, z]);
  const hex = await convertLinearRgbToHex([
    Math.min(Math.max(r, 0), 1),
    Math.min(Math.max(g, 0), 1),
    Math.min(Math.max(b, 0), 1),
    a
  ]);
  return hex;
};

/**
 * convert xyz D50 to hex color
 *
 * @param {Array} xyz - [x, y, z, a] x|y|z: around 0..1 a: 0..1
 * @returns {string} - hex color
 */
export const convertXyzD50ToHex = async xyz => {
  if (!Array.isArray(xyz)) {
    throw new TypeError(`Expected Array but got ${getType(xyz)}.`);
  }
  const [x, y, z, a] = xyz;
  if (typeof x !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(x)}.`);
  } else if (Number.isNaN(x)) {
    throw new TypeError(`${x} is not a number.`);
  }
  if (typeof y !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(y)}.`);
  } else if (Number.isNaN(y)) {
    throw new TypeError(`${y} is not a number.`);
  }
  if (typeof z !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(z)}.`);
  } else if (Number.isNaN(z)) {
    throw new TypeError(`${z} is not a number.`);
  }
  if (typeof a !== 'number') {
    throw new TypeError(`Expected Number but got ${getType(a)}.`);
  } else if (Number.isNaN(a)) {
    throw new TypeError(`${a} is not a number.`);
  } else if (a < 0 || a > 1) {
    throw new RangeError(`${a} is not between 0 and 1.`);
  }
  const xyzD65 = await transformMatrix(MATRIX_D50_TO_D65, [x, y, z]);
  const [r, g, b] = await transformMatrix(MATRIX_XYZ_TO_RGB, xyzD65);
  const hex = await convertLinearRgbToHex([
    Math.min(Math.max(r, 0), 1),
    Math.min(Math.max(g, 0), 1),
    Math.min(Math.max(b, 0), 1),
    a
  ]);
  return hex;
};

/**
 * convert color to hex color
 * NOTE: convertColorToHex('transparent') resolves as null
 *       convertColorToHex('transparent', true) resolves as #00000000
 *       convertColorToHex('currentColor') warns not supported, resolves as null
 *
 * @param {string} value - value
 * @param {boolean} alpha - add alpha channel value
 * @returns {?string} - hex color
 */
export const convertColorToHex = async (value, alpha = false) => {
  if (isString(value)) {
    value = value.toLowerCase().trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  let hex;
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
    } else if (/^#[\da-f]{3}$/.test(value)) {
      const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/);
      hex = `#${r}${r}${g}${g}${b}${b}`;
    } else if (/^#[\da-f]{8}$/.test(value)) {
      if (alpha) {
        hex = value;
      } else {
        const [, r, g, b] =
          value.match(/^#([\da-f][\da-f])([\da-f][\da-f])([\da-f][\da-f])/);
        hex = `#${r}${g}${b}`;
      }
    } else if (/^#[\da-f]{4}$/.test(value)) {
      const [, r, g, b, a] =
        value.match(/^#([\da-f])([\da-f])([\da-f])([\da-f])$/);
      hex = alpha
        ? `#${r}${r}${g}${g}${b}${b}${a}${a}`
        : `#${r}${r}${g}${g}${b}${b}`;
    }
  // lab()
  } else if (value.startsWith('lab')) {
    hex = await parseLab(value).then(convertXyzD50ToHex);
  // lch()
  } else if (value.startsWith('lch')) {
    hex = await parseLch(value).then(convertXyzD50ToHex);
  // oklab()
  } else if (value.startsWith('oklab')) {
    hex = await parseOklab(value).then(convertXyzToHex);
  // oklch()
  } else if (value.startsWith('oklch')) {
    hex = await parseOklch(value).then(convertXyzToHex);
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
      if (alpha) {
        hex = await convertRgbToHex([r, g, b, a]);
      } else {
        hex = await convertRgbToHex([r, g, b]);
      }
    }
  }
  return hex || null;
};

/**
 * convert color() to hex color
 *
 * @param {string} value - value
 * @returns {?string} - hex color
 */
export const convertColorFuncToHex = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`^color\\(\\s*(${REG_COLOR_FUNC})\\s*\\)$`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, val] = value.match(reg);
  const [cs, v1, v2, v3, aa] = val.replace('/', ' ').split(/\s+/);
  let a;
  if (isString(aa)) {
    a = aa;
    if (a.endsWith('%')) {
      a = parseFloat(a) / MAX_PCT;
    } else {
      a = parseFloat(a);
    }
  } else {
    a = 1;
  }
  let hex;
  // srgb
  if (cs === 'srgb') {
    const r = v1.endsWith('%') ? v1 : `${parseFloat(v1) * MAX_PCT}%`;
    const g = v2.endsWith('%') ? v2 : `${parseFloat(v2) * MAX_PCT}%`;
    const b = v3.endsWith('%') ? v3 : `${parseFloat(v3) * MAX_PCT}%`;
    const rgb = `rgb(${r} ${g} ${b} / ${a})`;
    hex = await convertColorToHex(rgb, true);
  // srgb-linear
  } else if (cs === 'srgb-linear') {
    const r = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const g = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const b = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    hex = await convertLinearRgbToHex([r, g, b, a]);
  // xyz, xyz-d50, xyz-d65
  } else if (/^xyz(?:-d(?:50|65))?$/.test(cs)) {
    const x = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const y = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const z = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    if (cs === 'xyz-d50') {
      hex = await convertXyzD50ToHex([x, y, z, a]);
    } else {
      hex = await convertXyzToHex([x, y, z, a]);
    }
  // display-p3
  } else if (cs === 'display-p3') {
    const r = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const g = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const b = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    const linearRgb = await rgbToLinearRgb([r, g, b]);
    const [x, y, z] = await transformMatrix(MATRIX_P3_TO_XYZ, linearRgb);
    hex = await convertXyzToHex([x, y, z, a]);
  // rec2020
  } else if (cs === 'rec2020') {
    const ALPHA = 1.09929682680944;
    const BETA = 0.018053968510807;
    const REC_COEF = 0.45;
    const r = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const g = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const b = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    const rgb = [r, g, b].map(c => {
      let cl;
      if (c < BETA * REC_COEF * DEC) {
        cl = c / (REC_COEF * DEC);
      } else {
        cl = Math.pow((c + ALPHA - 1) / ALPHA, 1 / REC_COEF);
      }
      return cl;
    });
    const [x, y, z] = await transformMatrix(MATRIX_REC2020_TO_XYZ, rgb);
    hex = await convertXyzToHex([x, y, z, a]);
  // a98-rgb
  } else if (cs === 'a98-rgb') {
    const POW_A98 = 563 / 256;
    const r = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const g = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const b = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    const rgb = [r, g, b].map(c => {
      const cl = Math.pow(c, POW_A98);
      return cl;
    });
    const [x, y, z] = await transformMatrix(MATRIX_A98_TO_XYZ, rgb);
    hex = await convertXyzToHex([x, y, z, a]);
  // prophoto-rgb
  } else if (cs === 'prophoto-rgb') {
    const POW_PROPHOTO = 1.8;
    const r = v1.endsWith('%') ? parseFloat(v1) / MAX_PCT : parseFloat(v1);
    const g = v2.endsWith('%') ? parseFloat(v2) / MAX_PCT : parseFloat(v2);
    const b = v3.endsWith('%') ? parseFloat(v3) / MAX_PCT : parseFloat(v3);
    const rgb = [r, g, b].map(c => {
      let cl;
      if (c > 1 / (HEX * DOUBLE)) {
        cl = Math.pow(c, POW_PROPHOTO);
      } else {
        cl = c / HEX;
      }
      return cl;
    });
    const [x, y, z] = await transformMatrix(MATRIX_PROPHOTO_TO_XYZ_D50, rgb);
    hex = await convertXyzD50ToHex([x, y, z, a]);
  }
  return hex;
};

/**
 * convert color-mix() to hex color
 *
 * @param {string} value - value
 * @returns {?string} - hex color
 */
export const convertColorMixToHex = async value => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const colorMixReg = new RegExp(`^${REG_COLOR_MIX_CAPT}$`, 'i');
  if (!colorMixReg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const [, colorSpace, colorPartA, colorPartB] = value.match(colorMixReg);
  const colorPartReg =
    new RegExp(`^(${REG_COLOR_TYPE})(?:\\s+(${REG_PCT}))?$`, 'i');
  const [, colorA, pctA] = colorPartA.match(colorPartReg);
  const [, colorB, pctB] = colorPartB.match(colorPartReg);
  let colorAHex, colorBHex;
  if (colorA.startsWith('color(')) {
    colorAHex = await convertColorFuncToHex(colorA);
  } else {
    colorAHex = await convertColorToHex(colorA, true);
  }
  if (colorB.startsWith('color(')) {
    colorBHex = await convertColorFuncToHex(colorB);
  } else {
    colorBHex = await convertColorToHex(colorB, true);
  }
  let hex;
  if (colorAHex && colorBHex) {
    // normalize percentages and set multipler
    let pA, pB, m;
    if (pctA && pctB) {
      const p1 = parseFloat(pctA) / MAX_PCT;
      const p2 = parseFloat(pctB) / MAX_PCT;
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
      m = factor < 1 ? factor : 1;
    } else {
      if (pctA) {
        pA = parseFloat(pctA) / MAX_PCT;
        if (pA < 0 || pA > 1) {
          throw new RangeError(`${pctA} is not between 0% and 100%.`);
        }
        pB = 1 - pA;
      } else if (pctB) {
        pB = parseFloat(pctB) / MAX_PCT;
        if (pB < 0 || pB > 1) {
          throw new RangeError(`${pctB} is not between 0% and 100%.`);
        }
        pA = 1 - pB;
      } else {
        pA = HALF;
        pB = HALF;
      }
      m = 1;
    }
    // in srgb
    if (colorSpace === 'srgb') {
      const [rA, gA, bA, aA] = await hexToRgb(colorAHex);
      const [rB, gB, bB, aB] = await hexToRgb(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const r = (rA * factorA + rB * factorB) / a;
      const g = (gA * factorA + gB * factorB) / a;
      const b = (bA * factorA + bB * factorB) / a;
      hex = await convertRgbToHex([r, g, b, a * m]);
    // in srgb-linear
    } else if (colorSpace === 'srgb-linear') {
      const [rA, gA, bA, aA] = await hexToLinearRgb(colorAHex);
      const [rB, gB, bB, aB] = await hexToLinearRgb(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const r = (rA * factorA + rB * factorB) * a;
      const g = (gA * factorA + gB * factorB) * a;
      const b = (bA * factorA + bB * factorB) * a;
      hex = await convertLinearRgbToHex([r, g, b, a * m]);
    // in xyz, xyz-d65
    } else if (/^xyz(?:-d65)?$/.test(colorSpace)) {
      const [xA, yA, zA, aA] = await hexToXyz(colorAHex);
      const [xB, yB, zB, aB] = await hexToXyz(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const r = (xA * factorA + xB * factorB) * a;
      const g = (yA * factorA + yB * factorB) * a;
      const b = (zA * factorA + zB * factorB) * a;
      hex = await convertXyzToHex([r, g, b, a * m]);
    // in xyz-d50
    } else if (colorSpace === 'xyz-d50') {
      const [xA, yA, zA, aA] = await hexToXyzD50(colorAHex);
      const [xB, yB, zB, aB] = await hexToXyzD50(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const r = (xA * factorA + xB * factorB) * a;
      const g = (yA * factorA + yB * factorB) * a;
      const b = (zA * factorA + zB * factorB) * a;
      hex = await convertXyzD50ToHex([r, g, b, a * m]);
    // in hsl
    } else if (colorSpace === 'hsl') {
      const [hA, sA, lA, aA] = await hexToHsl(colorAHex);
      const [hB, sB, lB, aB] = await hexToHsl(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const h = (hA * pA + hB * pB) % DEG;
      const s = (sA * factorA + sB * factorB) / a;
      const l = (lA * factorA + lB * factorB) / a;
      const hsl = `hsl(${h} ${s}% ${l}% / ${a * m})`;
      hex = await convertColorToHex(hsl, true);
    // in hwb
    } else if (colorSpace === 'hwb') {
      const [hA, wA, bA, aA] = await hexToHwb(colorAHex);
      const [hB, wB, bB, aB] = await hexToHwb(colorBHex);
      const factorA = aA * pA;
      const factorB = aB * pB;
      const a = (factorA + factorB);
      const h = (hA * pA + hB * pB) % DEG;
      const w = (wA * factorA + wB * factorB) / a;
      const b = (bA * factorA + bB * factorB) / a;
      const hwb = `hwb(${h} ${w}% ${b}% / ${a * m})`;
      hex = await convertColorToHex(hwb, true);
    // in lab
    } else if (colorSpace === 'lab') {
      const [lA, aA, bA, aaA] = await hexToLab(colorAHex);
      const [lB, aB, bB, aaB] = await hexToLab(colorBHex);
      const factorA = aaA * pA;
      const factorB = aaB * pB;
      const aa = (factorA + factorB);
      const l = (lA * factorA + lB * factorB) * aa;
      const a = (aA * factorA + aB * factorB) * aa;
      const b = (bA * factorA + bB * factorB) * aa;
      hex = await convertColorToHex(`lab(${l} ${a} ${b} / ${aa * m})`);
    // in lch
    } else if (colorSpace === 'lch') {
      const [lA, cA, hA, aaA] = await hexToLch(colorAHex);
      const [lB, cB, hB, aaB] = await hexToLch(colorBHex);
      const factorA = aaA * pA;
      const factorB = aaB * pB;
      const aa = (factorA + factorB);
      const l = (lA * factorA + lB * factorB) * aa;
      const c = (cA * factorA + cB * factorB) * aa;
      const h = (hA * factorA + hB * factorB) * aa;
      hex = await convertColorToHex(`lch(${l} ${c} ${h} / ${aa * m})`);
    // in oklab
    } else if (colorSpace === 'oklab') {
      const [lA, aA, bA, aaA] = await hexToOklab(colorAHex);
      const [lB, aB, bB, aaB] = await hexToOklab(colorBHex);
      const factorA = aaA * pA;
      const factorB = aaB * pB;
      const aa = (factorA + factorB);
      const l = (lA * factorA + lB * factorB) * aa;
      const a = (aA * factorA + aB * factorB) * aa;
      const b = (bA * factorA + bB * factorB) * aa;
      hex = await convertColorToHex(`oklab(${l} ${a} ${b} / ${aa * m})`);
    // in oklch
    } else if (colorSpace === 'oklch') {
      const [lA, cA, hA, aaA] = await hexToOklch(colorAHex);
      const [lB, cB, hB, aaB] = await hexToOklch(colorBHex);
      const factorA = aaA * pA;
      const factorB = aaB * pB;
      const aa = (factorA + factorB);
      const l = (lA * factorA + lB * factorB) * aa;
      const c = (cA * factorA + cB * factorB) * aa;
      const h = (hA * factorA + hB * factorB) * aa;
      hex = await convertColorToHex(`oklch(${l} ${c} ${h} / ${aa * m})`);
    }
  }
  return hex || null;
};

/**
 * get color in hex color notation
 *
 * @param {string} value - value
 * @param {object} opt - options
 * @returns {?string|Array} - string of hex color or array of [prop, hex] pair
 */
export const getColorInHex = async (value, opt = {}) => {
  if (isString(value)) {
    value = value.trim();
  } else {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const { alpha, prop } = opt;
  let hex;
  if (value.startsWith('color-mix')) {
    hex = await convertColorMixToHex(value);
  } else if (value.startsWith('color(')) {
    hex = await convertColorFuncToHex(value);
  } else {
    hex = await convertColorToHex(value, !!alpha);
  }
  return prop ? [prop, hex] : (hex || null);
};

/**
 * composite two layered colors
 *
 * @param {string} overlay - overlay color
 * @param {string} base - base color
 * @returns {?string} - hex color
 */
export const compositeLayeredColors = async (overlay, base) => {
  const overlayHex = await getColorInHex(overlay, {
    alpha: true
  });
  const baseHex = await await getColorInHex(base, {
    alpha: true
  });
  let hex;
  if (overlayHex && baseHex) {
    const [rO, gO, bO, aO] = await hexToRgb(overlayHex);
    const [rB, gB, bB, aB] = await hexToRgb(baseHex);
    const alpha = 1 - (1 - aO) * (1 - aB);
    if (aO === 1) {
      hex = overlayHex;
    } else if (aO === 0) {
      hex = baseHex;
    } else if (alpha) {
      const alphaO = aO / alpha;
      const alphaB = aB * (1 - aO) / alpha;
      const [r, g, b, a] = await Promise.all([
        numberToHexString(rO * alphaO + rB * alphaB),
        numberToHexString(gO * alphaO + gB * alphaB),
        numberToHexString(bO * alphaO + bB * alphaB),
        numberToHexString(alpha * MAX_RGB)
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
