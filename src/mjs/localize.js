/**
 * localize.js
 */

import {isString} from "./common.js";
import {DATA_I18N, EXT_LOCALE, NEW_TAB} from "./constant.js";

/* api */
const {i18n} = browser;

/**
 * localize attribute value
 * @param {Object} elm - element
 * @param {string|Array.<string>} placeholders - placeholders for localization
 * @returns {void}
 */
export const localizeAttr = async (elm, placeholders) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.hasAttributes()) {
    const attrs = {
      alt: "alt",
      ariaLabel: "aria-label",
      href: "href",
      placeholder: "placeholder",
      title: "title",
    };
    const dataAttr = elm.getAttribute(DATA_I18N);
    const items = Object.entries(attrs);
    for (const item of items) {
      const [key, value] = item;
      if (elm.hasAttribute(value)) {
        if ((isString(placeholders) || Array.isArray(placeholders)) &&
            placeholders.length) {
          elm.setAttribute(
            value,
            i18n.getMessage(`${dataAttr}_${key}`, placeholders)
          );
        } else {
          elm.setAttribute(value, i18n.getMessage(`${dataAttr}_${key}`));
        }
      }
    }
  }
};

/**
 * localize html
 * @returns {void}
 */
export const localizeHtml = async () => {
  const lang = i18n.getMessage(EXT_LOCALE);
  if (lang) {
    document.documentElement.setAttribute("lang", lang);
    const nodes = document.querySelectorAll(`[${DATA_I18N}]`);
    if (nodes instanceof NodeList) {
      for (const node of nodes) {
        const {classList, localName, parentNode} = node;
        const {accessKey} = parentNode;
        const attr = node.getAttribute(DATA_I18N);
        const data = accessKey &&
                     i18n.getMessage(`${attr}_title`, `(${accessKey})`) ||
                     i18n.getMessage(attr);
        if (data && localName !== "img" && !classList.contains(NEW_TAB)) {
          node.textContent = data;
        }
        if (node.hasAttributes()) {
          localizeAttr(node, `(${accessKey})`);
        }
      }
    }
  }
};
