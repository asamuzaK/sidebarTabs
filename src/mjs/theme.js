/**
 * theme.js
 */

import {getType, isObjectNotEmpty} from "./common.js";
import {getEnabledTheme, getStorage, setStorage} from "./browser.js";

/* constants */
import {
  CLASS_THEME_DARK, CLASS_THEME_LIGHT, COMPACT, THEME, THEME_DARK,
  THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID, THEME_TAB_COMPACT,
} from "./constant.js";

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
      case THEME_DARK:
        classList.remove(CLASS_THEME_LIGHT);
        classList.add(CLASS_THEME_DARK);
        break;
      default:
        classList.remove(CLASS_THEME_DARK);
        classList.add(CLASS_THEME_LIGHT);
    }
  }
  await setStorage({
    [THEME]: themes,
  });
};

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
  getTheme().then(setTheme),
  getTabHeight().then(setTabHeight),
]).then(applyCss);
