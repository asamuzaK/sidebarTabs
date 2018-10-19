/**
 * tab-util.js
 */

import {getType, isObjectNotEmpty, isString} from "./common.js";
import {
  createBookmark, createNewWindow, createTab, getCurrentWindow,
  getSessionWindowValue, getTab, moveTab, reloadTab, removeTab,
  setSessionWindowValue, updateTab,
} from "./browser.js";
import {
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_GROUP, NEW_TAB, PINNED, TAB_LIST, TAB_QUERY,
} from "./constant.js";

/* api */
const {windows} = browser;

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
    const allTabs = document.querySelectorAll(TAB_QUERY);
    if (!incognito && allTabs && allTabs.length) {
      const tabList = {};
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
      const l = items.length;
      let i = 0;
      while (i < l) {
        const item = items[i];
        const collapsed = item.classList.contains(CLASS_TAB_COLLAPSED);
        const childTabs = item.querySelectorAll(TAB_QUERY);
        for (const tab of childTabs) {
          const tabsTab = tab.dataset && tab.dataset.tab;
          if (tabsTab) {
            const {url} = JSON.parse(tabsTab);
            const tabIndex = getSidebarTabIndex(tab);
            if (Number.isInteger(tabIndex)) {
              tabList[tabIndex] = {
                collapsed, url,
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

/**
 * activate tab
 * @param {Object} elm - element
 * @returns {?AsyncFunction} - updateTab()
 */
export const activateTab = async elm => {
  const tabId = getSidebarTabId(elm);
  let func;
  if (Number.isInteger(tabId)) {
    const active = true;
    func = updateTab(tabId, {active});
  }
  return func || null;
};

/* bookmark */
/**
 * bookmark all tabs
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(TAB_QUERY);
  for (const item of items) {
    const {dataset} = item;
    const itemTab = dataset && dataset.tab && JSON.parse(dataset.tab);
    const {title, url} = itemTab;
    func.push(createBookmark({title, url}));
  }
  return Promise.all(func);
};

/**
 * bookmark tabs
 * @param {Object} nodes - node list
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabs = async nodes => {
  const func = [];
  if (nodes instanceof NodeList) {
    for (const item of nodes) {
      if (item.nodeType === Node.ELEMENT_NODE) {
        const {dataset} = item;
        const itemTab = dataset && dataset.tab && JSON.parse(dataset.tab);
        if (itemTab) {
          const {title, url} = itemTab;
          func.push(createBookmark({title, url}));
        }
      }
    }
  }
  return Promise.all(func);
};

/* close */
/**
 * close other tabs
 * @param {Array} tabIds - array of tab ID
 * @returns {?AsyncFunction} - removeTab()
 */
export const closeOtherTabs = async tabIds => {
  if (!Array.isArray(tabIds)) {
    throw new TypeError(`Expected Array but got ${getType(tabIds)}`);
  }
  let func;
  const items = document.querySelectorAll(TAB_QUERY);
  const arr = [];
  for (const item of items) {
    if (item && item.nodeType === Node.ELEMENT_NODE) {
      const itemId = getSidebarTabId(item);
      if (Number.isInteger(itemId) && !tabIds.includes(itemId)) {
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
 * close tabs
 * @param {Object} nodes - node list
 * @returns {?AsyncFunction} - removeTab()
 */
export const closeTabs = async nodes => {
  let func;
  if (nodes instanceof NodeList) {
    const arr = [];
    for (const item of nodes) {
      if (item.nodeType === Node.ELEMENT_NODE) {
        const tabId = getSidebarTabId(item);
        if (Number.isInteger(tabId)) {
          arr.push(tabId);
        }
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
 * @param {Object} elm - element
 * @returns {?AsyncFunction} - removeTab()
 */
export const closeTabsToEnd = async elm => {
  let func;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabId = getSidebarTabId(elm);
    const index = getSidebarTabIndex(elm);
    const arr = [];
    if (Number.isInteger(tabId) && Number.isInteger(index)) {
      const items =
        document.querySelectorAll(`${TAB_QUERY}:not([data-tab-id="${tabId}"])`);
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        const itemIndex = getSidebarTabIndex(item);
        if (Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
            itemIndex > index) {
          arr.push(itemId);
        }
      }
      if (arr.length) {
        func = removeTab(arr);
      }
    }
  }
  return func || null;
};

/* dupe */
/**
 * duplicate tab
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - createTab()
 */
export const dupeTab = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const tabsTab = await getTab(tabId);
  let func;
  if (tabsTab) {
    const {index, url} = tabsTab;
    const opt = {
      url, windowId,
      index: index + 1,
      openerTabId: tabId,
    };
    func = createTab(opt);
  }
  return func || null;
};

/**
 * duplicate tabs
 * @param {Object} nodes - node list
 * @param {number} windowId - window ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const dupeTabs = async (nodes, windowId) => {
  const func = [];
  if (nodes instanceof NodeList) {
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    for (const item of nodes) {
      if (item && item.nodeType === Node.ELEMENT_NODE) {
        const itemId = getSidebarTabId(item);
        if (Number.isInteger(itemId)) {
          func.push(dupeTab(itemId, windowId));
        }
      }
    }
  }
  return Promise.all(func);
};

/* move */
/**
 * move tabs in order
 * @param {Array} arr - array of tab info
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - recurse moveTabsInOrder()
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
    const {index, tabId} = info;
    if (!Number.isInteger(index)) {
      throw new TypeError(`Expected Number but got ${getType(index)}.`);
    }
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    await moveTab(tabId, {index, windowId});
  }
  if (arr.length) {
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * move tabs to end
 * @param {Array} nodeArr - array of node
 * @param {number} windowId - window ID
 * @param {number} tabId - tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const moveTabsToEnd = async (nodeArr, windowId, tabId) => {
  if (!Array.isArray(nodeArr)) {
    throw new TypeError(`Expected Array but got ${getType(nodeArr)}`);
  }
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const pinnedContainer = document.getElementById(PINNED);
  const {lastElementChild: pinnedLastTab} = pinnedContainer;
  const pinnedLastTabIndex = getSidebarTabIndex(pinnedLastTab);
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const lastTab = allTabs[allTabs.length - 1];
  const newTab = document.getElementById(NEW_TAB);
  const pinArr = [];
  const tabArr = [];
  const func = [];
  const l = nodeArr.length;
  let i = 0;
  while (i < l) {
    const item = nodeArr[i];
    if (item && item.nodeType === Node.ELEMENT_NODE) {
      const {parentNode} = item;
      const itemId = getSidebarTabId(item);
      if (Number.isInteger(itemId)) {
        if (parentNode.classList.contains(PINNED) && item !== pinnedLastTab) {
          pinnedContainer.appendChild(item);
          pinArr.push(itemId);
        } else if (item !== lastTab) {
          if (parentNode.classList.contains(CLASS_TAB_GROUP)) {
            const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
            if (item.dataset.group) {
              item.dataset.group = null;
            }
            container.appendChild(item);
            container.removeAttribute("hidden");
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
    }
    i++;
  }
  if (pinArr.length && Number.isInteger(pinnedLastTabIndex)) {
    func.push(moveTab(pinArr, {
      windowId,
      index: pinnedLastTabIndex,
    }));
  }
  if (tabArr.length) {
    func.push(moveTab(tabArr, {
      windowId,
      index: -1,
    }));
  }
  return Promise.all(func);
};

/**
 * move tabs to start
 * @param {Array} nodeArr - array of node
 * @param {number} windowId - window ID
 * @param {number} tabId - tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const moveTabsToStart = async (nodeArr, windowId, tabId) => {
  if (!Array.isArray(nodeArr)) {
    throw new TypeError(`Expected Array but got ${getType(nodeArr)}`);
  }
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const pinnedContainer = document.getElementById(PINNED);
  const {
    firstElementChild: firstPinnedTab,
    nextElementSibling: firstUnpinnedContainer,
  } = pinnedContainer;
  const {firstElementChild: firstUnpinnedTab} = firstUnpinnedContainer;
  const firstUnpinnedTabIndex = getSidebarTabIndex(firstUnpinnedTab);
  const pinArr = [];
  const tabArr = [];
  const func = [];
  const l = nodeArr.length;
  let i = 0;
  while (i < l) {
    const item = nodeArr[i];
    if (item && item.nodeType === Node.ELEMENT_NODE) {
      const {parentNode} = item;
      const itemId = getSidebarTabId(item);
      if (Number.isInteger(itemId)) {
        if (parentNode.classList.contains(PINNED) && item !== firstPinnedTab) {
          parentNode.insertBefore(item, firstPinnedTab);
          pinArr.push(itemId);
        } else if (item !== firstUnpinnedTab) {
          if (parentNode.classList.contains(CLASS_TAB_GROUP)) {
            const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
            if (item.dataset.group) {
              item.dataset.group = null;
            }
            container.appendChild(item);
            container.removeAttribute("hidden");
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
    }
    i++;
  }
  if (pinArr.length) {
    func.push(moveTab(pinArr, {
      windowId,
      index: 0,
    }));
  }
  if (tabArr.length && Number.isInteger(firstUnpinnedTabIndex)) {
    func.push(moveTab(tabArr, {
      windowId,
      index: firstUnpinnedTabIndex,
    }));
  }
  return Promise.all(func);
};

/**
 * move tabs to new window
 * @param {Object} nodeArr - array of node
 * @returns {?AsyncFunc} - moveTab()
 */
export const moveTabsToNewWindow = async nodeArr => {
  if (!Array.isArray(nodeArr)) {
    throw new TypeError(`Expected Array but got ${getType(nodeArr)}`);
  }
  let func;
  if (nodeArr.length) {
    const [firstTab] = nodeArr;
    const firstTabId = getSidebarTabId(firstTab);
    if (firstTab && Number.isInteger(firstTabId)) {
      const win = await createNewWindow({
        tabId: firstTabId,
        type: "normal",
      });
      const {id: windowId} = win;
      const arr = [];
      for (const item of nodeArr) {
        const itemId = getSidebarTabId(item);
        if (Number.isInteger(itemId) && itemId !== firstTabId) {
          arr.push(itemId);
        }
      }
      if (arr.length) {
        func = moveTab(arr, {
          windowId,
          index: -1,
        });
      }
    }
  }
  return func || null;
};

/* mute */
/**
 * mute tabs
 * @param {Object} nodes - node list
 * @param {boolean} muted - muted
 * @returns {Promise.<Array>} - results of each handler
 */
export const muteTabs = async (nodes, muted) => {
  const func = [];
  if (nodes instanceof NodeList) {
    for (const item of nodes) {
      if (item.nodeType === Node.ELEMENT_NODE) {
        const tabId = getSidebarTabId(item);
        if (Number.isInteger(tabId)) {
          func.push(updateTab(tabId, {muted: !!muted}));
        }
      }
    }
  }
  return Promise.all(func);
};

/* pin */
/**
 * pin tabs
 * @param {Object} nodes - node list
 * @param {boolean} pinned - pinned
 * @returns {Promise.<Array>} - results of each handler
 */
export const pinTabs = async (nodes, pinned) => {
  const func = [];
  if (nodes instanceof NodeList) {
    for (const item of nodes) {
      if (item.nodeType === Node.ELEMENT_NODE) {
        const tabId = getSidebarTabId(item);
        if (Number.isInteger(tabId)) {
          func.push(updateTab(tabId, {pinned: !!pinned}));
        }
      }
    }
  }
  return Promise.all(func);
};

/* reload */
/**
 * reload all tabs
 * @returns {Promise.<Array>} - results of each handler
 */
export const reloadAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(TAB_QUERY);
  for (const item of items) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      func.push(reloadTab(itemId));
    }
  }
  return Promise.all(func);
};

/**
 * reload tabs
 * @param {Object} nodes - node list
 * @returns {Promise.<Array>} - results of each handler
 */
export const reloadTabs = async nodes => {
  const func = [];
  if (nodes instanceof NodeList) {
    for (const item of nodes) {
      if (item.nodeType === Node.ELEMENT_NODE) {
        const itemId = getSidebarTabId(item);
        if (Number.isInteger(itemId)) {
          func.push(reloadTab(itemId));
        }
      }
    }
  }
  return Promise.all(func);
};
