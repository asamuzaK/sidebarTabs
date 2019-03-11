/**
 * color.js
 */

import {
  getType, isString, throwErr,
} from "./common.js";

/* constants */
const DEG = 360;
const GRAD = 400;
const HEX = 16;
const INTERVAL = 60;
const NUM_MAX = 255;
const PCT_MAX = 100;
const REG_ANGLE = "deg|g?rad|turn";
const REG_NUM = "-?(?:(?:0|[1-9]\\d*)(?:\\.\\d*)?|\\.\\d+)";
const REG_PCT = `${REG_NUM}%`;
const REG_HSL = `${REG_NUM}(?:${REG_ANGLE})?\\s+${REG_PCT}\\s+${REG_PCT}(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_HSL_LV3 = `${REG_NUM}(?:${REG_ANGLE})?\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT}(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB = `(?:${REG_NUM}\\s+${REG_NUM}\\s+${REG_NUM}|${REG_PCT}\\s+${REG_PCT}\\s+${REG_PCT})(?:\\s+\\/\\s+(?:${REG_NUM}|${REG_PCT}))?`;
const REG_RGB_LV3 = `(?:${REG_NUM}\\s*,\\s*${REG_NUM}\\s*,\\s*${REG_NUM}|${REG_PCT}\\s*,\\s*${REG_PCT}\\s*,\\s*${REG_PCT})(?:\\s*,\\s*(?:${REG_NUM}|${REG_PCT}))?`;

export const colorname = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
};

/**
 * convert angle to deg
 * @param {string} angle - angle
 * @returns {number} - deg
 */
export const convertAngleToDeg = async angle => {
  if (!isString(angle)) {
    throw new TypeError(`Expected String but got ${getType(angle)}.`);
  }
  let deg;
  const reg = new RegExp(`^(${REG_NUM})(${REG_ANGLE})?$`);
  if (reg.test(angle)) {
    const [, val, unit] = angle.match(reg);
    let value;
    if (val.startsWith(".")) {
      value = `0${val}`;
    } else {
      value = val;
    }
    switch (unit) {
      case "grad":
        deg = parseFloat(value) * DEG / GRAD;
        break;
      case "rad":
        deg = parseFloat(value) * DEG / (2 * Math.PI);
        break;
      case "turn":
        deg = parseFloat(value) * DEG;
        break;
      default:
        deg = parseFloat(value);
    }
  }
  if (typeof deg === "number" && !Number.isNaN(deg)) {
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
 * @param {string} value - value
 * @returns {Array} - [r, g, b, a]
 */
export const parseHsl = async value => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const reg = new RegExp(`hsla?\\(\\s*((?:${REG_HSL}|${REG_HSL_LV3}))\\s*\\)`);
  if (!reg.test(value)) {
    throw new Error(`Invalid property value: ${value}`);
  }
  const arr = [];
  const [, val] = value.match(reg);
  if (isString(val)) {
    let [h, s, l, a] = val.replace(/[,/]/g, " ").split(/\s+/);
    h = await convertAngleToDeg(h);
    if (s.startsWith(".")) {
      s = `0${s}`;
    }
    s = Math.min(PCT_MAX, Math.max(parseFloat(s), 0));
    if (l.startsWith(".")) {
      l = `0${l}`;
    }
    l = Math.min(PCT_MAX, Math.max(parseFloat(l), 0));
    if (isString(a)) {
      if (a.startsWith(".")) {
        a = `0${a}`;
      }
      if (a.endsWith("%")) {
        a = parseFloat(a) / PCT_MAX;
      } else {
        a = parseFloat(a);
      }
    } else {
      a = 1;
    }
    if (!(Number.isNaN(Number(h)) || Number.isNaN(Number(s)) ||
          Number.isNaN(Number(l)) || Number.isNaN(Number(a)))) {
      let max, min, r, g, b;
      if (l < PCT_MAX / 2) {
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
      } else if (h < 2 * INTERVAL) {
        r = (2 * INTERVAL - h) / INTERVAL * (max - min) + min;
        g = max;
        b = min;
      // < 180
      } else if (h < DEG / 2) {
        r = min;
        g = max;
        b = (h - 2 * INTERVAL) / INTERVAL * (max - min) + min;
      // < 240
      } else if (h < DEG / 2 + INTERVAL) {
        r = min;
        g = (DEG / 2 + INTERVAL - h) / INTERVAL * (max - min) + min;
        b = max;
      // < 300
      } else if (h < DEG - INTERVAL) {
        r = (h - INTERVAL - DEG / 2) / INTERVAL * (max - min) + min;
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
        Math.min(1, Math.max(a, 0)),
      );
    }
  }
  return arr;
};

/**
 * parse rgb()
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
  const arr = [];
  const [, val] = value.match(reg);
  if (isString(val)) {
    let [r, g, b, a] = val.replace(/[,/]/g, " ").split(/\s+/);
    if (r.startsWith(".")) {
      r = `0${r}`;
    }
    if (r.endsWith("%")) {
      r = parseFloat(r) * NUM_MAX / PCT_MAX;
    } else {
      r = parseFloat(r);
    }
    if (g.startsWith(".")) {
      g = `0${g}`;
    }
    if (g.endsWith("%")) {
      g = parseFloat(g) * NUM_MAX / PCT_MAX;
    } else {
      g = parseFloat(g);
    }
    if (b.startsWith(".")) {
      b = `0${b}`;
    }
    if (b.endsWith("%")) {
      b = parseFloat(b) * NUM_MAX / PCT_MAX;
    } else {
      b = parseFloat(b);
    }
    if (isString(a)) {
      if (a.startsWith(".")) {
        a = `0${a}`;
      }
      if (a.endsWith("%")) {
        a = parseFloat(a) / PCT_MAX;
      } else {
        a = parseFloat(a);
      }
    } else {
      a = 1;
    }
    arr.push(
      Math.min(NUM_MAX, Math.max(r, 0)),
      Math.min(NUM_MAX, Math.max(g, 0)),
      Math.min(NUM_MAX, Math.max(b, 0)),
      Math.min(1, Math.max(a, 0)),
    );
  }
  return arr;
};

/**
 * convert color to hex
 * @param {string} value - value
 * @param {boolean} alpha - add alpha channel value
 * @returns {?string} - hex
 */
export const convertColorToHex = async (value, alpha = false) => {
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  let hex;
  value = value.toLowerCase();
  // named-color
  if (/^[a-z]+$/i.test(value)) {
    hex = colorname[value];
  // hex-color
  } else if (value.startsWith("#")) {
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
      if (alpha) {
        hex = `#${r}${r}${g}${g}${b}${b}${a}${a}`;
      } else {
        hex = `#${r}${r}${g}${g}${b}${b}`;
      }
    } else if (/^#[\da-f]{3}$/i.test(value)) {
      const [, r, g, b] = value.match(/^#([\da-f])([\da-f])([\da-f])$/);
      hex = `#${r}${r}${g}${g}${b}${b}`;
    }
  // rgb()
  } else if (value.startsWith("rgb")) {
    let [r, g, b, a] = await parseRgb(value);
    if (!(Number.isNaN(Number(r)) || Number.isNaN(Number(g)) ||
          Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
      r = Math.round(r).toString(HEX);
      g = Math.round(g).toString(HEX);
      b = Math.round(b).toString(HEX);
      a = Math.round(a * NUM_MAX).toString(HEX);
      if (r.length === 1) {
        r = `0${r}`;
      }
      if (g.length === 1) {
        g = `0${g}`;
      }
      if (b.length === 1) {
        b = `0${b}`;
      }
      if (a.length === 1) {
        a = `0${a}`;
      }
      if (alpha) {
        hex = `#${r}${g}${b}${a}`;
      } else {
        hex = `#${r}${g}${b}`;
      }
    }
  // hsl()
  } else if (value.startsWith("hsl")) {
    let [r, g, b, a] = await parseHsl(value);
    if (!(Number.isNaN(Number(r)) || Number.isNaN(Number(g)) ||
          Number.isNaN(Number(b)) || Number.isNaN(Number(a)))) {
      r = Math.round(r).toString(HEX);
      g = Math.round(g).toString(HEX);
      b = Math.round(b).toString(HEX);
      a = Math.round(a * NUM_MAX).toString(HEX);
      if (r.length === 1) {
        r = `0${r}`;
      }
      if (g.length === 1) {
        g = `0${g}`;
      }
      if (b.length === 1) {
        b = `0${b}`;
      }
      if (a.length === 1) {
        a = `0${a}`;
      }
      if (alpha) {
        hex = `#${r}${g}${b}${a}`;
      } else {
        hex = `#${r}${g}${b}`;
      }
    }
  }
  return hex || null;
};
