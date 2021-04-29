/**
 * browser-tabs.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import {
  createBookmark, createNewWindow, createTab, getActiveTab, getTab,
  highlightTab, moveTab, reloadTab, removeTab, updateTab
} from './browser.js';
import {
  getSidebarTab, getSidebarTabId, getSidebarTabIds, getSidebarTabIndex,
  getTemplate
} from './util.js';
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP, NEW_TAB, PINNED, TAB_QUERY
} from './constant.js';

/* api */
const { windows } = browser;

/* bookmark */
/**
 * bookmark tabs
 *
 * @param {Array} nodes - array of node
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    if (item.nodeType === Node.ELEMENT_NODE) {
      const { dataset } = item;
      const itemTab = dataset.tab && JSON.parse(dataset.tab);
      if (itemTab) {
        const { title, url } = itemTab;
        func.push(createBookmark({ title, url }));
      }
    }
  }
  return Promise.all(func);
};

/* close */
/**
 * close tabs
 *
 * @param {Array} nodes - array of node
 * @returns {?Function} - removeTab()
 */
export const closeTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let func;
  const arr = getSidebarTabIds(nodes);
  if (arr.length) {
    func = removeTab(arr);
  }
  return func || null;
};

/**
 * close other tabs
 *
 * @param {Array} nodes - array of node
 * @returns {?Function} - removeTab()
 */
export const closeOtherTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let func;
  const tabIds = getSidebarTabIds(nodes);
  if (tabIds.length) {
    const items = document.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
    const arr = [];
    for (const item of items) {
      const itemId = getSidebarTabId(item);
      if (Number.isInteger(itemId) && !tabIds.includes(itemId)) {
        arr.push(itemId);
      }
    }
    if (arr.length) {
      func = removeTab(arr);
    }
  }
  return func || null;
};

/**
 * close tabs to the end
 *
 * @param {object} elm - element
 * @returns {?Function} - removeTab()
 */
export const closeTabsToEnd = async elm => {
  let func;
  const tabId = getSidebarTabId(elm);
  const index = getSidebarTabIndex(elm);
  const arr = [];
  if (Number.isInteger(tabId) && Number.isInteger(index)) {
    const items = document.querySelectorAll(
      `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`
    );
    for (const item of items) {
      const itemId = getSidebarTabId(item);
      const itemIndex = getSidebarTabIndex(item);
      if (Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
          itemIndex > index) {
        arr.push(itemId);
      }
    }
  }
  if (arr.length) {
    func = removeTab(arr);
  }
  return func || null;
};

/**
 * close tabs to the start
 *
 * @param {object} elm - element
 * @returns {?Function} - removeTab()
 */
export const closeTabsToStart = async elm => {
  let func;
  const tabId = getSidebarTabId(elm);
  const index = getSidebarTabIndex(elm);
  const arr = [];
  if (Number.isInteger(tabId) && Number.isInteger(index)) {
    const items = document.querySelectorAll(
      `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`
    );
    for (const item of items) {
      const itemId = getSidebarTabId(item);
      const itemIndex = getSidebarTabIndex(item);
      if (Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
          itemIndex < index) {
        arr.push(itemId);
      }
    }
  }
  if (arr.length) {
    func = removeTab(arr);
  }
  return func || null;
};

/* create */
/**
 * create tabs in order
 *
 * @param {Array} arr - array of option
 * @returns {?Function} - recurse createTabsInOrder()
 */
export const createTabsInOrder = async arr => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const opt = arr.shift();
  let func;
  if (isObjectNotEmpty(opt)) {
    await createTab(opt);
  }
  if (arr.length) {
    func = createTabsInOrder(arr);
  }
  return func;
};

/* contextual IDs */
/**
 * reopen tabs in container
 *
 * @param {Array} nodes - array of node
 * @param {string} cookieId - cookie store ID
 * @param {number} windowId - window ID
 * @returns {?Function} - createTabsInOrder()
 */
export const reopenTabsInContainer = async (nodes, cookieId, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!isString(cookieId)) {
    throw new TypeError(`Expected String but got ${getType(cookieId)}.`);
  }
  const opt = [];
  let arr = []; let func;
  for (const item of nodes) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      arr.push(getTab(itemId));
    }
  }
  arr = await Promise.all(arr);
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  for (const item of arr) {
    const { index, url } = item;
    opt.push({
      url,
      windowId,
      cookieStoreId: cookieId,
      index: index + 1
    });
  }
  if (opt.length) {
    func = createTabsInOrder(opt.reverse());
  }
  return func || null;
};

/* dupe */
/**
 * duplicate tab
 *
 * @param {object} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?Function} - createTab()
 */
export const dupeTab = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  let func;
  const tabsTab = await getTab(tabId);
  if (tabsTab) {
    const { index, url } = tabsTab;
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    func = createTab({
      url,
      windowId,
      index: index + 1,
      openerTabId: tabId
    });
  }
  return func || null;
};

/**
 * duplicate tabs
 *
 * @param {Array} nodes - array of node
 * @param {number} windowId - window ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const dupeTabs = async (nodes, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      func.push(dupeTab(itemId, windowId));
    }
  }
  return Promise.all(func);
};

/* highlight */
/**
 * highlight tabs
 *
 * @param {Array} nodes - array of node
 * @param {number} windowId - window ID
 * @returns {?Function} - highlightTab()
 */
export const highlightTabs = async (nodes, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const activeTab = await getActiveTab(windowId);
  const { index } = activeTab;
  const arr = [index];
  for (const item of nodes) {
    const itemIndex = getSidebarTabIndex(item);
    if (Number.isInteger(itemIndex) && itemIndex !== index) {
      arr.push(itemIndex);
    }
  }
  return highlightTab(arr, windowId);
};

/* move */
/**
 * move tabs in order
 *
 * @param {Array} arr - array of tab info
 * @param {number} windowId - window ID
 * @returns {?Function} - recurse moveTabsInOrder()
 */
export const moveTabsInOrder = async (arr, windowId) => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const info = arr.shift();
  let func;
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  if (isObjectNotEmpty(info)) {
    const { index, tabId } = info;
    if (!Number.isInteger(index)) {
      throw new TypeError(`Expected Number but got ${getType(index)}.`);
    }
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    await moveTab(tabId, { index, windowId });
  }
  if (arr.length) {
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * move tabs to end
 *
 * @param {Array} nodes - array of node
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const moveTabsToEnd = async (nodes, tabId, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const pinnedContainer = document.getElementById(PINNED);
  const { lastElementChild: pinnedLastTab } = pinnedContainer;
  const pinnedLastTabIndex = getSidebarTabIndex(pinnedLastTab);
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const lastTab = allTabs[allTabs.length - 1];
  const newTab = document.getElementById(NEW_TAB);
  const pinArr = [];
  const tabArr = [];
  const func = [];
  const l = nodes.length;
  let i = 0;
  while (i < l) {
    const item = getSidebarTab(nodes[i]);
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      const { parentNode } = item;
      if (parentNode.classList.contains(PINNED)) {
        if (item !== pinnedLastTab) {
          pinnedContainer.appendChild(item);
          pinArr.push(itemId);
        }
      } else if (item !== lastTab) {
        if (parentNode.classList.contains(CLASS_TAB_GROUP)) {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          if (item.dataset.group) {
            item.dataset.group = null;
          }
          container.appendChild(item);
          container.removeAttribute('hidden');
          newTab.parentNode.insertBefore(container, newTab);
        } else {
          newTab.parentNode.insertBefore(item.parentNode, newTab);
        }
        tabArr.push(itemId);
      }
      if (i === l - 1) {
        item.dataset.restore = tabId;
      }
    }
    i++;
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  if (pinArr.length && Number.isInteger(pinnedLastTabIndex)) {
    func.push(moveTab(pinArr, {
      windowId,
      index: pinnedLastTabIndex
    }));
  }
  if (tabArr.length) {
    func.push(moveTab(tabArr, {
      windowId,
      index: -1
    }));
  }
  return Promise.all(func);
};

/**
 * move tabs to start
 *
 * @param {Array} nodes - array of node
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const moveTabsToStart = async (nodes, tabId, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const pinnedContainer = document.getElementById(PINNED);
  const {
    nextElementSibling: firstUnpinnedContainer
  } = pinnedContainer;
  const firstPinnedTab = pinnedContainer.querySelector(TAB_QUERY);
  const firstUnpinnedTab = firstUnpinnedContainer.querySelector(TAB_QUERY);
  const firstUnpinnedTabIndex = getSidebarTabIndex(firstUnpinnedTab);
  const pinArr = [];
  const tabArr = [];
  const func = [];
  const l = nodes.length;
  let i = 0;
  while (i < l) {
    const item = getSidebarTab(nodes[i]);
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      const { parentNode } = item;
      if (parentNode.classList.contains(PINNED)) {
        if (item !== firstPinnedTab) {
          parentNode.insertBefore(item, firstPinnedTab);
          pinArr.push(itemId);
        }
      } else if (item !== firstUnpinnedTab) {
        if (parentNode.classList.contains(CLASS_TAB_GROUP)) {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          if (item.dataset.group) {
            item.dataset.group = null;
          }
          container.appendChild(item);
          container.removeAttribute('hidden');
          firstUnpinnedContainer.parentNode
            .insertBefore(container, firstUnpinnedContainer);
        } else {
          firstUnpinnedContainer.parentNode
            .insertBefore(item.parentNode, firstUnpinnedContainer);
        }
        tabArr.push(itemId);
      }
      if (i === l - 1) {
        item.dataset.restore = tabId;
      }
    }
    i++;
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  if (pinArr.length) {
    func.push(moveTab(pinArr, {
      windowId,
      index: 0
    }));
  }
  if (tabArr.length && Number.isInteger(firstUnpinnedTabIndex)) {
    func.push(moveTab(tabArr, {
      windowId,
      index: firstUnpinnedTabIndex
    }));
  }
  return Promise.all(func);
};

/**
 * move tabs to new window
 *
 * @param {Array} nodes - array of node
 * @returns {?Function} - moveTab()
 */
export const moveTabsToNewWindow = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let func;
  const firstTab = nodes.shift();
  const firstTabId = getSidebarTabId(firstTab);
  if (Number.isInteger(firstTabId)) {
    const win = await createNewWindow({
      tabId: firstTabId,
      type: 'normal'
    });
    const { id: windowId } = win;
    const arr = [];
    for (const item of nodes) {
      const itemId = getSidebarTabId(item);
      if (Number.isInteger(itemId) && itemId !== firstTabId) {
        arr.push(itemId);
      }
    }
    if (arr.length) {
      func = moveTab(arr, {
        windowId,
        index: -1
      });
    }
  }
  return func || null;
};

/* mute */
/**
 * mute tabs
 *
 * @param {Array} nodes - array of node
 * @param {boolean} muted - muted
 * @returns {Promise.<Array>} - results of each handler
 */
export const muteTabs = async (nodes, muted) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      func.push(updateTab(itemId, { muted: !!muted }));
    }
  }
  return Promise.all(func);
};

/* new tab */
/**
 * create new tab
 *
 * @param {number} windowId - window ID
 * @param {number} index - tab index
 * @returns {Function} - createTab()
 */
export const createNewTab = async (windowId, index) => {
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const opt = {
    windowId,
    active: true
  };
  if (Number.isInteger(index) && index >= 0) {
    opt.index = index;
  }
  return createTab(opt);
};

/**
 * create new tab in container
 *
 * @param {string} cookieId - cookie store ID
 * @param {number} windowId - window ID
 * @returns {Function} - createTab()
 */
export const createNewTabInContainer = async (cookieId, windowId) => {
  if (!isString(cookieId)) {
    throw new TypeError(`Expected String but got ${getType(cookieId)}.`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  return createTab({
    windowId,
    active: true,
    cookieStoreId: cookieId
  });
};

/* pin */
/**
 * pin tabs
 *
 * @param {object} nodes - array of node
 * @param {boolean} pinned - pinned
 * @returns {Promise.<Array>} - results of each handler
 */
export const pinTabs = async (nodes, pinned) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    const tabId = getSidebarTabId(item);
    if (Number.isInteger(tabId)) {
      func.push(updateTab(tabId, { pinned: !!pinned }));
    }
  }
  return Promise.all(func);
};

/* reload */
/**
 * reload tabs
 *
 * @param {Array} nodes - array of node
 * @returns {Promise.<Array>} - results of each handler
 */
export const reloadTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      func.push(reloadTab(itemId));
    }
  }
  return Promise.all(func);
};
