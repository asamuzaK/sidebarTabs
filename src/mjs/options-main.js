/**
 * options.js
 */

import {
  isObjectNotEmpty, isString, throwErr,
} from "./common.js";
import {
  getAllStorage, removePermission, requestPermission, sendMessage, setStorage,
} from "./browser.js";

/* constant */
import {
  BROWSER_SETTINGS_ALLOW, EXT_INIT, THEME_CUSTOM, THEME_CUSTOM_INIT,
  THEME_CUSTOM_REQ, THEME_CUSTOM_SETTING, THEME_RADIO,
} from "./constant.js";

/**
 * send message
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
 * @param {boolean} init - init
 * @returns {?AsyncFunction} - sendMessage()
 */
export const initExt = async (init = false) => {
  let func;
  if (init) {
    func = sendMsg({
      [EXT_INIT]: !!init,
    });
  }
  return func || null;
};

/**
 * init custom theme
 * @param {boolean} init - init
 * @returns {?AsyncFunction} - sendMessage()
 */
export const initCustomTheme = async (init = false) => {
  let func;
  if (init) {
    func = sendMsg({
      [THEME_CUSTOM_INIT]: !!init,
    });
  }
  return func || null;
};

/**
 * request custom theme
 * @param {boolean} bool - bool
 * @returns {?AsyncFunction} - sendMessage()
 */
export const requestCustomTheme = async (bool = false) => {
  let func;
  if (bool) {
    func = sendMsg({
      [THEME_CUSTOM_REQ]: !!bool,
    });
  }
  return func || null;
};

/**
 * create pref
 * @param {Object} elm - element
 * @returns {Object} - pref data
 */
export const createPref = async (elm = {}) => {
  const {dataset, id} = elm;
  return id && {
    [id]: {
      id,
      checked: !!elm.checked,
      value: elm.value || "",
      subItemOf: dataset && dataset.subItemOf || null,
    },
  } || null;
};

/**
 * store pref
 * @param {!Object} evt - Event
 * @returns {Promise.<Array>} - results of each handler
 */
export const storePref = async evt => {
  const {target} = evt;
  const {checked, id, name, type} = target;
  const func = [];
  if (type === "radio") {
    const nodes = document.querySelectorAll(`[name=${name}]`);
    for (const node of nodes) {
      func.push(createPref(node).then(setStorage));
    }
  } else {
    switch (id) {
      case BROWSER_SETTINGS_ALLOW:
        if (checked) {
          target.checked = await requestPermission(["browserSettings"]);
        } else {
          await removePermission(["browserSettings"]);
        }
        func.push(createPref(target).then(setStorage));
        break;
      default:
        func.push(createPref(target).then(setStorage));
    }
  }
  return Promise.all(func);
};

/* custom theme */
/**
 * toggle custom theme settings
 * @param {!Object} evt - event
 * @returns {void}
 */
export const toggleCustomThemeSettings = evt => {
  const {target} = evt;
  const elm = document.getElementById(THEME_CUSTOM_SETTING);
  if (elm) {
    const {checked, id} = target;
    if (id === THEME_CUSTOM && checked) {
      elm.removeAttribute("hidden");
    } else {
      elm.setAttribute("hidden", "hidden");
    }
  }
};

/**
 * add event listener to custom theme radio button
 * @returns {void}
 */
export const addCustomThemeListener = async () => {
  const nodes = document.querySelectorAll(`input[name=${THEME_RADIO}]`);
  for (const node of nodes) {
    node.addEventListener("change", toggleCustomThemeSettings);
  }
};

/**
 * set custom theme value
 * @param {Object} obj - values
 * @returns {void}
 */
export const setCustomThemeValue = async (obj = {}) => {
  if (isObjectNotEmpty(obj)) {
    const items = Object.entries(obj);
    for (const [key, value] of items) {
      const elm = document.getElementById(key);
      if (elm) {
        const {type} = elm;
        if (type === "color" &&
            isString(value) && /^#[\da-f]{6}$/i.test(value)) {
          elm.value = value.toLowerCase();
        }
      }
    }
  }
};

/**
 * handle init custom theme click
 * @param {Object} evt - Event
 * @returns {Promise.<Array>} - result of each handler
 */
export const handleInitCustomThemeClick = evt => {
  const {currentTarget, target} = evt;
  evt.preventDefault();
  evt.stopPropagation();
  return initCustomTheme(currentTarget === target).catch(throwErr);
};

/**
 * add event listener to init custom theme button
 * @returns {void}
 */
export const addInitCustomThemeListener = async () => {
  const elm = document.getElementById(THEME_CUSTOM_INIT);
  if (elm) {
    elm.addEventListener("click", handleInitCustomThemeClick);
  }
};

/* html */
/**
 * handle init extension click
 * @param {!Object} evt - event
 * @returns {AsyncFunction} - initExt()
 */
export const handleInitExtClick = evt => {
  const {currentTarget, target} = evt;
  evt.preventDefault();
  evt.stopPropagation();
  return initExt(currentTarget === target).catch(throwErr);
};

/**
 * add event listener to init button
 * @returns {void}
 */
export const addInitExtensionListener = async () => {
  const elm = document.getElementById(EXT_INIT);
  if (elm) {
    elm.addEventListener("click", handleInitExtClick);
  }
};

/**
 * handle input change
 * @param {!Object} evt - Event
 * @returns {AsyncFunction} - storePref()
 */
export const handleInputChange = evt => storePref(evt).catch(throwErr);

/**
 * add event listener to input elements
 * @returns {void}
 */
export const addInputChangeListener = async () => {
  const nodes = document.querySelectorAll("input");
  for (const node of nodes) {
    node.addEventListener("change", handleInputChange);
  }
};

/**
 * set html input value
 * @param {Object} data - storage data
 * @returns {Promise.<Array>} - results of each handler
 */
export const setHtmlInputValue = async (data = {}) => {
  const {checked, id, value} = data;
  const elm = id && document.getElementById(id);
  const func = [];
  if (elm) {
    const {type} = elm;
    switch (type) {
      case "checkbox":
      case "radio":
        elm.checked = !!checked;
        if (id === THEME_CUSTOM) {
          func.push(toggleCustomThemeSettings({
            target: {
              checked, id,
            },
          }));
        }
        break;
      case "color":
      case "text":
      case "url":
        elm.value = isString(value) && value || "";
        break;
      default:
    }
  }
  return Promise.all(func);
};

/**
 * set html input values from storage
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
 * @param {!Object} msg - message
 * @param {!Object} sender - sender
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
