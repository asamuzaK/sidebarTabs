/**
 * theme.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import {
  getAllStorage, getCurrentTheme, getEnabledTheme, getStorage, removeStorage,
  sendMessage, setStorage
} from './browser.js';
import { blendColors, convertColorToHex } from './color.js';
import {
  CLASS_COMPACT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT,
  CSS_ID, CSS_VAR_BG, CSS_VAR_BG_ACTIVE, CSS_VAR_BG_DISCARDED,
  CSS_VAR_BG_HOVER, CSS_VAR_BG_HOVER_SHADOW,
  CSS_VAR_BG_SELECT, CSS_VAR_BG_SELECT_HOVER,
  CSS_VAR_BORDER, CSS_VAR_BORDER_ACTIVE, CSS_VAR_BORDER_DISCARDED,
  CSS_VAR_COLOR, CSS_VAR_COLOR_ACTIVE, CSS_VAR_COLOR_DISCARDED,
  CSS_VAR_COLOR_HOVER, CSS_VAR_COLOR_SELECT, CSS_VAR_COLOR_SELECT_HOVER,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED,
  CUSTOM_BG_HOVER, CUSTOM_BG_HOVER_SHADOW,
  CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER, CUSTOM_BORDER_ACTIVE, CUSTOM_BORDER_DISCARDED,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  CUSTOM_COLOR_HOVER, CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  THEME, THEME_CURRENT, THEME_CUSTOM, THEME_CUSTOM_SETTING,
  THEME_DARK, THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID,
  THEME_SCROLLBAR_NARROW, THEME_TAB_COMPACT, THEME_TAB_GROUP_NARROW
} from './constant.js';

/* theme map */
export const themeMap = {
  [CSS_ID]: {
    [CUSTOM_BG]: CSS_VAR_BG,
    [CUSTOM_BG_ACTIVE]: CSS_VAR_BG_ACTIVE,
    [CUSTOM_BG_DISCARDED]: CSS_VAR_BG_DISCARDED,
    [CUSTOM_BG_HOVER]: CSS_VAR_BG_HOVER,
    [CUSTOM_BG_HOVER_SHADOW]: CSS_VAR_BG_HOVER_SHADOW,
    [CUSTOM_BG_SELECT]: CSS_VAR_BG_SELECT,
    [CUSTOM_BG_SELECT_HOVER]: CSS_VAR_BG_SELECT_HOVER,
    [CUSTOM_BORDER]: CSS_VAR_BORDER,
    [CUSTOM_BORDER_ACTIVE]: CSS_VAR_BORDER_ACTIVE,
    [CUSTOM_BORDER_DISCARDED]: CSS_VAR_BORDER_DISCARDED,
    [CUSTOM_COLOR]: CSS_VAR_COLOR,
    [CUSTOM_COLOR_ACTIVE]: CSS_VAR_COLOR_ACTIVE,
    [CUSTOM_COLOR_DISCARDED]: CSS_VAR_COLOR_DISCARDED,
    [CUSTOM_COLOR_HOVER]: CSS_VAR_COLOR_HOVER,
    [CUSTOM_COLOR_SELECT]: CSS_VAR_COLOR_SELECT,
    [CUSTOM_COLOR_SELECT_HOVER]: CSS_VAR_COLOR_SELECT_HOVER
  },
  [THEME_LIGHT]: {
    [CUSTOM_BG]: '#f0f0f4',
    [CUSTOM_BG_ACTIVE]: '#ffffff',
    [CUSTOM_BG_DISCARDED]: '#f0f0f4',
    [CUSTOM_BG_HOVER]: '#dadade',
    [CUSTOM_BG_HOVER_SHADOW]: '#15141a1a',
    [CUSTOM_BG_SELECT]: '#ffffff',
    [CUSTOM_BG_SELECT_HOVER]: '#dadade',
    [CUSTOM_BORDER]: '#f0f0f4', // FIXME: remove later
    [CUSTOM_BORDER_ACTIVE]: '#80808e',
    [CUSTOM_BORDER_DISCARDED]: '#f0f0f4', // FIXME: remove later
    [CUSTOM_COLOR]: '#15141a',
    [CUSTOM_COLOR_ACTIVE]: '#15141a',
    [CUSTOM_COLOR_DISCARDED]: '#15141a',
    [CUSTOM_COLOR_HOVER]: '#15141a',
    [CUSTOM_COLOR_SELECT]: '#15141a',
    [CUSTOM_COLOR_SELECT_HOVER]: '#15141a'
  },
  [THEME_DARK]: {
    [CUSTOM_BG]: '#38383d',
    [CUSTOM_BG_ACTIVE]: '#42414d',
    [CUSTOM_BG_DISCARDED]: '#38383d',
    [CUSTOM_BG_HOVER]: '#4c4c50',
    [CUSTOM_BG_HOVER_SHADOW]: '#fbfbfe1a',
    [CUSTOM_BG_SELECT]: '#42414d',
    [CUSTOM_BG_SELECT_HOVER]: '#4c4c50',
    [CUSTOM_BORDER]: '#f0f0f4', // FIXME: remove later,
    [CUSTOM_BORDER_ACTIVE]: '#38383d', // NOTE: 'transparent',
    [CUSTOM_BORDER_DISCARDED]: '#f0f0f4', // FIXME: remove later,
    [CUSTOM_COLOR]: '#f9f9fa',
    [CUSTOM_COLOR_ACTIVE]: '#fbfbfe',
    [CUSTOM_COLOR_DISCARDED]: '#f9f9fa',
    [CUSTOM_COLOR_HOVER]: '#f9f9fa',
    [CUSTOM_COLOR_SELECT]: '#fbfbfe',
    [CUSTOM_COLOR_SELECT_HOVER]: '#f9f9fa'
  }
};

/* current theme colors */
export const currentThemeColors = new Map();

/* current theme */
export const currentTheme = new Map();

/**
 * set current theme colors map
 *
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
  if (value === 'transparent') {
    currentThemeColors.set(key, 'transparent');
  } else {
    const hexValue = await convertColorToHex(value);
    hexValue && currentThemeColors.set(key, hexValue);
  }
};

/**
 * get current theme base values
 *
 * @returns {object} - values
 */
export const getCurrentThemeBaseValues = async () => {
  const values = {};
  const dark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  const baseValues = (dark && themeMap[THEME_DARK]) || themeMap[THEME_LIGHT];
  const items = Object.keys(baseValues);
  for (const key of items) {
    switch (key) {
      case CUSTOM_BG:
      case CUSTOM_BG_DISCARDED: {
        const valueA = currentThemeColors.get('sidebar');
        const valueB = currentThemeColors.get('frame');
        values[key] = valueA || valueB || baseValues[key];
        break;
      }
      case CUSTOM_BG_ACTIVE: {
        const valueA = currentThemeColors.get('tab_selected');
        values[key] = valueA || baseValues[key];
        break;
      }
      case CUSTOM_BG_HOVER_SHADOW: {
        let valueA = currentThemeColors.get('tab_background_text');
        if (valueA) {
          valueA = await convertColorToHex(valueA);
        }
        values[key] = (valueA && `${valueA}1a`) || baseValues[key];
        break;
      }
      case CUSTOM_BG_SELECT: {
        const valueA = currentThemeColors.has('sidebar_highlight_text') &&
          currentThemeColors.get('sidebar_highlight');
        const valueB = currentThemeColors.get('tab_selected');
        values[key] = valueA || valueB || baseValues[key];
        break;
      }
      case CUSTOM_BORDER:
      case CUSTOM_BORDER_DISCARDED: {
        const valueA = currentThemeColors.get('tab_background_separator');
        values[key] = valueA || baseValues[key];
        break;
      }
      case CUSTOM_BORDER_ACTIVE: {
        const valueA = currentThemeColors.get('tab_line');
        values[key] = valueA || baseValues[key];
        break;
      }
      case CUSTOM_COLOR:
      case CUSTOM_COLOR_DISCARDED: {
        const valueA = currentThemeColors.has('sidebar') &&
          currentThemeColors.get('sidebar_text');
        const valueB = currentThemeColors.get('tab_background_text');
        values[key] = valueA || valueB || baseValues[key];
        break;
      }
      case CUSTOM_COLOR_ACTIVE: {
        const valueA = currentThemeColors.get('tab_text');
        const valueB = currentThemeColors.get('bookmark_text');
        values[key] = valueA || valueB || baseValues[key];
        break;
      }
      case CUSTOM_COLOR_SELECT:
      case CUSTOM_COLOR_SELECT_HOVER: {
        const valueA = currentThemeColors.has('sidebar_highlight') &&
          currentThemeColors.get('sidebar_highlight_text');
        const valueB = currentThemeColors.get('tab_text');
        const valueC = currentThemeColors.get('bookmark_text');
        values[key] = valueA || valueB || valueC || baseValues[key];
        break;
      }
      default:
        values[key] = baseValues[key];
    }
  }
  // override CUSTOM_*_HOVER color
  if (currentThemeColors.has('sidebar') || currentThemeColors.has('frame')) {
    const base = values[CUSTOM_BG];
    const color = await convertColorToHex(values[CUSTOM_COLOR]);
    const blend = `${color}1a`;
    const value = await blendColors(blend, base).then(convertColorToHex);
    values[CUSTOM_BG_HOVER] = value;
    values[CUSTOM_BG_SELECT_HOVER] = value;
    values[CUSTOM_COLOR_HOVER] = values[CUSTOM_COLOR];
    values[CUSTOM_COLOR_SELECT_HOVER] = values[CUSTOM_COLOR];
  }
  // override CUSTOM_BG_SELECT_HOVER color
  if (currentThemeColors.has('sidebar_highlight') &&
      currentThemeColors.has('sidebar_highlight_text')) {
    const base = currentThemeColors.get('sidebar_highlight');
    const color =
      await convertColorToHex(currentThemeColors.get('sidebar_highlight_text'));
    const blend = `${color}1a`;
    const value = await blendColors(blend, base).then(convertColorToHex);
    values[CUSTOM_BG_SELECT_HOVER] = value;
  }
  // override transparent CUSTOM_BORDER_ACTIVE color
  if (currentThemeColors.get('tab_line') === 'transparent') {
    const value = values[CUSTOM_BG];
    values[CUSTOM_BORDER_ACTIVE] = value;
  }
  return values;
};

/**
 * get base value
 *
 * @returns {object} - values
 */
export const getBaseValues = async () => {
  const appliedTheme = await getCurrentTheme();
  let values;
  if (isObjectNotEmpty(appliedTheme)) {
    const { colors } = appliedTheme;
    if (isObjectNotEmpty(colors)) {
      const colorsItems = Object.entries(colors);
      const func = [];
      for (const [key, value] of colorsItems) {
        value && func.push(setCurrentThemeColors(key, value));
      }
      await Promise.all(func);
      values = await getCurrentThemeBaseValues();
    }
  } else {
    const items = await getEnabledTheme();
    if (Array.isArray(items)) {
      for (const item of items) {
        const { id } = item;
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
 *
 * @returns {void}
 */
export const setCurrentThemeValue = async () => {
  const values = {};
  const store = await getAllStorage();
  const baseValues = await getBaseValues();
  const items = Object.entries(baseValues);
  for (const [key, val] of items) {
    const { value } = store[key] || {};
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
 *
 * @returns {?Function} - sendMessage()
 */
export const sendCurrentTheme = async () => {
  let func;
  const obj = currentTheme.get(THEME_CURRENT);
  if (obj) {
    const msg = {
      [THEME_CUSTOM_SETTING]: obj
    };
    func = sendMessage(null, msg);
  }
  return func || null;
};

/**
 * update custom theme CSS
 *
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
    const { sheet } = elm;
    const l = sheet.cssRules.length;
    const propKeys = themeMap[CSS_ID];
    const items = Object.entries(customTheme);
    let cssText = '';
    for (const [key, val] of items) {
      if (key === prop && isString(value)) {
        cssText += `${propKeys[key]}: ${value};`;
        customTheme[key] = value;
        currentTheme.set(THEME_CURRENT, customTheme);
      } else {
        cssText += `${propKeys[key]}: ${val};`;
      }
    }
    if (l) {
      let i = l - 1; let bool;
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
 * delete custom theme CSS rule
 *
 * @param {string} sel - selector
 * @returns {void}
 */
export const deleteCustomThemeCss = async (sel = `.${CLASS_THEME_CUSTOM}`) => {
  const elm = document.getElementById(CSS_ID);
  if (elm && elm.sheet) {
    const { sheet } = elm;
    const l = sheet.cssRules.length;
    if (l) {
      const arr = [];
      let i = 0;
      while (i < l) {
        sheet.cssRules[i].selectorText === sel && arr.unshift(i);
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
 *
 * @param {boolean} rem - remove storage
 * @returns {?Function} - sendCurrentTheme()
 */
export const initCustomTheme = async (rem = false) => {
  const elm = document.getElementById(CSS_ID);
  const obj = currentTheme.get(THEME_CURRENT);
  let func;
  if (elm && obj) {
    if (rem) {
      const items = Object.keys(obj);
      const arr = [];
      for (const key of items) {
        arr.push(key);
      }
      await removeStorage(arr);
    }
    currentThemeColors.clear();
    currentTheme.clear();
    await deleteCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
    await setCurrentThemeValue();
    await updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
    func = sendCurrentTheme();
  }
  return func || null;
};

/**
 * get theme
 *
 * @returns {Array} - theme class list
 */
export const getTheme = async () => {
  const data = await getStorage(THEME);
  const themes = [];
  if (isObjectNotEmpty(data)) {
    const { theme: storedTheme } = data;
    if (Array.isArray(storedTheme)) {
      for (const item of storedTheme) {
        themes.push(item);
      }
    }
  } else {
    const items = await getEnabledTheme();
    if (Array.isArray(items)) {
      for (const item of items) {
        const { id } = item;
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
 *
 * @param {Array} themes - array of theme
 * @returns {void}
 */
export const setTheme = async themes => {
  if (!Array.isArray(themes)) {
    throw new TypeError(`Expected Array but got ${getType(themes)}.`);
  }
  const elm = document.querySelector('body');
  const { classList } = elm;
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
    [THEME]: themes
  });
};

/* tab height */
/**
 * get tab height
 *
 * @returns {boolean} - result
 */
export const getTabHeight = async () => {
  const data = await getStorage(THEME_TAB_COMPACT);
  let compact;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_TAB_COMPACT];
    compact = checked;
  }
  return !!compact;
};

/**
 * set tab height
 *
 * @param {boolean} compact - compact
 * @returns {void}
 */
export const setTabHeight = async compact => {
  const elm = document.querySelector('body');
  const { classList } = elm;
  if (compact) {
    classList.add(CLASS_COMPACT);
  } else {
    classList.remove(CLASS_COMPACT);
  }
};

/* scrollbar */
/**
 * get scrollbar width
 *
 * @returns {boolean} - result
 */
export const getScrollbarWidth = async () => {
  const data = await getStorage(THEME_SCROLLBAR_NARROW);
  let narrow;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_SCROLLBAR_NARROW];
    narrow = checked;
  }
  return !!narrow;
};

/**
 * set scrollbar width
 *
 * @param {boolean} narrow - narrow
 * @returns {void}
 */
export const setScrollbarWidth = async narrow => {
  const elm = document.querySelector('body');
  const { classList } = elm;
  if (narrow) {
    classList.add(CLASS_NARROW);
  } else {
    classList.remove(CLASS_NARROW);
  }
};

/* tab group color bar */
/**
 * get tab group color bar width
 *
 * @returns {boolean} - result
 */
export const getTabGroupColorBarWidth = async () => {
  const data = await getStorage(THEME_TAB_GROUP_NARROW);
  let narrow;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_TAB_GROUP_NARROW];
    narrow = checked;
  }
  return !!narrow;
};

/**
 * set tab group color bar width
 *
 * @param {boolean} narrow - narrow
 * @returns {void}
 */
export const setTabGroupColorBarWidth = async narrow => {
  const elm = document.querySelector('body');
  const { classList } = elm;
  if (narrow) {
    classList.add(CLASS_NARROW_TAB_GROUP);
  } else {
    classList.remove(CLASS_NARROW_TAB_GROUP);
  }
};

/**
 * apply CSS
 *
 * @returns {void}
 */
export const applyCss = async () => {
  const items = document.querySelectorAll('section[hidden]');
  for (const item of items) {
    item.removeAttribute('hidden');
  }
};

/**
 * set sidebar theme
 *
 * @returns {void}
 */
export const setSidebarTheme = async () => Promise.all([
  setCurrentThemeValue().then(getTheme).then(setTheme),
  getTabHeight().then(setTabHeight),
  getScrollbarWidth().then(setScrollbarWidth),
  getTabGroupColorBarWidth().then(setTabGroupColorBarWidth)
]).then(applyCss);
