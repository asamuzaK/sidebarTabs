/**
 * theme.js
 */

import {getType} from "./common.js";
import {getEnabledTheme, getStorage, setStorage} from "./browser.js";
import {
  CLASS_THEME_DARK, CLASS_THEME_LIGHT, THEME, THEME_DARK, THEME_DARK_ID,
  THEME_LIGHT, THEME_LIGHT_ID,
} from "./constant.js";

/**
 * get theme
 * @returns {Array} - theme class list
 */
export const getTheme = async () => {
  const {theme: storedTheme} = await getStorage(THEME);
  let themes = [];
  if (Array.isArray(storedTheme) && storedTheme.length) {
    themes = storedTheme;
  } else {
    const items = await getEnabledTheme();
    if (Array.isArray(items) && items.length) {
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
    !themes.length && themes.push(THEME_LIGHT);
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
 * apply CSS
 * @returns {void}
 */
export const applyCss = async () => {
  const items = document.querySelectorAll("section[hidden], menu[hidden]");
  for (const item of items) {
    item.removeAttribute("hidden");
  }
};

/**
 * set sidebar theme
 * @returns {void}
 */
export const setSidebarTheme = async () =>
  getTheme().then(setTheme).then(applyCss);
