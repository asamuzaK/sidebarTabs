/**
 * options.js
 */
"use strict";
{
  /* api */
  const {i18n, storage, runtime} = browser;

  /* constants */
  const DATA_ATTR_I18N = "data-i18n";
  const LANG = "extensionLocale";
  const EXT_INIT = "initExtension";
  const TYPE_FROM = 8;
  const TYPE_TO = -1;

  /**
   * throw error
   * @param {!Object} e - Error
   * @throws - Error
   */
  const throwErr = e => {
    throw e;
  };

  /**
   * get type
   * @param {*} o - object to check
   * @returns {string} - type of object
   */
  const getType = o =>
    Object.prototype.toString.call(o).slice(TYPE_FROM, TYPE_TO);

  /**
   * is string
   * @param {*} o - object to check
   * @returns {boolean} - result
   */
  const isString = o => typeof o === "string" || o instanceof String;

  /**
   * is object, and not an empty object
   * @param {*} o - object to check;
   * @returns {boolean} - result
   */
  const isObjectNotEmpty = o => {
    const items = /Object/i.test(getType(o)) && Object.keys(o);
    return !!(items && items.length);
  };

  /**
   * send message
   * @param {*} msg - message
   * @returns {void}
   */
  const sendMsg = async msg => {
    msg && runtime.sendMessage(msg);
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
   * set storage
   * @param {Object} obj - object to store
   * @returns {?AsyncFunction} - store object
   */
  const setStorage = async obj => obj && storage.local.set(obj) || null;

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
   * localize attribute value
   * @param {Object} elm - element
   * @returns {void}
   */
  const localizeAttr = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE &&
        elm.hasAttribute(DATA_ATTR_I18N)) {
      const [id] = elm.getAttribute(DATA_ATTR_I18N).split(/\s*,\s*/);
      if (id) {
        const attrs = {
          alt: "alt",
          ariaLabel: "aria-label",
          href: "href",
          placeholder: "placeholder",
          title: "title",
        };
        const items = Object.entries(attrs);
        for (const item of items) {
          const [key, value] = item;
          elm.hasAttribute(value) &&
            elm.setAttribute(value, i18n.getMessage(`${id}_${key}`));
        }
      }
    }
  };

  /**
   * localize html
   * @returns {void}
   */
  const localizeHtml = async () => {
    const lang = i18n.getMessage(LANG);
    if (lang) {
      const nodes = document.querySelectorAll(`[${DATA_ATTR_I18N}]`);
      if (nodes instanceof NodeList) {
        for (const node of nodes) {
          const [id, ph] = node.getAttribute(DATA_ATTR_I18N).split(/\s*,\s*/);
          const data = i18n.getMessage(id, ph);
          data && (node.textContent = data);
          node.hasAttributes() && localizeAttr(node);
        }
      }
      document.documentElement.setAttribute("lang", lang);
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
    const pref = await storage.local.get();
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
}
