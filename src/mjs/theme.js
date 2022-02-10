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
  CLASS_COMPACT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP, CLASS_SEPARATOR_SHOW,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT, CLASS_THEME_SYSTEM,
  COLOR_SCHEME_DARK,
  CSS_VAR_BG, CSS_VAR_BG_ACTIVE, CSS_VAR_BG_DISCARDED, CSS_VAR_BG_FIELD,
  CSS_VAR_BG_FIELD_ACTIVE, CSS_VAR_BG_HOVER, CSS_VAR_BG_HOVER_SHADOW,
  CSS_VAR_BG_SELECT, CSS_VAR_BG_SELECT_HOVER,
  CSS_VAR_BORDER_ACTIVE, CSS_VAR_BORDER_FIELD, CSS_VAR_BORDER_FIELD_ACTIVE,
  CSS_VAR_COLOR, CSS_VAR_COLOR_ACTIVE, CSS_VAR_COLOR_DISCARDED,
  CSS_VAR_COLOR_FIELD, CSS_VAR_COLOR_FIELD_ACTIVE,
  CSS_VAR_COLOR_HOVER, CSS_VAR_COLOR_SELECT, CSS_VAR_COLOR_SELECT_HOVER,
  CSS_VAR_HEADING_TEXT_GROUP_1, CSS_VAR_HEADING_TEXT_GROUP_2,
  CSS_VAR_HEADING_TEXT_GROUP_3, CSS_VAR_HEADING_TEXT_GROUP_4,
  CSS_VAR_HEADING_TEXT_PINNED,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED, CUSTOM_BG_FIELD,
  CUSTOM_BG_FIELD_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_HOVER_SHADOW,
  CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER_ACTIVE, CUSTOM_BORDER_FIELD, CUSTOM_BORDER_FIELD_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  CUSTOM_COLOR_FIELD, CUSTOM_COLOR_FIELD_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  CUSTOM_HEADING_TEXT_GROUP_1, CUSTOM_HEADING_TEXT_GROUP_2,
  CUSTOM_HEADING_TEXT_GROUP_3, CUSTOM_HEADING_TEXT_GROUP_4,
  CUSTOM_HEADING_TEXT_PINNED,
  NEW_TAB, NEW_TAB_SEPARATOR_SHOW, TAB,
  THEME, THEME_ALPEN, THEME_ALPEN_DARK, THEME_ALPEN_ID, THEME_AUTO,
  THEME_CURRENT, THEME_CUSTOM, THEME_CUSTOM_ID, THEME_CUSTOM_SETTING,
  THEME_DARK, THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID, THEME_LIST,
  THEME_SYSTEM, THEME_SYSTEM_ID,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW
} from './constant.js';

/* theme map */
export const themeMap = {
  [THEME_CUSTOM]: {
    [CUSTOM_BG]: CSS_VAR_BG,
    [CUSTOM_BG_ACTIVE]: CSS_VAR_BG_ACTIVE,
    [CUSTOM_BG_DISCARDED]: CSS_VAR_BG_DISCARDED,
    [CUSTOM_BG_FIELD]: CSS_VAR_BG_FIELD,
    [CUSTOM_BG_FIELD_ACTIVE]: CSS_VAR_BG_FIELD_ACTIVE,
    [CUSTOM_BG_HOVER]: CSS_VAR_BG_HOVER,
    [CUSTOM_BG_HOVER_SHADOW]: CSS_VAR_BG_HOVER_SHADOW,
    [CUSTOM_BG_SELECT]: CSS_VAR_BG_SELECT,
    [CUSTOM_BG_SELECT_HOVER]: CSS_VAR_BG_SELECT_HOVER,
    [CUSTOM_BORDER_ACTIVE]: CSS_VAR_BORDER_ACTIVE,
    [CUSTOM_BORDER_FIELD]: CSS_VAR_BORDER_FIELD,
    [CUSTOM_BORDER_FIELD_ACTIVE]: CSS_VAR_BORDER_FIELD_ACTIVE,
    [CUSTOM_COLOR]: CSS_VAR_COLOR,
    [CUSTOM_COLOR_ACTIVE]: CSS_VAR_COLOR_ACTIVE,
    [CUSTOM_COLOR_DISCARDED]: CSS_VAR_COLOR_DISCARDED,
    [CUSTOM_COLOR_FIELD]: CSS_VAR_COLOR_FIELD,
    [CUSTOM_COLOR_FIELD_ACTIVE]: CSS_VAR_COLOR_FIELD_ACTIVE,
    [CUSTOM_COLOR_HOVER]: CSS_VAR_COLOR_HOVER,
    [CUSTOM_COLOR_SELECT]: CSS_VAR_COLOR_SELECT,
    [CUSTOM_COLOR_SELECT_HOVER]: CSS_VAR_COLOR_SELECT_HOVER,
    [CUSTOM_HEADING_TEXT_GROUP_1]: CSS_VAR_HEADING_TEXT_GROUP_1,
    [CUSTOM_HEADING_TEXT_GROUP_2]: CSS_VAR_HEADING_TEXT_GROUP_2,
    [CUSTOM_HEADING_TEXT_GROUP_3]: CSS_VAR_HEADING_TEXT_GROUP_3,
    [CUSTOM_HEADING_TEXT_GROUP_4]: CSS_VAR_HEADING_TEXT_GROUP_4,
    [CUSTOM_HEADING_TEXT_PINNED]: CSS_VAR_HEADING_TEXT_PINNED
  },
  [THEME_ALPEN]: {
    [CUSTOM_BG]: '#f0f0f4',
    [CUSTOM_BG_ACTIVE]: '#ffffff',
    [CUSTOM_BG_DISCARDED]: '#f0f0f4',
    [CUSTOM_BG_FIELD]: '#ffffffcc',
    [CUSTOM_BG_FIELD_ACTIVE]: '#20123bf5',
    [CUSTOM_BG_HOVER]: '#dbd9e1',
    [CUSTOM_BG_HOVER_SHADOW]: '#20123b1a',
    [CUSTOM_BG_SELECT]: '#ac70ff',
    [CUSTOM_BG_SELECT_HOVER]: '#b47fff',
    [CUSTOM_BORDER_ACTIVE]: '#ac70ff',
    [CUSTOM_BORDER_FIELD]: '#f0f0f4', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD_ACTIVE]: '#ac70ff',
    [CUSTOM_COLOR]: '#20123b',
    [CUSTOM_COLOR_ACTIVE]: '#20123b',
    [CUSTOM_COLOR_DISCARDED]: '#20123b',
    [CUSTOM_COLOR_FIELD]: '#20123b',
    [CUSTOM_COLOR_FIELD_ACTIVE]: '#e8e0ff',
    [CUSTOM_COLOR_HOVER]: '#20123b',
    [CUSTOM_COLOR_SELECT]: '#ffffff',
    [CUSTOM_COLOR_SELECT_HOVER]: '#ffffff',
    [CUSTOM_HEADING_TEXT_GROUP_1]: '#874436',
    [CUSTOM_HEADING_TEXT_GROUP_2]: '#2b6355',
    [CUSTOM_HEADING_TEXT_GROUP_3]: '#874473',
    [CUSTOM_HEADING_TEXT_GROUP_4]: '#4a6392',
    [CUSTOM_HEADING_TEXT_PINNED]: '#4a4473'
  },
  [THEME_ALPEN_DARK]: {
    [CUSTOM_BG]: '#2d245b',
    [CUSTOM_BG_ACTIVE]: '#3c1f7b',
    [CUSTOM_BG_DISCARDED]: '#2d245b',
    [CUSTOM_BG_FIELD]: '#2d245b',
    [CUSTOM_BG_FIELD_ACTIVE]: '#2d245bfa',
    [CUSTOM_BG_HOVER]: '#40376c',
    [CUSTOM_BG_HOVER_SHADOW]: '#e8e0ff1a',
    [CUSTOM_BG_SELECT]: '#7643e5',
    [CUSTOM_BG_SELECT_HOVER]: '#8456e8',
    [CUSTOM_BORDER_ACTIVE]: '#ac70ff',
    [CUSTOM_BORDER_FIELD]: '#2d245b', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD_ACTIVE]: '#ac70ff',
    [CUSTOM_COLOR]: '#e8e0ff',
    [CUSTOM_COLOR_ACTIVE]: '#e8e0ff',
    [CUSTOM_COLOR_DISCARDED]: '#e8e0ff',
    [CUSTOM_COLOR_FIELD]: '#e8e0ff',
    [CUSTOM_COLOR_FIELD_ACTIVE]: '#e8e0ff',
    [CUSTOM_COLOR_HOVER]: '#e8e0ff',
    [CUSTOM_COLOR_SELECT]: '#ffffff',
    [CUSTOM_COLOR_SELECT_HOVER]: '#ffffff',
    [CUSTOM_HEADING_TEXT_GROUP_1]: '#d79785',
    [CUSTOM_HEADING_TEXT_GROUP_2]: '#7bb5a3',
    [CUSTOM_HEADING_TEXT_GROUP_3]: '#d797c2',
    [CUSTOM_HEADING_TEXT_GROUP_4]: '#9ab5e0',
    [CUSTOM_HEADING_TEXT_PINNED]: '#9a97c2'
  },
  [THEME_DARK]: {
    [CUSTOM_BG]: '#38383d',
    [CUSTOM_BG_ACTIVE]: '#42414d',
    [CUSTOM_BG_DISCARDED]: '#38383d',
    [CUSTOM_BG_FIELD]: '#1c1b22',
    [CUSTOM_BG_FIELD_ACTIVE]: '#42414d',
    [CUSTOM_BG_HOVER]: '#4c4c50',
    [CUSTOM_BG_HOVER_SHADOW]: '#fbfbfe1a',
    [CUSTOM_BG_SELECT]: '#42414d',
    [CUSTOM_BG_SELECT_HOVER]: '#55545f',
    [CUSTOM_BORDER_ACTIVE]: '#4c4c50', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD]: '#38383d', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD_ACTIVE]: '#00ddff',
    [CUSTOM_COLOR]: '#f9f9fa',
    [CUSTOM_COLOR_ACTIVE]: '#fbfbfe',
    [CUSTOM_COLOR_DISCARDED]: '#f9f9fa',
    [CUSTOM_COLOR_FIELD]: '#fbfbfe',
    [CUSTOM_COLOR_FIELD_ACTIVE]: '#fbfbfe',
    [CUSTOM_COLOR_HOVER]: '#f9f9fa',
    [CUSTOM_COLOR_SELECT]: '#fbfbfe',
    [CUSTOM_COLOR_SELECT_HOVER]: '#fbfbfe',
    [CUSTOM_HEADING_TEXT_GROUP_1]: '#dea183',
    [CUSTOM_HEADING_TEXT_GROUP_2]: '#82bfa1',
    [CUSTOM_HEADING_TEXT_GROUP_3]: '#dea1c0',
    [CUSTOM_HEADING_TEXT_GROUP_4]: '#a1bfde',
    [CUSTOM_HEADING_TEXT_PINNED]: '#a1a1c0'
  },
  [THEME_LIGHT]: {
    [CUSTOM_BG]: '#f0f0f4',
    [CUSTOM_BG_ACTIVE]: '#ffffff',
    [CUSTOM_BG_DISCARDED]: '#f0f0f4',
    [CUSTOM_BG_FIELD]: '#f0f0f4',
    [CUSTOM_BG_FIELD_ACTIVE]: '#ffffff',
    [CUSTOM_BG_HOVER]: '#dadade',
    [CUSTOM_BG_HOVER_SHADOW]: '#15141a1a',
    [CUSTOM_BG_SELECT]: '#ffffff',
    [CUSTOM_BG_SELECT_HOVER]: '#e7e7e8',
    [CUSTOM_BORDER_ACTIVE]: '#dadade', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD]: '#f0f0f4', // NOTE: 'transparent',
    [CUSTOM_BORDER_FIELD_ACTIVE]: '#053e94',
    [CUSTOM_COLOR]: '#15141a',
    [CUSTOM_COLOR_ACTIVE]: '#15141a',
    [CUSTOM_COLOR_DISCARDED]: '#15141a',
    [CUSTOM_COLOR_FIELD]: '#15141a',
    [CUSTOM_COLOR_FIELD_ACTIVE]: '#15141a',
    [CUSTOM_COLOR_HOVER]: '#15141a',
    [CUSTOM_COLOR_SELECT]: '#15141a',
    [CUSTOM_COLOR_SELECT_HOVER]: '#15141a',
    [CUSTOM_HEADING_TEXT_GROUP_1]: '#834529',
    [CUSTOM_HEADING_TEXT_GROUP_2]: '#276448',
    [CUSTOM_HEADING_TEXT_GROUP_3]: '#834566',
    [CUSTOM_HEADING_TEXT_GROUP_4]: '#466485',
    [CUSTOM_HEADING_TEXT_PINNED]: '#464566'
  }
};

/* current theme colors */
export const currentThemeColors = new Map();

/* current theme */
export const currentTheme = new Map();

/**
 * get theme ID
 *
 * @returns {?string} - theme ID
 */
export const getThemeId = async () => {
  const items = await getEnabledTheme();
  let themeId;
  if (Array.isArray(items) && items.length === 1) {
    const [{ id }] = items;
    themeId = id;
  }
  return themeId || null;
};

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
  if (/^(?:currentcolor|transparent)$/i.test(value)) {
    currentThemeColors.set(key, value);
  } else {
    const hexValue = await convertColorToHex(value, true);
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
  const currentColorKeys = new Set();
  const dark = window.matchMedia(COLOR_SCHEME_DARK).matches;
  const baseValues = (dark && themeMap[THEME_DARK]) || themeMap[THEME_LIGHT];
  const items = Object.keys(baseValues);
  for (const key of items) {
    switch (key) {
      case CUSTOM_BG:
      case CUSTOM_BG_DISCARDED: {
        const valueA = currentThemeColors.get('sidebar');
        const valueB = currentThemeColors.get('frame');
        values[key] = valueA || valueB || baseValues[key];
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
        break;
      }
      case CUSTOM_BG_ACTIVE: {
        const valueA = currentThemeColors.get('tab_selected');
        values[key] = valueA || baseValues[key];
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
        break;
      }
      case CUSTOM_BG_FIELD: {
        const valueA = currentThemeColors.get('toolbar_field');
        values[key] = valueA || baseValues[key];
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
        break;
      }
      case CUSTOM_BG_FIELD_ACTIVE: {
        const valueA = currentThemeColors.get('toolbar_field_focus');
        values[key] = valueA || baseValues[key];
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
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
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
        break;
      }
      case CUSTOM_BORDER_ACTIVE: {
        const valueA = currentThemeColors.get('tab_line');
        const valueB = currentThemeColors.get('tab_text');
        values[key] = valueA || valueB || baseValues[key];
        break;
      }
      case CUSTOM_BORDER_FIELD: {
        const valueA = currentThemeColors.get('toolbar_field_border');
        values[key] = valueA || baseValues[key];
        break;
      }
      case CUSTOM_BORDER_FIELD_ACTIVE: {
        const valueA = currentThemeColors.get('toolbar_field_border_focus');
        values[key] = valueA || baseValues[key];
        break;
      }
      case CUSTOM_COLOR:
      case CUSTOM_COLOR_DISCARDED: {
        const valueA = currentThemeColors.has('sidebar') &&
          currentThemeColors.get('sidebar_text');
        const valueB = currentThemeColors.get('tab_background_text');
        values[key] = valueA || valueB || baseValues[key];
        if (/^currentColor$/i.test(values[key])) {
          values[key] = baseValues[CUSTOM_COLOR];
        }
        break;
      }
      case CUSTOM_COLOR_ACTIVE: {
        const valueA = currentThemeColors.get('tab_text');
        const valueB = currentThemeColors.get('bookmark_text');
        const valueC = currentThemeColors.get('tab_background_text');
        values[key] = valueA || valueB || valueC || baseValues[key];
        if (/^currentColor$/i.test(values[key])) {
          values[key] = baseValues[CUSTOM_COLOR];
        }
        break;
      }
      case CUSTOM_COLOR_FIELD: {
        const valueA = currentThemeColors.get('toolbar_field_text');
        values[key] = valueA || baseValues[key];
        if (/^currentColor$/i.test(values[key])) {
          values[key] = baseValues[CUSTOM_COLOR];
        }
        break;
      }
      case CUSTOM_COLOR_FIELD_ACTIVE: {
        const valueA = currentThemeColors.get('toolbar_field_text_focus');
        values[key] = valueA || baseValues[key];
        /^currentColor$/i.test(values[key]) && currentColorKeys.add(key);
        break;
      }
      case CUSTOM_COLOR_SELECT: {
        const valueA = currentThemeColors.has('sidebar_highlight') &&
          currentThemeColors.get('sidebar_highlight_text');
        const valueB = currentThemeColors.get('tab_text');
        const valueC = currentThemeColors.get('bookmark_text');
        values[key] = valueA || valueB || valueC || baseValues[key];
        if (/^currentColor$/i.test(values[key])) {
          values[key] = baseValues[CUSTOM_COLOR];
        }
        break;
      }
      default:
        values[key] = baseValues[key];
    }
  }
  // replace currentColor keywords to color values
  if (currentColorKeys.has(CUSTOM_COLOR_FIELD_ACTIVE)) {
    values[CUSTOM_COLOR_FIELD_ACTIVE] = values[CUSTOM_COLOR_FIELD];
    currentColorKeys.delete(CUSTOM_COLOR_FIELD_ACTIVE);
  }
  if (currentColorKeys.size) {
    const keys = currentColorKeys.keys();
    for (const key of keys) {
      switch (key) {
        case CUSTOM_BG_ACTIVE:
          values[key] = values[CUSTOM_COLOR_ACTIVE];
          break;
        case CUSTOM_BG_FIELD:
          values[key] = values[CUSTOM_COLOR_FIELD];
          break;
        case CUSTOM_BG_FIELD_ACTIVE:
          values[key] = values[CUSTOM_COLOR_FIELD_ACTIVE];
          break;
        case CUSTOM_BG_SELECT:
          values[key] = values[CUSTOM_COLOR_SELECT];
          break;
        default:
          values[key] = values[CUSTOM_COLOR];
      }
    }
  }
  // override CUSTOM_*_HOVER and CUSTOM_HEADING_TEXT_* colors
  if (currentThemeColors.has('sidebar') || currentThemeColors.has('frame') ||
      (currentThemeColors.has('sidebar_highlight_text') &&
       currentThemeColors.has('sidebar_highlight'))) {
    const base = values[CUSTOM_BG];
    const color = await convertColorToHex(values[CUSTOM_COLOR]);
    const hoverBlend = `${color}1a`;
    const hoverValue = await blendColors(hoverBlend, base);
    const selectBase = values[CUSTOM_BG_SELECT];
    const selectColor = await convertColorToHex(values[CUSTOM_COLOR_SELECT]);
    const selectBlend = `${selectColor}1a`;
    const selectValue = await blendColors(selectBlend, selectBase);
    const groupColors = [
      [CUSTOM_HEADING_TEXT_GROUP_1, '#cc663399'],
      [CUSTOM_HEADING_TEXT_GROUP_2, '#33996699'],
      [CUSTOM_HEADING_TEXT_GROUP_3, '#cc669999'],
      [CUSTOM_HEADING_TEXT_GROUP_4, '#6699cc99'],
      [CUSTOM_HEADING_TEXT_PINNED, '#66669999']
    ];
    for (const [key, value] of groupColors) {
      values[key] = await blendColors(value, color);
    }
    values[CUSTOM_BG_HOVER] = hoverValue;
    values[CUSTOM_COLOR_HOVER] = values[CUSTOM_COLOR];
    values[CUSTOM_BG_SELECT_HOVER] = selectValue;
    values[CUSTOM_COLOR_SELECT_HOVER] = values[CUSTOM_COLOR_SELECT];
  }
  // override CUSTOM_BORDER_* colors
  if (currentThemeColors.has('tab_line')) {
    const base = values[CUSTOM_BG];
    const border = currentThemeColors.get('tab_line');
    let value;
    if (border === 'transparent') {
      value = values[CUSTOM_BG_HOVER];
    } else if (/^currentColor$/i.test(border)) {
      value = await blendColors(values[CUSTOM_COLOR_ACTIVE], base);
    } else {
      value = await blendColors(border, base);
    }
    values[CUSTOM_BORDER_ACTIVE] = value;
  }
  if (currentThemeColors.has('toolbar_field_border')) {
    const base = values[CUSTOM_BG];
    const border = currentThemeColors.get('toolbar_field_border');
    let value;
    if (border === 'transparent') {
      value = base;
    } else if (/^currentColor$/i.test(border)) {
      value = await blendColors(values[CUSTOM_COLOR_FIELD], base);
    } else {
      value = await blendColors(border, base);
    }
    values[CUSTOM_BORDER_FIELD] = value;
  }
  if (currentThemeColors.has('toolbar_field_border_focus')) {
    const base = values[CUSTOM_BG];
    const border = currentThemeColors.get('toolbar_field_border_focus');
    let value;
    if (border === 'transparent') {
      value = base;
    } else if (/^currentColor$/i.test(border)) {
      value = await blendColors(values[CUSTOM_COLOR_FIELD_ACTIVE], base);
    } else {
      value = await blendColors(border, base);
    }
    values[CUSTOM_BORDER_FIELD_ACTIVE] = value;
  }
  return values;
};

/**
 * get base value
 *
 * @param {string} id - id
 * @returns {object} - values
 */
export const getBaseValues = async id => {
  if (!isString(id)) {
    throw new TypeError(`Expected String but got ${getType(id)}.`);
  }
  const dark = window.matchMedia(COLOR_SCHEME_DARK).matches;
  let values;
  switch (id) {
    case THEME_ALPEN_ID:
      if (dark) {
        values = themeMap[THEME_ALPEN_DARK];
      } else {
        values = themeMap[THEME_ALPEN];
      }
      break;
    case THEME_DARK_ID:
      values = themeMap[THEME_DARK];
      break;
    case THEME_LIGHT_ID:
      values = themeMap[THEME_LIGHT];
      break;
    case THEME_SYSTEM_ID:
      if (dark) {
        values = themeMap[THEME_DARK];
      } else {
        values = themeMap[THEME_LIGHT];
      }
      break;
    default:
  }
  if (!values) {
    const appliedTheme = await getCurrentTheme();
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
      } else {
        values = themeMap[THEME_LIGHT];
      }
    } else {
      values = themeMap[THEME_LIGHT];
    }
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
  const themeId = await getThemeId();
  const baseValues = await getBaseValues(themeId);
  const items = Object.entries(baseValues);
  const { themeList } = await getStorage(THEME_LIST);
  if (isObjectNotEmpty(themeList) &&
      Object.prototype.hasOwnProperty.call(themeList, themeId)) {
    const { values: themeValues } = themeList[themeId];
    for (const [key, value] of items) {
      const customValue = themeValues[key];
      if (customValue) {
        values[key] = customValue;
      } else {
        values[key] = value;
      }
    }
  // NOTE: for migration, remove later
  } else {
    const store = await getAllStorage();
    for (const [key, value] of items) {
      const { value: customValue } = store[key] || {};
      if (customValue) {
        values[key] = customValue;
      } else {
        values[key] = value;
      }
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
  const values = currentTheme.get(THEME_CURRENT);
  let func;
  if (values) {
    const id = await getThemeId();
    const msg = {
      [THEME_CUSTOM_SETTING]: {
        id,
        values
      }
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
  const elm = document.getElementById(THEME_CUSTOM_ID);
  const customTheme = currentTheme.get(THEME_CURRENT);
  if (elm && elm.sheet && isObjectNotEmpty(customTheme)) {
    const { sheet } = elm;
    const l = sheet.cssRules.length;
    const propKeys = themeMap[THEME_CUSTOM];
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
      let i = l - 1;
      let bool;
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
  const elm = document.getElementById(THEME_CUSTOM_ID);
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
  const elm = document.getElementById(THEME_CUSTOM_ID);
  const obj = currentTheme.get(THEME_CURRENT);
  let func;
  if (elm && obj) {
    if (rem) {
      const { themeList } = await getStorage(THEME_LIST);
      if (isObjectNotEmpty(themeList)) {
        const themeId = await getThemeId();
        Object.prototype.hasOwnProperty.call(themeList, themeId) &&
          delete themeList[themeId];
        if (isObjectNotEmpty(themeList)) {
          await setStorage({
            [THEME_LIST]: themeList
          });
        } else {
          await removeStorage([THEME_LIST]);
        }
      // NOTE: For migration, remove later
      } else {
        const items = Object.keys(obj);
        const arr = [];
        for (const key of items) {
          arr.push(key);
        }
        await removeStorage(arr);
      }
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
  const themes = new Map();
  const data = await getStorage(THEME);
  if (isObjectNotEmpty(data)) {
    const { theme: storedTheme } = data;
    if (Array.isArray(storedTheme)) {
      const [key, value] = storedTheme;
      if (isString(key) && key !== THEME_AUTO && value) {
        themes.set(key, !!value);
      }
    }
  }
  if (!themes.size) {
    const id = await getThemeId();
    switch (id) {
      case THEME_DARK_ID:
        themes.set(THEME_DARK, false);
        break;
      case THEME_LIGHT_ID:
        themes.set(THEME_LIGHT, false);
        break;
      case THEME_SYSTEM_ID:
        themes.set(THEME_SYSTEM, false);
        break;
      case THEME_ALPEN_ID:
      default:
        themes.set(THEME_AUTO, false);
    }
  }
  const [res] = Array.from(themes);
  return res;
};

/**
 * set theme
 *
 * @param {Array} info - theme info
 * @returns {void}
 */
export const setTheme = async info => {
  if (!Array.isArray(info)) {
    throw new TypeError(`Expected Array but got ${getType(info)}.`);
  }
  const [key, value] = info;
  const elm = document.querySelector('body');
  const { classList } = elm;
  const dark = window.matchMedia(COLOR_SCHEME_DARK).matches;
  let item;
  if (key === THEME_AUTO) {
    const id = await getThemeId();
    if (id === THEME_SYSTEM_ID) {
      item = THEME_SYSTEM;
    } else {
      item = key;
    }
  } else {
    item = key;
  }
  switch (item) {
    case THEME_CUSTOM: {
      classList.add(CLASS_THEME_CUSTOM);
      classList.remove(CLASS_THEME_DARK);
      classList.remove(CLASS_THEME_LIGHT);
      classList.remove(CLASS_THEME_SYSTEM);
      break;
    }
    case THEME_DARK: {
      classList.remove(CLASS_THEME_CUSTOM);
      classList.add(CLASS_THEME_DARK);
      classList.remove(CLASS_THEME_LIGHT);
      classList.remove(CLASS_THEME_SYSTEM);
      break;
    }
    case THEME_LIGHT: {
      classList.remove(CLASS_THEME_CUSTOM);
      classList.remove(CLASS_THEME_DARK);
      classList.add(CLASS_THEME_LIGHT);
      classList.remove(CLASS_THEME_SYSTEM);
      break;
    }
    case THEME_SYSTEM: {
      if (dark) {
        classList.remove(CLASS_THEME_CUSTOM);
        classList.add(CLASS_THEME_DARK);
        classList.remove(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_SYSTEM);
      } else {
        classList.remove(CLASS_THEME_CUSTOM);
        classList.remove(CLASS_THEME_DARK);
        classList.add(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_SYSTEM);
      }
      break;
    }
    default: {
      if (dark) {
        classList.add(CLASS_THEME_CUSTOM);
        classList.add(CLASS_THEME_DARK);
        classList.remove(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_SYSTEM);
      } else {
        classList.add(CLASS_THEME_CUSTOM);
        classList.remove(CLASS_THEME_DARK);
        classList.add(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_SYSTEM);
      }
    }
  }
  await updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`);
  await setStorage({
    [THEME]: [item, !!value]
  });
};

/**
 * apply theme
 *
 * @returns {Function} - promise chain
 */
export const applyTheme = async () =>
  setCurrentThemeValue().then(getTheme).then(setTheme).then(sendCurrentTheme);

/* tab height */
/**
 * get tab height
 *
 * @returns {boolean} - result
 */
export const getTabHeight = async () => {
  const data = await getStorage(THEME_UI_TAB_COMPACT);
  let compact;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_UI_TAB_COMPACT];
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
  const data = await getStorage(THEME_UI_SCROLLBAR_NARROW);
  let narrow;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_UI_SCROLLBAR_NARROW];
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
  const data = await getStorage(THEME_UI_TAB_GROUP_NARROW);
  let narrow;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[THEME_UI_TAB_GROUP_NARROW];
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

/* new tab */
/**
 * get new tab separator
 *
 * @returns {boolean} - result
 */
export const getNewTabSeparator = async () => {
  const data = await getStorage(NEW_TAB_SEPARATOR_SHOW);
  let show;
  if (isObjectNotEmpty(data)) {
    const { checked } = data[NEW_TAB_SEPARATOR_SHOW];
    show = checked;
  }
  return !!show;
};

/**
 * set new tab separator
 *
 * @param {boolean} show - show separator
 * @returns {void}
 */
export const setNewTabSeparator = async show => {
  const elm = document.querySelector(`#${NEW_TAB} > .${TAB}.${NEW_TAB}`);
  const { classList } = elm;
  if (show) {
    classList.add(CLASS_SEPARATOR_SHOW);
  } else {
    classList.remove(CLASS_SEPARATOR_SHOW);
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
  applyTheme(),
  getTabHeight().then(setTabHeight),
  getScrollbarWidth().then(setScrollbarWidth),
  getTabGroupColorBarWidth().then(setTabGroupColorBarWidth),
  getNewTabSeparator().then(setNewTabSeparator)
]).then(applyCss);
