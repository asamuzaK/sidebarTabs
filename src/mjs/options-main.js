/**
 * options.js
 */

import {
  isObjectNotEmpty, isString, throwErr,
} from "./common.js";
import {
  getAllStorage, sendMessage, setStorage,
} from "./browser.js";

/* constant */
import {EXT_INIT} from "./constant.js";

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
  const {name, type} = target;
  const func = [];
  if (type === "radio") {
    const nodes = document.querySelectorAll(`[name=${name}]`);
    for (const node of nodes) {
      func.push(createPref(node).then(setStorage));
    }
  } else {
    func.push(createPref(target).then(setStorage));
  }
  return Promise.all(func);
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
 * @returns {void}
 */
export const setHtmlInputValue = async (data = {}) => {
  const {checked, id, value} = data;
  const elm = id && document.getElementById(id);
  if (elm) {
    const {type} = elm;
    switch (type) {
      case "checkbox":
      case "radio":
        elm.checked = !!checked;
        break;
      case "text":
      case "url":
        elm.value = isString(value) && value || "";
        break;
      default:
    }
  }
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