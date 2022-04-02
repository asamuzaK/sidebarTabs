/**
 * options.js
 */

/* shared */
import { isObjectNotEmpty, isString, logErr, throwErr } from './common.js';
import {
  clearContextMenuOnMouseup, getAllStorage, getStorage, removePermission,
  requestPermission, sendMessage, setContextMenuOnMouseup, setStorage
} from './browser.js';
import { getFolderMap } from './bookmark.js';
import { parse as cssParser }from '../lib/css/csstree.esm.js';
import {
  BOOKMARK_LOCATION, BROWSER_SETTINGS_READ, EXT_INIT, MENU_SHOW_MOUSEUP,
  THEME_CUSTOM, THEME_CUSTOM_INIT, THEME_CUSTOM_REQ, THEME_CUSTOM_SETTING,
  THEME_ID, THEME_LIST, THEME_RADIO,
  USER_CSS, USER_CSS_SAVE, USER_CSS_USE, USER_CSS_WARN
} from './constant.js';

/**
 * send message
 *
 * @param {*} msg - message
 * @returns {void}
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
 * @returns {?Function} - sendMessage()
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
 * @param {boolean} init - init
 * @returns {?Function} - sendMessage()
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
 * @returns {?Function} - sendMessage()
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
 * @returns {object} - custom theme data
 */
export const storeCustomTheme = async () => {
  const themeId = document.getElementById(THEME_ID);
  const storeId = themeId && themeId.value;
  let data;
  if (storeId) {
    const items = document.querySelectorAll('[type=color]');
    const themeValues = {};
    for (const item of items) {
      const { id, value } = item;
      themeValues[id] = value;
    }
    let { themeList } = await getStorage(THEME_LIST);
    if (!themeList) {
      themeList = {};
    }
    themeList[storeId] = {
      id: storeId,
      values: themeValues
    };
    data = {
      [THEME_LIST]: themeList
    };
  }
  return data || null;
};

/**
 * create pref
 *
 * @param {object} elm - element
 * @returns {object} - pref data
 */
export const createPref = async (elm = {}) => {
  const { dataset, id } = elm;
  const data = id && {
    [id]: {
      id,
      checked: !!elm.checked,
      value: elm.value || '',
      subItemOf: (dataset && dataset.subItemOf) || null
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
          !res && window.alert('Failed to modify value.');
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
 * @returns {?Function} - toggleSubItems()
 */
export const toggleCustomThemeSettings = () => {
  const target = document.getElementById(THEME_CUSTOM);
  let func;
  if (target) {
    func = toggleSubItems({
      target
    });
  }
  return func || null;
};

/**
 * add event listener to custom theme radio button
 *
 * @returns {void}
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
 * @returns {void}
 */
export const setCustomThemeValue = async (obj = {}) => {
  if (isObjectNotEmpty(obj)) {
    const { id, values } = obj;
    const themeId = document.getElementById(THEME_ID);
    if (themeId) {
      themeId.value = id || '';
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
 * @returns {void}
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
 * @returns {Promise.<Array>} - result of each handler
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
 * @returns {void}
 */
export const addInitCustomThemeListener = async () => {
  const elm = document.getElementById(THEME_CUSTOM_INIT);
  if (elm) {
    elm.addEventListener('click', handleInitCustomThemeClick);
  }
};

/* html */
/**
 * handle init extension click
 *
 * @param {!object} evt - event
 * @returns {Function} - initExt()
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
 * @returns {void}
 */
export const addInitExtensionListener = async () => {
  const elm = document.getElementById(EXT_INIT);
  elm && elm.addEventListener('click', handleInitExtClick);
};

/**
 *
 * save user CSS
 *
 * @returns {?Function} - storePref() / logErr()
 */
export const saveUserCss = () => {
  const css = document.getElementById(USER_CSS);
  const msg = document.getElementById(USER_CSS_WARN);
  let func;
  if (css && msg) {
    const { value } = css;
    try {
      cssParser(value, {
        onParseError(e) {
          throw e;
        }
      });
      msg.setAttribute('hidden', 'hidden');
      func = storePref({
        target: css
      }).catch(throwErr);
    } catch (e) {
      msg.removeAttribute('hidden');
      func = logErr(e);
    }
  }
  return func || null;
};

/**
 * add event listener to save user CSS
 *
 * @returns {void}
 */
export const addUserCssListener = async () => {
  const elm = document.getElementById(USER_CSS_SAVE);
  elm && elm.addEventListener('click', saveUserCss);
};

/**
 * handle input change
 *
 * @param {!object} evt - Event
 * @returns {Function} - storePref()
 */
export const handleInputChange = evt => storePref(evt).catch(throwErr);

/**
 * add event listener to input elements
 *
 * @returns {void}
 */
export const addInputChangeListener = async () => {
  const nodes = document.querySelectorAll('input, select');
  const func = [];
  for (const node of nodes) {
    node.addEventListener('change', handleInputChange);
    node.id === USER_CSS_USE &&
      node.addEventListener('change', toggleSubItems);
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
        elm.value = isString(value) ? value : '';
        break;
      }
      default: {
        if (localName === 'select' && id === BOOKMARK_LOCATION && value) {
          const child = elm.querySelector(`#${value}`);
          child && child.setAttribute('selected', 'selected');
        } else if (localName === 'textarea' && id === USER_CSS) {
          const css = document.getElementById(USER_CSS);
          css.value = isString(value) ? value : '';
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
    const items = Object.values(pref);
    for (const item of items) {
      if (isObjectNotEmpty(item)) {
        func.push(setHtmlInputValue(item));
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
