/**
 * tab-util.js
 */

import {
  createBookmark, reloadTab, removeTab, updateTab,
} from "./browser.js";
import {CLASS_TAB_GROUP, PINNED, TAB_QUERY} from "./constant.js";

/* constants */

/**
 * reload all tabs
 * @returns {Promise.<Array>} - results of each handler
 */
export const reloadAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(TAB_QUERY);
  for (const item of items) {
    const itemId = item && item.dataset && item.dataset.tabId * 1;
    Number.isInteger(itemId) && func.push(reloadTab(itemId));
  }
  return Promise.all(func);
};

/**
 * reload tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
export const reloadTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      const itemId = item && item.dataset && item.dataset.tabId * 1;
      Number.isInteger(itemId) && func.push(reloadTab(itemId));
    }
  }
  return Promise.all(func);
};

/**
 * bookmark all tabs
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
  for (const item of items) {
    const itemTab = item.dataset && item.dataset.tab &&
                      JSON.parse(item.dataset.tab);
    const {title, url} = itemTab;
    func.push(createBookmark({title, url}));
  }
  return Promise.all(func);
};

/**
 * bookmark tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {classList} = container;
    if (classList.contains(CLASS_TAB_GROUP)) {
      const items = container.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
      for (const item of items) {
        const itemTab = item.dataset && item.dataset.tab &&
                          JSON.parse(item.dataset.tab);
        const {title, url} = itemTab;
        func.push(createBookmark({title, url}));
      }
    }
  }
  return Promise.all(func);
};

/**
 * close tab group
 * @param {Object} node - tab group container
 * @returns {?AsyncFunction} - removeTab()
 */
export const closeTabGroup = async node => {
  const {id, classList, nodeType} = node;
  let func;
  if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
      classList.contains(CLASS_TAB_GROUP)) {
    const items = node.querySelectorAll(TAB_QUERY);
    const arr = [];
    for (const item of items) {
      const {dataset} = item;
      const tabId = dataset && dataset.tabId && dataset.tabId * 1;
      Number.isInteger(tabId) && arr.push(tabId);
    }
    func = arr.length && removeTab(arr);
  }
  return func || null;
};

/**
 * pin tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
export const pinTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {classList} = container;
    if (classList.contains(CLASS_TAB_GROUP)) {
      const items = container.querySelectorAll(TAB_QUERY);
      if (items && items.length) {
        for (const item of items) {
          const tabId = item.dataset && item.dataset.tabId * 1;
          const tabsTab =
              item.dataset && item.dataset.tab && JSON.parse(item.dataset.tab);
          if (Number.isInteger(tabId) && tabsTab) {
            const {pinned} = tabsTab;
            func.push(updateTab(tabId, {pinned: !pinned}));
          }
        }
      }
    }
  }
  return Promise.all(func);
};
