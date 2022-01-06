/**
 * common.js
 */

/* constants */
const TYPE_FROM = 8;
const TYPE_TO = -1;
const VERSION_PART =
  '(?:0|[1-9]\\d{0,3}|[1-5]\\d{4}|6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5]))))';
const PRE_PART = '(?:e(\\d+)?[A-z]+|[A-df-z][A-z]*)(?:-?[A-z\\d]+)*|[A-z]+';
const VERSION_TOOLKIT =
  `(${VERSION_PART}(?:\\.${VERSION_PART}){0,3})(${PRE_PART})?`;
const VERSION_TOOLKIT_REGEXP = new RegExp(`^(?:${VERSION_TOOLKIT})$`);

/**
 * log error
 *
 * @param {!object} e - Error
 * @returns {boolean} - false
 */
export const logErr = e => {
  if (e && e.message) {
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
  return !!(items && items.length);
};

/**
 * stringify positive integer
 *
 * @param {number} i - integer
 * @param {boolean} zero - treat 0 as a positive integer
 * @returns {?string} - stringified integer
 */
export const stringifyPositiveInt = (i, zero = false) => {
  let str;
  if (Number.isSafeInteger(i) && (i > 0 || (zero && i === 0))) {
    str = `${i}`;
  }
  return str || null;
};

/**
 * parse stringified integer
 *
 * @param {string} i - stringified integer
 * @param {boolean} [zero] - accept leading zero
 * @returns {number} - integer
 */
export const parseStringifiedInt = (i, zero = false) => {
  if (!isString(i)) {
    throw new TypeError(`Expected String but got ${getType(i)}.`);
  }
  if (!zero && !/^-?(?:0|[1-9]\d*)$/.test(i)) {
    throw new Error(`${i} is not a stringified integer.`);
  }
  return parseInt(i);
};

/**
 * escape all matching chars
 *
 * @param {string} str - argument
 * @param {RegExp} re - RegExp
 * @returns {?string} - string
 */
export const escapeMatchingChars = (str, re) => {
  if (!isString(str)) {
    throw new TypeError(`Expected String but got ${getType(str)}.`);
  }
  if (!(re instanceof RegExp)) {
    throw new TypeError(`Expected RegExp but got ${getType(str)}.`);
  }
  return re.global ? str.replace(re, (m, c) => `\\${c}`) : null;
};

/**
 * is valid Toolkit version string
 *
 * @param {string} version - version string
 * @returns {boolean} - result
 */
export const isValidToolkitVersion = version => {
  if (!isString(version)) {
    throw new TypeError(`Expected String but got ${getType(version)}.`);
  }
  return VERSION_TOOLKIT_REGEXP.test(version);
};

/**
 * parse version string
 *
 * @param {string} version - version string
 * @returns {object}
 *   - result which contains properties below
 *     version {string} - given version string
 *     major {number} - major version
 *     minor {number|undefined} - minor version
 *     patch {number|undefined} - patch version
 *     build {number|undefined} - build version
 *     pre {Array<string|number>|undefined} - pre release version in array
 */
export const parseVersion = version => {
  if (!isString(version)) {
    throw new TypeError(`Expected String but got ${getType(version)}.`);
  }
  if (!isValidToolkitVersion(version)) {
    throw new Error(`${version} does not match toolkit format.`);
  }
  const [, vRelease, vPre] = version.match(VERSION_TOOLKIT_REGEXP);
  const [major, minor, patch, build] =
    vRelease.split('.').map(parseStringifiedInt);
  let pre;
  if (vPre) {
    pre = [vPre];
  }
  return {
    version, major, minor, patch, build, pre
  };
};

/**
 * remove query string from URI
 *
 * @param {string} uri - URI
 * @returns {string} - replaced URI
 */
export const removeQueryFromURI = uri => {
  if (isString(uri)) {
    const query = /\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-F]{2})*/;
    uri = uri.replace(query, '');
  }
  return uri;
};

/**
 * sleep
 *
 * @param {number} msec - millisecond
 * @param {boolean} doReject - reject instead of resolve
 * @returns {?Function} - resolve / reject
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
 * @param {boolean} focus - focus Element
 * @returns {object} elm - Element
 */
export const addElementContentEditable = (elm, focus) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.setAttribute('contenteditable', 'true');
    focus && elm.focus();
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      isString(key) && isString(value)) {
    elm.dataset[key] = value;
  }
  return elm;
};
