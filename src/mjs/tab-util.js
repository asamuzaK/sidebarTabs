/**
 * tab-util.js
 */

import {isString} from "./common.js";
import {
  getCurrentWindow, getSessionWindowValue, setSessionWindowValue,
} from "./browser.js";
import {
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_GROUP,
  NEW_TAB, TAB_LIST, TAB_QUERY,
} from "./constant.js";

/**
 * get template
 * @param {string} id - template ID
 * @returns {Object} - document fragment
 */
export const getTemplate = id => {
  const tmpl = document.getElementById(id);
  const {content: {firstElementChild}} = tmpl;
  return document.importNode(firstElementChild, true);
};

/**
 * get sidebar tab container from parent node
 * @param {Object} node - node
 * @returns {Object} - sidebar tab container
 */
export const getSidebarTabContainer = node => {
  let container;
  while (node && node.parentNode) {
    const {classList, parentNode} = node;
    if (classList.contains(CLASS_TAB_CONTAINER)) {
      container = node;
      break;
    }
    node = parentNode;
  }
  return container || null;
};

/**
 * restore sidebar tab container
 * @param {Object} container - tab container
 * @returns {void}
 */
export const restoreTabContainer = container => {
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {childElementCount, classList, parentNode} = container;
    switch (childElementCount) {
      case 0:
        parentNode.removeChild(container);
        break;
      case 1:
        classList.remove(CLASS_TAB_GROUP);
        break;
      default:
    }
  }
};

/**
 * get sidebar tab from parent node
 * @param {Object} node - node
 * @returns {Object} - sidebar tab
 */
export const getSidebarTab = node => {
  let tab;
  while (node && node.parentNode) {
    const {dataset, parentNode} = node;
    if (dataset.tabId) {
      tab = node;
      break;
    }
    node = parentNode;
  }
  return tab || null;
};

/**
 * get sidebar tab ID
 * @param {Object} node - node
 * @returns {?number} - tab ID
 */
export const getSidebarTabId = node => {
  let tabId;
  while (node && node.parentNode) {
    const {dataset, parentNode} = node;
    if (dataset.tabId) {
      tabId = dataset.tabId * 1;
      break;
    }
    node = parentNode;
  }
  return tabId || null;
};

/**
 * get sidebar tab index
 * @param {Object} tab - tab
 * @returns {?number} - index
 */
export const getSidebarTabIndex = tab => {
  let index;
  if (tab && tab.nodeType === Node.ELEMENT_NODE) {
    const items = document.querySelectorAll(TAB_QUERY);
    const l = items.length;
    let i = 0;
    while (i < l && !Number.isInteger(index)) {
      if (items[i] === tab) {
        index = i;
        break;
      }
      i++;
    }
  }
  return Number.isInteger(index) ?
    index :
    null;
};

/**
 * get tabs in range
 * @param {Object} tabA - tab A
 * @param {Object} tabB - tab B
 * @returns {Array} - Array of tabs
 */
export const getTabsInRange = async (tabA, tabB) => {
  const tabAIndex = getSidebarTabIndex(tabA);
  const tabBIndex = getSidebarTabIndex(tabB);
  const arr = [];
  if (Number.isInteger(tabAIndex) && Number.isInteger(tabBIndex)) {
    const items = document.querySelectorAll(TAB_QUERY);
    let fromIndex, toIndex;
    if (tabAIndex > tabBIndex) {
      fromIndex = tabBIndex;
      toIndex = tabAIndex;
    } else {
      fromIndex = tabAIndex;
      toIndex = tabBIndex;
    }
    for (let i = fromIndex; i <= toIndex; i++) {
      arr.push(items[i]);
    }
  }
  return arr;
};

/**
 * get tab list from sessions
 * @param {string} key - key
 * @returns {Object} - tab list
 */
export const getSessionTabList = async key => {
  const win = await getCurrentWindow({
    populate: true,
  });
  let tabList;
  if (win && isString(key)) {
    const {id: windowId} = win;
    tabList = await getSessionWindowValue(key, windowId);
    if (tabList) {
      tabList = JSON.parse(tabList);
    }
  }
  return tabList || null;
};

/**
 * set tab list to sessions
 * @returns {void}
 */
export const setSessionTabList = async () => {
  const win = await getCurrentWindow({
    populate: true,
  });
  if (win) {
    const {id: windowId, incognito} = win;
    const tabLength = document.querySelectorAll(TAB_QUERY).length;
    if (!incognito && tabLength) {
      const tabList = {};
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
      const l = items.length;
      let i = 0;
      while (i < l) {
        const item = items[i];
        const childTabs = item.querySelectorAll(TAB_QUERY);
        const tabCollapsed = item.classList.contains(CLASS_TAB_COLLAPSED);
        for (const tab of childTabs) {
          const tabsTab = tab.dataset && tab.dataset.tab;
          if (tabsTab) {
            const {url} = JSON.parse(tabsTab);
            const tabIndex = getSidebarTabIndex(tab);
            if (Number.isInteger(tabIndex)) {
              tabList[tabIndex] = {
                tabCollapsed, url,
                containerIndex: i,
              };
            }
          }
        }
        i++;
      }
      await setSessionWindowValue(TAB_LIST, JSON.stringify(tabList), windowId);
    }
  }
};
