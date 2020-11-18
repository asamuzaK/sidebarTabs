/**
 * options.js
 */

/* shared */
import { isObjectNotEmpty, isString, throwErr } from './common.js';
import {
  getAllStorage, clearContextMenuOnMouseup, removePermission,
  requestPermission, sendMessage, setContextMenuOnMouseup, setStorage
} from './browser.js';
import {
  BROWSER_SETTINGS_READ, EXT_INIT, MENU_SHOW_MOUSEUP, THEME_CUSTOM,
  THEME_CUSTOM_INIT, THEME_CUSTOM_REQ, THEME_CUSTOM_SETTING, THEME_RADIO
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

/* custom theme */
/**
 * toggle custom theme settings
 *
 * @param {!object} evt - event
 * @returns {void}
 */
export const toggleCustomThemeSettings = evt => {
  const { target } = evt;
  const elm = document.getElementById(THEME_CUSTOM_SETTING);
  if (elm) {
    const { checked, id } = target;
    if (id === THEME_CUSTOM && checked) {
      elm.removeAttribute('hidden');
    } else {
      elm.setAttribute('hidden', 'hidden');
    }
  }
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
    const items = Object.entries(obj);
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
  if (elm) {
    elm.addEventListener('click', handleInitExtClick);
  }
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
  const nodes = document.querySelectorAll('input');
  for (const node of nodes) {
    node.addEventListener('change', handleInputChange);
  }
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
    const { type } = elm;
    switch (type) {
      case 'checkbox':
      case 'radio':
        elm.checked = !!checked;
        if (id === THEME_CUSTOM) {
          func.push(toggleCustomThemeSettings({
            target: {
              checked, id
            }
          }));
        }
        break;
      case 'color':
      case 'text':
      case 'url':
        elm.value = isString(value) ? value : '';
        break;
      default:
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
