/**
 * common.js
 */

/* constants */
const TYPE_FROM = 8;
const TYPE_TO = -1;

/**
 * log error
 *
 * @param {!object} e - Error
 * @returns {boolean} - false
 */
export const logErr = e => {
  if (e?.message) {
    console.error(e.message);
  } else {
    console.error(e);
  }
  return false;
};

/**
 * throw error
 *
 * @param {!object} e - Error
 * @throws
 */
export const throwErr = e => {
  logErr(e);
  throw e;
};

/**
 * log warn
 *
 * @param {*} msg - message
 * @returns {boolean} - false
 */
export const logWarn = msg => {
  if (msg) {
    console.warn(msg);
  }
  return false;
};

/**
 * log message
 *
 * @param {*} msg - message
 * @returns {object} - message
 */
export const logMsg = msg => {
  if (msg) {
    console.log(msg);
  }
  return msg;
};

/**
 * get type
 *
 * @param {*} o - object to check
 * @returns {string} - type of object
 */
export const getType = o =>
  Object.prototype.toString.call(o).slice(TYPE_FROM, TYPE_TO);

/**
 * is string
 *
 * @param {*} o - object to check
 * @returns {boolean} - result
 */
export const isString = o => typeof o === 'string' || o instanceof String;

/**
 * is object, and not an empty object
 *
 * @param {*} o - object to check;
 * @returns {boolean} - result
 */
export const isObjectNotEmpty = o => {
  const items = /Object/i.test(getType(o)) && Object.keys(o);
  return !!(items?.length);
};

/**
 * sleep
 *
 * @param {number} msec - millisecond
 * @param {boolean} doReject - reject instead of resolve
 * @returns {?Promise} - resolve / reject
 */
export const sleep = (msec = 0, doReject = false) => {
  let func;
  if (Number.isInteger(msec) && msec >= 0) {
    func = new Promise((resolve, reject) => {
      if (doReject) {
        setTimeout(reject, msec);
      } else {
        setTimeout(resolve, msec);
      }
    });
  }
  return func || null;
};

/**
 * add contenteditable attribute to element
 *
 * @param {object} elm - Element
 * @param {boolean} [focus] - focus Element
 * @returns {object} elm - Element
 */
export const addElementContentEditable = (elm, focus) => {
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    elm.setAttribute('contenteditable', 'true');
    if (focus) {
      elm.focus();
    }
  }
  return elm || null;
};

/**
 * remove contenteditable attribute from element
 *
 * @param {object} elm - Element
 * @returns {object} elm - Element
 */
export const removeElementContentEditable = elm => {
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    elm.removeAttribute('contenteditable');
  }
  return elm || null;
};

/**
 * set element dataset
 *
 * @param {object} elm - Element
 * @param {string} key - dataset key
 * @param {string} value - dataset value
 * @returns {object} - Element
 */
export const setElementDataset = (elm, key, value) => {
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      isString(key) && isString(value)) {
    elm.dataset[key] = value;
  }
  return elm;
};
