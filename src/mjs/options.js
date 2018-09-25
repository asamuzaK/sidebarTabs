/**
 * options.js
 */

import {isObjectNotEmpty, isString, throwErr} from "./common.js";
import {getAllStorage, sendMessage, setStorage} from "./browser.js";
import {localizeHtml} from "./localize.js";
import {EXT_INIT} from "./constant.js";

/**
 * send message
 * @param {*} msg - message
 * @returns {void}
 */
const sendMsg = async msg => {
  msg && sendMessage(null, msg);
};

/**
 * port init extension
 * @param {boolean} init - init
 * @returns {?AsyncFunction} - port message
 */
const portInitExt = async (init = false) =>
  init && sendMsg({
    [EXT_INIT]: !!init,
  }) || null;

/**
 * create pref
 * @param {Object} elm - element
 * @returns {Object} - pref data
 */
const createPref = async (elm = {}) => {
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
const storePref = async evt => {
  const {target} = evt;
  const {name, type} = target;
  const func = [];
  if (type === "radio") {
    const nodes = document.querySelectorAll(`[name=${name}]`);
    if (nodes instanceof NodeList) {
      for (const node of nodes) {
        func.push(createPref(node).then(setStorage));
      }
    }
  } else {
    func.push(createPref(target).then(setStorage));
  }
  return Promise.all(func);
};

/* html */
/**
 * add event listener to init button
 * @returns {void}
 */
const addInitExtensionListener = async () => {
  const elm = document.getElementById(EXT_INIT);
  if (elm) {
    elm.addEventListener("click", evt => {
      const {currentTarget, target} = evt;
      evt.preventDefault();
      evt.stopPropagation();
      return portInitExt(currentTarget === target).catch(throwErr);
    });
  }
};

/**
 * add event listener to input elements
 * @returns {void}
 */
const addInputChangeListener = async () => {
  const nodes = document.querySelectorAll("input");
  if (nodes instanceof NodeList) {
    for (const node of nodes) {
      node.addEventListener("change", evt => storePref(evt).catch(throwErr));
    }
  }
};

/**
 * set html input value
 * @param {Object} data - storage data
 * @returns {void}
 */
const setHtmlInputValue = async (data = {}) => {
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
const setValuesFromStorage = async () => {
  const func = [];
  const pref = await getAllStorage();
  if (isObjectNotEmpty(pref)) {
    const items = Object.values(pref);
    for (const item of items) {
      isObjectNotEmpty(item) && func.push(setHtmlInputValue(item));
    }
  }
  return Promise.all(func);
};

/* startup */
Promise.all([
  localizeHtml(),
  setValuesFromStorage(),
  addInputChangeListener(),
  addInitExtensionListener(),
]).catch(throwErr);
