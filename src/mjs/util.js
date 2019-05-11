/*
 * util.js
 */

import {
  getType, isObjectNotEmpty, isString,
} from "./common.js";
import {
  getCurrentWindow, getSessionWindowValue, setSessionWindowValue, updateTab,
} from "./browser.js";

/* constants */
import {
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_GROUP,
  NEW_TAB, PINNED, TAB_LIST, TAB_QUERY,
} from "./constant.js";

/**
 * get template
 * @param {string} id - template ID
 * @returns {Object} - document fragment
 */
export const getTemplate = id => {
  if (!isString(id)) {
    throw new TypeError(`Expected String but got ${getType(id)}.`);
  }
  let frag;
  const tmpl = document.getElementById(id);
  if (tmpl) {
    const {content: {firstElementChild}} = tmpl;
    frag = document.importNode(firstElementChild, true);
  }
  return frag || null;
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
 * get sidebar tab IDs
 * @param {Array} nodes - array of node
 * @returns {Array} - array of tab IDs
 */
export const getSidebarTabIds = nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const arr = [];
  for (const item of nodes) {
    const tabId = getSidebarTabId(item);
    if (Number.isInteger(tabId)) {
      arr.push(tabId);
    }
  }
  return arr;
};

/**
 * get sidebar tab index
 * @param {Object} node - node
 * @returns {?number} - index
 */
export const getSidebarTabIndex = node => {
  let index;
  const tab = getSidebarTab(node);
  if (tab) {
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
 * @returns {Array} - array of tabs
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
 * is newtab
 * @param {Object} node - node
 * @returns {boolean} - result
 */
export const isNewTab = node => {
  let tab;
  while (node && node.parentNode) {
    const {id, parentNode} = node;
    if (id === NEW_TAB) {
      tab = node;
      break;
    }
    node = parentNode;
  }
  return !!tab;
};

/**
 * get tab list from sessions
 * @param {string} key - key
 * @returns {Object} - tab list
 */
export const getSessionTabList = async key => {
  if (!isString(key)) {
    throw new TypeError(`Expected String but got ${getType(key)}.`);
  }
  let tabList;
  const win = await getCurrentWindow();
  const {id: windowId} = win;
  const value = await getSessionWindowValue(key, windowId);
  if (isString(value)) {
    tabList = JSON.parse(value);
  }
  return tabList || null;
};

/**
 * set tab list to sessions
 * @returns {void}
 */
export const setSessionTabList = async () => {
  const win = await getCurrentWindow();
  const {id: windowId, incognito} = win;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  if (!incognito && allTabs.length) {
    const tabList = {
      recent: {},
    };
    const items =
      document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
    const prevList = await getSessionTabList(TAB_LIST);
    const l = items.length;
    let i = 0;
    while (i < l) {
      const item = items[i];
      const collapsed = item.classList.contains(CLASS_TAB_COLLAPSED);
      const childTabs = item.querySelectorAll(TAB_QUERY);
      for (const tab of childTabs) {
        const tabsTab = tab.dataset.tab;
        const {url} = JSON.parse(tabsTab);
        const tabIndex = getSidebarTabIndex(tab);
        tabList.recent[tabIndex] = {
          collapsed, url,
          containerIndex: i,
        };
      }
      i++;
    }
    if (isObjectNotEmpty(prevList) && prevList.hasOwnProperty("recent")) {
      tabList.prev = prevList.recent;
    }
    await setSessionWindowValue(TAB_LIST, JSON.stringify(tabList), windowId);
  }
};

/**
 * activate tab
 * @param {Object} elm - element
 * @returns {?AsyncFunction} - updateTab()
 */
export const activateTab = async elm => {
  const tabId = getSidebarTabId(elm);
  let func;
  if (Number.isInteger(tabId)) {
    func = updateTab(tabId, {
      active: true,
    });
  }
  return func || null;
};

/**
 * scroll tab into view
 * @param {Object} elm - Element
 * @returns {void}
 */
export const scrollTabIntoView = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabsTab = elm.dataset.tab;
    if (tabsTab) {
      const {active, openerTabId} = JSON.parse(tabsTab);
      if (active || Number.isInteger(openerTabId)) {
        const pinned = document.getElementById(PINNED);
        const newTab = document.getElementById(NEW_TAB);
        const {bottom: pinnedBottom} = pinned.getBoundingClientRect();
        const {top: newTabTop} = newTab.getBoundingClientRect();
        const {bottom: tabBottom, top: tabTop} = elm.getBoundingClientRect();
        const viewTop = Number.isInteger(openerTabId) && tabTop < pinnedBottom;
        const behavior = viewTop && "auto" || "smooth";
        if (viewTop || tabBottom > newTabTop) {
          elm.scrollIntoView({
            behavior,
            block: "center",
          });
        }
      }
    }
  }
};
