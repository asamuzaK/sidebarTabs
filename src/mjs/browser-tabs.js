/**
 * browser-tabs.js
 */

/* shared */
import {
  createNewWindow, createTab, duplicateTab, getActiveTab,
  getNewTabPositionValue, getTab, highlightTab, moveTab, reloadTab, removeTab,
  updateTab
} from './browser.js';
import { getType, isObjectNotEmpty, isString } from './common.js';
import {
  getSidebarTab, getSidebarTabId, getSidebarTabIds, getSidebarTabIndex,
  getTemplate
} from './util.js';
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP, NEW_TAB, PINNED, TAB_QUERY
} from './constant.js';

/* api */
const { tabs, windows } = browser;

/* close */
/**
 * close tabs
 * @param {Array} nodes - array of node
 * @returns {Promise.<?Promise>} - removeTab()
 */
export const closeTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const arr = getSidebarTabIds(nodes);
  let func;
  if (arr.length) {
    func = removeTab(arr);
  }
  return func || null;
};

/**
 * close duplicate tabs
 * @param {Array} ids - array of id
 * @param {object} elm - element
 * @returns {Promise.<?Promise>} - removeTab()
 */
export const closeDupeTabs = async (ids, elm) => {
  if (!Array.isArray(ids)) {
    throw new TypeError(`Expected Array but got ${getType(ids)}.`);
  }
  let func;
  if (ids.length) {
    await removeTab(ids);
    if (elm) {
      // TODO: notify closed tabs count, i.e. `Closed n tabs`
      // ref: https://searchfox.org/mozilla-central/source/browser/base/content/browser.js#7928
      // func = notifyClosedTabsCount(elm, ids.length);
    }
  }
  return func || null;
};

/**
 * close other tabs
 * @param {Array} nodes - array of node
 * @returns {Promise.<?Promise>} - removeTab()
 */
export const closeOtherTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const tabIds = getSidebarTabIds(nodes);
  let func;
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
 * @param {object} elm - element
 * @returns {Promise.<?Promise>} - removeTab()
 */
export const closeTabsToEnd = async elm => {
  const tabId = getSidebarTabId(elm);
  const index = getSidebarTabIndex(elm);
  const arr = [];
  let func;
  if (Number.isInteger(tabId) && Number.isInteger(index)) {
    const items = document.querySelectorAll(
      `${TAB_QUERY}:not([data-tab-id="${tabId}"], .${PINNED})`
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
 * @param {object} elm - element
 * @returns {Promise.<?Promise>} - removeTab()
 */
export const closeTabsToStart = async elm => {
  const tabId = getSidebarTabId(elm);
  const index = getSidebarTabIndex(elm);
  const arr = [];
  let func;
  if (Number.isInteger(tabId) && Number.isInteger(index)) {
    const items = document.querySelectorAll(
      `${TAB_QUERY}:not([data-tab-id="${tabId}"], .${PINNED})`
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
 * @param {Array} arr - array of option
 * @param {boolean} pop - pop item from array
 * @returns {Promise|undefined} - recurse createTabsInOrder()
 */
export const createTabsInOrder = async (arr, pop = false) => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  let opt;
  if (pop) {
    opt = arr.pop();
  } else {
    opt = arr.shift();
  }
  if (isObjectNotEmpty(opt)) {
    await createTab(opt);
  }
  let func;
  if (arr.length) {
    func = createTabsInOrder(arr, pop);
  }
  return func;
};

/* contextual IDs */
/**
 * reopen tabs in container
 * @param {Array} nodes - array of node
 * @param {string} cookieId - cookie store ID
 * @param {number} windowId - window ID
 * @returns {?Promise} - createTabsInOrder()
 */
export const reopenTabsInContainer = async (nodes, cookieId, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!isString(cookieId)) {
    throw new TypeError(`Expected String but got ${getType(cookieId)}.`);
  }
  const opts = [];
  let func;
  let arr = [];
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
    const { id: itemId, index, url } = item;
    const opt = {
      windowId,
      cookieStoreId: cookieId,
      index: index + 1,
      openerTabId: itemId
    };
    if (url !== 'about:newtab') {
      opt.url = url;
    }
    opts.push(opt);
  }
  if (opts.length) {
    func = createTabsInOrder(opts, true);
  }
  return func || null;
};

/* dupe */
/**
 * duplicate tab
 * @param {number} tabId - tab ID
 * @returns {Promise.<?Promise>} - createTab()
 */
export const dupeTab = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  let func;
  if (tabsTab) {
    const { active, index } = tabsTab;
    if (active) {
      func = duplicateTab(tabId, {
        active,
        index: index + 1
      });
    } else {
      func = duplicateTab(tabId, {
        active: true
      });
    }
  }
  return func || null;
};

/**
 * duplicate tabs
 * @param {Array} nodes - array of node
 * @returns {Promise.<Array>} - results of each handler
 */
export const dupeTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  for (const item of nodes) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      func.push(dupeTab(itemId));
    }
  }
  return Promise.all(func);
};

/* highlight */
/**
 * highlight tabs
 * @param {Array} nodes - array of node
 * @param {object} opt - options
 * @param {number} opt.tabId - tab ID to activate
 * @param {number} opt.windowId - window ID
 * @returns {Promise.<?Promise>} - highlightTab()
 */
export const highlightTabs = async (nodes, opt = {}) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const { tabId, windowId } = opt;
  let activeTab;
  if (Number.isInteger(tabId)) {
    activeTab = await updateTab(tabId, {
      active: true
    });
  } else {
    activeTab = await getActiveTab(windowId);
  }
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
 * @param {Array} arr - array of tab info
 * @param {number} windowId - window ID
 * @param {boolean} pop - pop item from array
 * @returns {Promise|undefined} - recurse moveTabsInOrder()
 */
export const moveTabsInOrder = async (arr, windowId, pop = false) => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  let info;
  if (pop) {
    info = arr.pop();
  } else {
    info = arr.shift();
  }
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
    func = moveTabsInOrder(arr, windowId, pop);
  }
  return func;
};

/**
 * move tabs to end
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
 * @param {Array} nodes - array of node
 * @returns {Promise.<?Promise>} - moveTab()
 */
export const moveTabsToNewWindow = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const firstTab = nodes.shift();
  const firstTabId = getSidebarTabId(firstTab);
  let func;
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
 * @param {Array} nodes - array of node
 * @param {boolean} [muted] - muted
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
 * @param {number} [windowId] - window ID
 * @param {object} [opt] - options
 * @returns {Promise} - createTab()
 */
export const createNewTab = async (windowId, opt = {}) => {
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const prop = {
    windowId,
    active: true
  };
  if (isObjectNotEmpty(opt)) {
    const pos = await getNewTabPositionValue();
    const items = Object.entries(opt);
    for (const [key, value] of items) {
      switch (key) {
        case 'index':
          if (Number.isInteger(value) && value > 0 && isObjectNotEmpty(pos)) {
            const { value: posValue } = pos;
            if (posValue === 'afterCurrent' ||
                posValue === 'relatedAfterCurrent') {
              prop.index = value;
            }
          }
          break;
        case 'openerTabId':
          if (Number.isInteger(value) && value !== tabs.TAB_ID_NONE) {
            prop[key] = value;
          }
          break;
        default:
          prop[key] = value;
      }
    }
  }
  return createTab(prop);
};

/**
 * create new tab in container
 * @param {string} cookieId - cookie store ID
 * @param {number} [windowId] - window ID
 * @returns {Promise} - createTab()
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
 * @param {Array} nodes - array of node
 * @param {boolean} [pinned] - pinned
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
