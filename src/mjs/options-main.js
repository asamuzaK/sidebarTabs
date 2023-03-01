/**
 * options.js
 */

/* shared */
import { isObjectNotEmpty, isString, throwErr } from './common.js';
import {
  clearContextMenuOnMouseup, getAllStorage, removePermission,
  requestPermission, sendMessage, setContextMenuOnMouseup, setStorage
} from './browser.js';
import { getFolderMap } from './bookmark.js';
import {
  BOOKMARK_LOCATION, BROWSER_SETTINGS_READ, COLOR_SCHEME, EXT_INIT,
  MENU_SHOW_MOUSEUP, THEME_CUSTOM, THEME_CUSTOM_DARK, THEME_CUSTOM_INIT,
  THEME_CUSTOM_LIGHT, THEME_CUSTOM_REQ, THEME_CUSTOM_SETTING, THEME_ID,
  THEME_RADIO, USER_CSS, USER_CSS_SAVE, USER_CSS_USE, USER_CSS_WARN
} from './constant.js';

/**
 * send message
 *
 * @param {*} msg - message
 * @returns {Promise.<void>} - void
 */
export const sendMsg = async msg => {
  if (msg) {
    await sendMessage(null, msg);
  }
};

/**
 * init extension
 *
 * @param {boolean} init - init
 * @returns {Promise.<?Promise>} - sendMessage()
 */
export const initExt = async (init = false) => {
  let func;
  if (init) {
    func = sendMsg({
      [EXT_INIT]: !!init
    });
  }
  return func || null;
};

/**
 * init custom theme
 *
 * @param {boolean} [init] - init
 * @returns {Promise.<?Promise>} - sendMessage()
 */
export const initCustomTheme = async (init = false) => {
  let func;
  if (init) {
    func = sendMsg({
      [THEME_CUSTOM_INIT]: !!init
    });
  }
  return func || null;
};

/**
 * request custom theme
 *
 * @param {boolean} bool - bool
 * @returns {Promise.<?Promise>} - sendMessage()
 */
export const requestCustomTheme = async (bool = false) => {
  let func;
  if (bool) {
    func = sendMsg({
      [THEME_CUSTOM_REQ]: !!bool
    });
  }
  return func || null;
};

/**
 * store custom theme values
 *
 * @returns {Promise.<object>} - custom theme data
 */
export const storeCustomTheme = async () => {
  const items = document.querySelectorAll('[type=color]');
  const themeValues = new Map();
  for (const item of items) {
    const { id, value } = item;
    themeValues.set(id, value);
  }
  const storeTheme = Object.fromEntries(themeValues);
  const dark = document.getElementById(COLOR_SCHEME)?.value === 'dark';
  const storeId = dark ? THEME_CUSTOM_DARK : THEME_CUSTOM_LIGHT;
  storeTheme.id = storeId;
  return {
    [storeId]: storeTheme
  };
};

/**
 * create pref
 *
 * @param {object} elm - element
 * @returns {Promise.<object>} - pref data
 */
export const createPref = async (elm = {}) => {
  const { dataset, id } = elm;
  const data = id && {
    [id]: {
      id,
      checked: !!elm.checked,
      value: elm.value || '',
      subItemOf: dataset?.subItemOf || null
    }
  };
  return data || null;
};

/**
 * store pref
 *
 * @param {!object} evt - Event
 * @returns {Promise.<Array>} - results of each handler
 */
export const storePref = async evt => {
  const { target } = evt;
  const { checked, id, name, type } = target;
  const func = [];
  if (type === 'radio') {
    const nodes = document.querySelectorAll(`[name=${name}]`);
    for (const node of nodes) {
      func.push(createPref(node).then(setStorage));
    }
  } else if (type === 'color') {
    func.push(storeCustomTheme().then(setStorage));
  } else {
    switch (id) {
      case BROWSER_SETTINGS_READ:
        if (checked) {
          target.checked = await requestPermission(['browserSettings']);
        } else {
          await removePermission(['browserSettings']);
        }
        func.push(createPref(target).then(setStorage));
        break;
      case MENU_SHOW_MOUSEUP: {
        if (checked) {
          const res = await setContextMenuOnMouseup();
          if (!res) {
            window.alert('Failed to modify value.');
          }
          target.checked = res;
        } else {
          await clearContextMenuOnMouseup();
        }
        func.push(createPref(target).then(setStorage));
        break;
      }
      default:
        func.push(createPref(target).then(setStorage));
    }
  }
  return Promise.all(func);
};

/**
 * toggle sub items
 *
 * @param {!object} evt - Event
 * @returns {void}
 */
export const toggleSubItems = evt => {
  const { target } = evt;
  const { checked, id } = target;
  const items = document.querySelectorAll(`[data-sub-item-of=${id}]`);
  for (const item of items) {
    if (checked) {
      item.removeAttribute('hidden');
    } else {
      item.setAttribute('hidden', 'hidden');
    }
  }
};

/* custom theme */
/**
 * toggle custom theme settings
 *
 * @returns {void}
 */
export const toggleCustomThemeSettings = () => {
  const target = document.getElementById(THEME_CUSTOM);
  if (target) {
    toggleSubItems({
      target
    });
  }
};

/**
 * add event listener to custom theme radio button
 *
 * @returns {Promise.<void>} - void
 */
export const addCustomThemeListener = async () => {
  const nodes = document.querySelectorAll(`input[name=${THEME_RADIO}]`);
  for (const node of nodes) {
    node.addEventListener('change', toggleCustomThemeSettings);
  }
};

/**
 * set custom theme value
 *
 * @param {object} obj - values
 * @returns {Promise.<void>} - void
 */
export const setCustomThemeValue = async (obj = {}) => {
  if (isObjectNotEmpty(obj)) {
    const { colorScheme, id, values } = obj;
    const themeId = document.getElementById(THEME_ID);
    const colorSchemeId = document.getElementById(COLOR_SCHEME);
    if (themeId) {
      themeId.value = id || '';
    }
    if (colorSchemeId) {
      colorSchemeId.value = colorScheme || '';
    }
    const items = Object.entries(values);
    for (const [key, value] of items) {
      const elm = document.getElementById(key);
      if (elm) {
        const { type } = elm;
        if (type === 'color' &&
            isString(value) && /^#[\da-f]{6}$/i.test(value)) {
          elm.value = value.toLowerCase();
        }
      }
    }
  }
};

/**
 * add bookmark locations
 *
 * @returns {Promise.<void>} - void
 */
export const addBookmarkLocations = async () => {
  const sel = document.getElementById(BOOKMARK_LOCATION);
  if (sel) {
    const folder = await getFolderMap();
    const items = folder.values();
    let root;
    for (const item of items) {
      const { id, parentId } = item;
      if (!parentId) {
        root = id;
        break;
      }
    }
    if (root) {
      for (const item of items) {
        const { id, parentId, title } = item;
        if (parentId === root) {
          const elm = document.createElement('option');
          elm.textContent = title;
          elm.id = id;
          elm.value = id;
          sel.appendChild(elm);
        }
      }
    }
  }
};

/**
 * handle init custom theme click
 *
 * @param {object} evt - Event
 * @returns {Promise} - promise chain
 */
export const handleInitCustomThemeClick = evt => {
  const { currentTarget, target } = evt;
  evt.preventDefault();
  evt.stopPropagation();
  return initCustomTheme(currentTarget === target).catch(throwErr);
};

/**
 * add event listener to init custom theme button
 *
 * @returns {Promise.<void>} - void
 */
export const addInitCustomThemeListener = async () => {
  const elm = document.getElementById(THEME_CUSTOM_INIT);
  elm?.addEventListener('click', handleInitCustomThemeClick);
};

/* html */
/**
 * handle init extension click
 *
 * @param {!object} evt - event
 * @returns {Promise} - initExt()
 */
export const handleInitExtClick = evt => {
  const { currentTarget, target } = evt;
  evt.preventDefault();
  evt.stopPropagation();
  return initExt(currentTarget === target).catch(throwErr);
};

/**
 * add event listener to init button
 *
 * @returns {Promise.<void>} - void
 */
export const addInitExtensionListener = async () => {
  const elm = document.getElementById(EXT_INIT);
  elm?.addEventListener('click', handleInitExtClick);
};

/**
 *
 * save user CSS
 *
 * @returns {?Promise} - storePref() / logErr()
 */
export const saveUserCss = () => {
  const css = document.getElementById(USER_CSS);
  const warnMsg = document.getElementById(USER_CSS_WARN);
  let func;
  if (css && warnMsg) {
    const { value } = css;
    const userCss = value.trim();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(userCss);
    if (userCss === '' || sheet.cssRules.length) {
      let isValid = true;
      for (const i of sheet.cssRules) {
        const { style } = i;
        if (!style.cssText) {
          isValid = false;
          break;
        }
      }
      if (isValid) {
        warnMsg.setAttribute('hidden', 'hidden');
        func = storePref({
          target: css
        }).catch(throwErr);
      } else {
        warnMsg.removeAttribute('hidden');
      }
    } else {
      warnMsg.removeAttribute('hidden');
    }
  }
  return func || null;
};

/**
 * add event listener to save user CSS
 *
 * @returns {Promise.<void>} - void
 */
export const addUserCssListener = async () => {
  const elm = document.getElementById(USER_CSS_SAVE);
  elm?.addEventListener('click', saveUserCss);
};

/**
 * handle input change
 *
 * @param {!object} evt - Event
 * @returns {Promise} - storePref()
 */
export const handleInputChange = evt => storePref(evt).catch(throwErr);

/**
 * add event listener to input elements
 *
 * @returns {Promise.<void>} - void
 */
export const addInputChangeListener = async () => {
  const nodes = document.querySelectorAll('input, select');
  const func = [];
  for (const node of nodes) {
    node.addEventListener('change', handleInputChange);
    if (node.id === USER_CSS_USE) {
      node.addEventListener('change', toggleSubItems);
    }
  }
  await Promise.all(func);
};

/**
 * set html input value
 *
 * @param {object} data - storage data
 * @returns {Promise.<Array>} - results of each handler
 */
export const setHtmlInputValue = async (data = {}) => {
  const { checked, id, value } = data;
  const elm = id && document.getElementById(id);
  const func = [];
  if (elm) {
    const { localName, type } = elm;
    switch (type) {
      case 'checkbox':
      case 'radio': {
        elm.checked = !!checked;
        if (id === THEME_CUSTOM || id === USER_CSS_USE) {
          func.push(toggleSubItems({
            target: {
              checked, id
            }
          }));
        }
        break;
      }
      case 'color':
      case 'text':
      case 'url': {
        elm.value = isString(value) ? value.trim() : '';
        break;
      }
      default: {
        if (localName === 'select' && id === BOOKMARK_LOCATION && value) {
          const child = elm.querySelector(`#${value.trim()}`);
          child?.setAttribute('selected', 'selected');
        } else if (localName === 'textarea' && id === USER_CSS) {
          const css = document.getElementById(USER_CSS);
          css.value = isString(value) ? value.trim() : '';
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * set html input values from storage
 *
 * @returns {Promise.<Array>} - results of each handler
 */
export const setValuesFromStorage = async () => {
  const func = [];
  const pref = await getAllStorage();
  if (isObjectNotEmpty(pref)) {
    const items = Object.entries(pref);
    for (const [key, value] of items) {
      if (isObjectNotEmpty(value)) {
        switch (key) {
          case THEME_CUSTOM_DARK:
          case THEME_CUSTOM_LIGHT: {
            const themeColors = Object.entries(value);
            for (const [prop, val] of themeColors) {
              func.push(setHtmlInputValue({
                id: prop,
                value: val
              }));
            }
            break;
          }
          default: func.push(setHtmlInputValue(value));
        }
      }
    }
  }
  return Promise.all(func);
};

/* runtime message */
/**
 * handle runtime message
 *
 * @param {!object} msg - message
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleMsg = async msg => {
  const items = Object.entries(msg);
  const func = [];
  for (const [key, value] of items) {
    switch (key) {
      case THEME_CUSTOM_SETTING:
        if (value) {
          func.push(setCustomThemeValue(value));
        }
        break;
      default:
    }
  }
  return Promise.all(func);
};

/* For test */
export { folderMap } from './bookmark.js';
