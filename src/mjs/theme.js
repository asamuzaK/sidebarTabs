/**
 * theme.js
 */

import {
  getType, isObjectNotEmpty, isString,
} from "./common.js";
import {
  getAllStorage, getCurrentTheme, getEnabledTheme, getStorage, removeStorage,
  sendMessage, setStorage,
} from "./browser.js";
import {
  convertColorToHex,
} from "./color.js";

/* constants */
import {
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT, COMPACT, CSS_ID,
  CSS_VAR_BG, CSS_VAR_BG_ACTIVE, CSS_VAR_BG_HOVER, CSS_VAR_BG_SELECT,
  CSS_VAR_BG_SELECT_HOVER, CSS_VAR_BORDER, CSS_VAR_BORDER_ACTIVE,
  CSS_VAR_COLOR, CSS_VAR_COLOR_ACTIVE, CSS_VAR_COLOR_HOVER,
  CSS_VAR_COLOR_SELECT, CSS_VAR_COLOR_SELECT_HOVER,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_SELECT,
  CUSTOM_BG_SELECT_HOVER, CUSTOM_BORDER, CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  THEME, THEME_CURRENT, THEME_CUSTOM, THEME_CUSTOM_SETTING,
  THEME_DARK, THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID, THEME_TAB_COMPACT,
} from "./constant.js";

/* theme map */
export const themeMap = {
  [CSS_ID]: {
    [CUSTOM_BG]: CSS_VAR_BG,
    [CUSTOM_BG_ACTIVE]: CSS_VAR_BG_ACTIVE,
    [CUSTOM_BG_HOVER]: CSS_VAR_BG_HOVER,
    [CUSTOM_BG_SELECT]: CSS_VAR_BG_SELECT,
    [CUSTOM_BG_SELECT_HOVER]: CSS_VAR_BG_SELECT_HOVER,
    [CUSTOM_BORDER]: CSS_VAR_BORDER,
    [CUSTOM_BORDER_ACTIVE]: CSS_VAR_BORDER_ACTIVE,
    [CUSTOM_COLOR]: CSS_VAR_COLOR,
    [CUSTOM_COLOR_ACTIVE]: CSS_VAR_COLOR_ACTIVE,
    [CUSTOM_COLOR_HOVER]: CSS_VAR_COLOR_HOVER,
    [CUSTOM_COLOR_SELECT]: CSS_VAR_COLOR_SELECT,
    [CUSTOM_COLOR_SELECT_HOVER]: CSS_VAR_COLOR_SELECT_HOVER,
  },
  [THEME_LIGHT]: {
    [CUSTOM_BG]: "#ededf0",
    [CUSTOM_BG_ACTIVE]: "#f9f9fa",
    [CUSTOM_BG_HOVER]: "#d7d7db",
    [CUSTOM_BG_SELECT]: "#0a84ff",
    [CUSTOM_BG_SELECT_HOVER]: "#0060df",
    [CUSTOM_BORDER]: "#cccccc",
    [CUSTOM_BORDER_ACTIVE]: "#999999",
    [CUSTOM_COLOR]: "#0c0c0d",
    [CUSTOM_COLOR_ACTIVE]: "#0c0c0d",
    [CUSTOM_COLOR_HOVER]: "#0c0c0d",
    [CUSTOM_COLOR_SELECT]: "#f9f9fa",
    [CUSTOM_COLOR_SELECT_HOVER]: "#f9f9fa",
  },
  [THEME_DARK]: {
    [CUSTOM_BG]: "#0c0c0d",
    [CUSTOM_BG_ACTIVE]: "#38383d",
    [CUSTOM_BG_HOVER]: "#2a2a2e",
    [CUSTOM_BG_SELECT]: "#003eaa",
    [CUSTOM_BG_SELECT_HOVER]: "#0060df",
    [CUSTOM_BORDER]: "#666666",
    [CUSTOM_BORDER_ACTIVE]: "#999999",
    [CUSTOM_COLOR]: "#f9f9fa",
    [CUSTOM_COLOR_ACTIVE]: "#f9f9fa",
    [CUSTOM_COLOR_HOVER]: "#f9f9fa",
    [CUSTOM_COLOR_SELECT]: "#f9f9fa",
    [CUSTOM_COLOR_SELECT_HOVER]: "#f9f9fa",
  },
};

/* current theme colors */
export const currentThemeColors = new Map();

/* current theme */
export const currentTheme = new Map();

/**
 * set current theme colors map
 * @param {string} key - key
 * @param {string} value - value
 * @returns {void}
 */
export const setCurrentThemeColors = async (key, value) => {
  if (!isString(key)) {
    throw new TypeError(`Expected String but got ${getType(key)}.`);
  }
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const hexValue = await convertColorToHex(value);
  if (hexValue) {
    currentThemeColors.set(key, hexValue);
  }
};

/**
 * get current theme base values
 * @returns {Object} - values
 */
export const getCurrentThemeBaseValues = async () => {
  const values = {};
  const baseValues = themeMap[THEME_LIGHT];
  const items = Object.keys(baseValues);
  for (const key of items) {
    switch (key) {
      case CUSTOM_BG: {
        const valueA = currentThemeColors.get("sidebar");
        const valueB = currentThemeColors.get("accentcolor");
        if (valueA || valueB) {
          values[key] = valueA || valueB;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      case CUSTOM_BG_ACTIVE: {
        const valueA = currentThemeColors.get("sidebar_highlight");
        const valueB = currentThemeColors.get("tab_selected");
        const valueC = currentThemeColors.get("toolbar");
        if (valueA || valueB || valueC) {
          values[key] = valueA || valueB || valueC;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      case CUSTOM_BORDER: {
        const valueA = currentThemeColors.get("sidebar_border");
        const valueB = currentThemeColors.get("tab_background_separator");
        if (valueA || valueB) {
          values[key] = valueA || valueB;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      case CUSTOM_BORDER_ACTIVE: {
        const valueA = currentThemeColors.get("sidebar_border");
        const valueB = currentThemeColors.get("toolbar_top_separator");
        const valueC = currentThemeColors.get("toolbar_bottom_separator");
        const valueD = currentThemeColors.get("tab_background_separator");
        if (valueA || valueB || valueC || valueD) {
          values[key] = valueA || valueB || valueC || valueD;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      case CUSTOM_COLOR: {
        const valueA = currentThemeColors.get("sidebar_text");
        const valueB = currentThemeColors.get("textcolor");
        if (valueA || valueB) {
          values[key] = valueA || valueB;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      case CUSTOM_COLOR_ACTIVE: {
        const valueA = currentThemeColors.get("sidebar_highlight_text");
        const valueB = currentThemeColors.get("tab_text");
        const valueC = currentThemeColors.get("toolbar_text");
        const valueD = currentThemeColors.get("textcolor");
        if (valueA || valueB || valueC || valueD) {
          values[key] = valueA || valueB || valueC || valueD;
        } else {
          values[key] = baseValues[key];
        }
        break;
      }
      default:
        values[key] = baseValues[key];
    }
  }
  return values;
};

/**
 * get base value
 * @returns {Object} - values
 */
export const getBaseValues = async () => {
  const appliedTheme = await getCurrentTheme();
  let values;
  if (isObjectNotEmpty(appliedTheme)) {
    const {colors} = appliedTheme;
    if (isObjectNotEmpty(colors)) {
      const colorsItems = Object.entries(colors);
      const func = [];
      for (const [key, value] of colorsItems) {
        if (value) {
          func.push(setCurrentThemeColors(key, value));
        }
      }
      await Promise.all(func);
      values = await getCurrentThemeBaseValues();
    }
  } else {
    const items = await getEnabledTheme();
    if (Array.isArray(items)) {
      for (const item of items) {
        const {id} = item;
        switch (id) {
          case THEME_DARK_ID:
            values = themeMap[THEME_DARK];
            break;
          case THEME_LIGHT_ID:
            values = themeMap[THEME_LIGHT];
            break;
          default:
        }
        if (values) {
          break;
        }
      }
    }
  }
  if (!values) {
    values = themeMap[THEME_LIGHT];
  }
  return values;
};

/**
 * set current theme value
 * @returns {void}
 */
export const setCurrentThemeValue = async () => {
  const values = {};
  const store = await getAllStorage();
  const baseValues = await getBaseValues();
  const items = Object.entries(baseValues);
  for (const [key, val] of items) {
    const {value} = store[key] || {};
    if (value) {
      values[key] = value;
    } else {
      values[key] = val;
    }
  }
  currentTheme.set(THEME_CURRENT, values);
};

/**
 * send current theme values
 * @returns {?AsyncFunction} - sendMessage()
 */
export const sendCurrentTheme = async () => {
  let func;
  const obj = currentTheme.get(THEME_CURRENT);
  if (obj) {
    const msg = {
      [THEME_CUSTOM_SETTING]: obj,
    };
    func = sendMessage(null, msg);
  }
  return func || null;
};

/**
 * update custom theme CSS
 * @param {string} sel - selector
 * @param {string} prop - property
 * @param {string} value - value
 * @returns {void}
 */
export const updateCustomThemeCss = async (sel, prop, value) => {
  if (!isString(sel)) {
    throw new TypeError(`Expected String but got ${getType(sel)}.`);
  }
  const elm = document.getElementById(CSS_ID);
  const customTheme = currentTheme.get(THEME_CURRENT);
  if (elm && elm.sheet && isObjectNotEmpty(customTheme)) {
    const {sheet} = elm;
    const l = sheet.cssRules.length;
    const propKeys = themeMap[CSS_ID];
    const items = Object.entries(customTheme);
    let cssText = "";
    for (const [key, val] of items) {
      if (key === prop && isString(value)) {
        cssText += `${propKeys[key]}: ${value};`;
      } else {
        cssText += `${propKeys[key]}: ${val};`;
      }
    }
    if (l) {
      let i = l - 1, bool;
      while (i >= 0) {
        if (sheet.cssRules[i].selectorText === sel) {
          sheet.cssRules[i].style.cssText = cssText;
          bool = true;
          break;
        }
        i--;
      }
      if (!bool) {
        sheet.insertRule(`${sel} {${cssText}}`, l);
      }
    } else {
      sheet.insertRule(`${sel} {${cssText}}`, l);
    }
  }
};

/**
 * delete custom them CSS rule
 * @param {string} sel - selector
 * @returns {void}
 */
export const deleteCustomThemeCss = async (sel = `.${CLASS_THEME_CUSTOM}`) => {
  const elm = document.getElementById(CSS_ID);
  if (elm && elm.sheet) {
    const {sheet} = elm;
    const l = sheet.cssRules.length;
    if (l) {
      const arr = [];
      let i = 0;
      while (i < l) {
        if (sheet.cssRules[i].selectorText === sel) {
          arr.unshift(i);
        }
        i++;
      }
      if (arr.length) {
        for (const j of arr) {
          sheet.deleteRule(j);
        }
      }
    }
  }
};

/**
 * init custom theme
 * @returns {?AsyncFunction} - sendCurrentTheme()
 */
export const initCustomTheme = async () => {
  const obj = currentTheme.get(THEME_CURRENT);
  const elm = document.getElementById(CSS_ID);
  let func;
  if (elm && obj) {
    const items = Object.keys(obj);
    const arr = [];
    for (const key of items) {
      arr.push(key);
    }
    currentThemeColors.clear();
    currentTheme.clear();
    await removeStorage(arr);
    await deleteCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
    await setCurrentThemeValue();
    await updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
    func = sendCurrentTheme();
  }
  return func || null;
};

/**
 * get theme
 * @returns {Array} - theme class list
 */
export const getTheme = async () => {
  const data = await getStorage(THEME);
  const themes = [];
  if (isObjectNotEmpty(data)) {
    const {theme: storedTheme} = data;
    if (Array.isArray(storedTheme)) {
      for (const item of storedTheme) {
        themes.push(item);
      }
    }
  } else {
    const items = await getEnabledTheme();
    if (Array.isArray(items)) {
      for (const item of items) {
        const {id} = item;
        switch (id) {
          case THEME_DARK_ID:
            themes.push(THEME_DARK);
            break;
          case THEME_LIGHT_ID:
            themes.push(THEME_LIGHT);
            break;
          default:
        }
      }
    }
  }
  if (!themes.length) {
    themes.push(THEME_LIGHT);
  }
  return themes;
};

/**
 * set theme
 * @param {Array} themes - array of theme
 * @returns {void}
 */
export const setTheme = async themes => {
  if (!Array.isArray(themes)) {
    throw new TypeError(`Expected Array but got ${getType(themes)}.`);
  }
  const elm = document.querySelector("body");
  const {classList} = elm;
  for (const item of themes) {
    switch (item) {
      case THEME_CUSTOM: {
        classList.remove(CLASS_THEME_DARK);
        classList.remove(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_CUSTOM);
        break;
      }
      case THEME_DARK: {
        classList.remove(CLASS_THEME_CUSTOM);
        classList.remove(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_DARK);
        break;
      }
      default: {
        classList.remove(CLASS_THEME_CUSTOM);
        classList.remove(CLASS_THEME_DARK);
        classList.add(CLASS_THEME_LIGHT);
      }
    }
  }
  await updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
  await setStorage({
    [THEME]: themes,
  });
};

/* tab height */
/**
 * get tab height
 * @returns {boolean} - result
 */
export const getTabHeight = async () => {
  const data = await getStorage(THEME_TAB_COMPACT);
  let compact;
  if (isObjectNotEmpty(data)) {
    const {checked} = data[THEME_TAB_COMPACT];
    compact = checked;
  }
  return !!compact;
};

/**
 * set tab height
 * @param {boolean} compact - compact
 * @returns {void}
 */
export const setTabHeight = async compact => {
  const elm = document.querySelector("body");
  const {classList} = elm;
  if (compact) {
    classList.add(COMPACT);
  } else {
    classList.remove(COMPACT);
  }
};

/**
 * apply CSS
 * @returns {void}
 */
export const applyCss = async () => {
  const items = document.querySelectorAll("section[hidden]");
  for (const item of items) {
    item.removeAttribute("hidden");
  }
};

/**
 * set sidebar theme
 * @returns {void}
 */
export const setSidebarTheme = async () => Promise.all([
  setCurrentThemeValue().then(getTheme).then(setTheme),
  getTabHeight().then(setTabHeight),
]).then(applyCss);
