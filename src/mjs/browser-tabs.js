/**
 * browser-tabs.js
 */

import {
  getType, isObjectNotEmpty, isString,
} from "./common.js";
import {
  createBookmark, createNewWindow, createTab, getTab, moveTab, reloadTab,
  removeTab, updateTab,
} from "./browser.js";
import {
  getSidebarTabId, getSidebarTabIndex, getTemplate,
} from "./util.js";

/* api */
const {windows} = browser;

/* constants */
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP, HIGHLIGHTED, NEW_TAB, PINNED,
  TAB_QUERY,
} from "./constant.js";

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
    const itemTab = dataset.tab && JSON.parse(dataset.tab);
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
        const itemTab = dataset.tab && JSON.parse(dataset.tab);
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
    throw new TypeError(`Expected Array but got ${getType(tabIds)}.`);
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

/* contextual IDs */
/**
 * create tabs in order
 * @param {Array} arr - array of option
 * @returns {?AsyncFunction} - recurse createTabsInOrder()
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

/**
 * reopen tabs in container
 * @param {Array} tabArr - array of sidebar tab
 * @param {string} cookieId - cookie store ID
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - createTabsInOrder()
 */
export const reopenTabsInContainer = async (tabArr, cookieId, windowId) => {
  if (!Array.isArray(tabArr)) {
    throw new TypeError(`Expected Array but got ${getType(tabArr)}.`);
  }
  if (!isString(cookieId)) {
    throw new TypeError(`Expected String but got ${getType(cookieId)}.`);
  }
  const opt = [];
  let arr = [], func;
  for (const item of tabArr) {
    if (item && item.nodeType === Node.ELEMENT_NODE) {
      const tabId = getSidebarTabId(item);
      arr.push(getTab(tabId));
    }
  }
  arr = await Promise.all(arr);
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  for (const item of arr) {
    if (isObjectNotEmpty(item)) {
      const {index, url} = item;
      opt.push({
        url, windowId,
        cookieStoreId: cookieId,
        index: index + 1,
      });
    }
  }
  if (opt.length) {
    func = createTabsInOrder(opt.reverse());
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
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  let func;
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
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
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
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
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
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

/* tab group */
/**
 * detach tab from tab group
 * @param {Object} elm - element
 * @param {number} windowId - window ID
 * @param {boolean} enroute - enroute
 * @returns {?AsyncFunction} - moveTab()
 */
export const detachTabFromGroup = async (elm, windowId, enroute) => {
  let func;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {parentNode} = elm;
    if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
        !parentNode.classList.contains(PINNED)) {
      const {
        lastElementChild: parentLastChild,
        nextElementSibling: parentNextSibling,
      } = parentNode;
      const tabId = getSidebarTabId(elm);
      const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(elm);
      container.removeAttribute("hidden");
      parentNode.parentNode.insertBefore(container, parentNextSibling);
      if (elm !== parentLastChild && !enroute) {
        const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
        const tabIndex = getSidebarTabIndex(elm);
        let index;
        if (tabIndex === lastTabIndex) {
          index = -1;
        } else {
          index = tabIndex;
        }
        elm.dataset.restore = tabId;
        if (!Number.isInteger(windowId)) {
          windowId = windows.WINDOW_ID_CURRENT;
        }
        func = moveTab([tabId], {windowId, index});
      }
    }
  }
  return func || null;
};

/**
 * detach tabs from tab group
 * @param {Object} nodeArr - node array
 * @param {number} windowId - window ID
 * @param {boolean} enroute - enroute
 * @returns {?AsyncFunction} - moveTabsInOrder()
 */
export const detachTabsFromGroup = async (nodeArr, windowId, enroute) => {
  if (!Array.isArray(nodeArr)) {
    throw new TypeError(`Expected Array but got ${getType(nodeArr)}.`);
  }
  let func;
  if (nodeArr.length) {
    const revArr = nodeArr.reverse();
    const arr = [];
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    for (const item of revArr) {
      if (item && item.nodeType === Node.ELEMENT_NODE) {
        arr.push(detachTabFromGroup(item, windowId, true));
      }
    }
    if (arr.length) {
      const moveArr = [];
      await Promise.all(arr);
      for (const item of revArr) {
        if (item && item.nodeType === Node.ELEMENT_NODE) {
          const itemId = getSidebarTabId(item);
          const itemIndex = getSidebarTabIndex(item);
          if (Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
              !enroute) {
            moveArr.push({
              index: itemIndex,
              tabId: itemId,
            });
          }
        }
      }
      if (moveArr.length) {
        func = moveTabsInOrder(moveArr, windowId);
      }
    }
  }
  return func || null;
};

/**
 * group selected tabs
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - moveTabsInOrder()
 */
export const groupSelectedTabs = async windowId => {
  const selectedTabs =
    document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}:not(.${PINNED})`);
  let func;
  if (selectedTabs && selectedTabs.length > 1) {
    const [tab] = selectedTabs;
    const tabId = getSidebarTabId(tab);
    const arr = [];
    let container;
    if (tab.parentNode.classList.contains(CLASS_TAB_GROUP)) {
      const tabParent = tab.parentNode;
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      tabParent.parentNode.insertBefore(container,
                                        tabParent.nextElementSibling);
    } else {
      container = tab.parentNode;
    }
    for (const item of selectedTabs) {
      const itemId = getSidebarTabId(item);
      let itemIndex;
      if (item === tab) {
        item.dataset.group = tabId;
        itemIndex = getSidebarTabIndex(item);
      } else {
        item.dataset.group = tabId;
        container.appendChild(item);
        itemIndex = getSidebarTabIndex(item);
      }
      if (Number.isInteger(itemId) && Number.isInteger(itemIndex)) {
        arr.push({
          index: itemIndex,
          tabId: itemId,
        });
      }
    }
    if (arr.length) {
      if (!Number.isInteger(windowId)) {
        windowId = windows.WINDOW_ID_CURRENT;
      }
      func = moveTabsInOrder(arr, windowId);
    }
  }
  return func || null;
};

/* DnD */
/**
 * extract drag and drop tabs
 * @param {Object} dropTarget - target element
 * @param {number} windowId - window ID
 * @param {Object} data - dragged data
 * @param {Object} opt - key options
 * @returns {Promise.<Array>} - results of each handler
 */
export const extractDroppedTabs = async (
  dropTarget, windowId, data = {}, opt = {}
) => {
  const {tabIds, windowId: dragWindowId} = data;
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      Array.isArray(tabIds) && tabIds.length &&
      Number.isInteger(dragWindowId) &&
      dragWindowId !== windows.WINDOW_ID_NONE) {
    const {shiftKey} = opt;
    const {parentNode: dropParent} = dropTarget;
    const dropTargetIndex = getSidebarTabIndex(dropTarget);
    const dropTargetId = getSidebarTabId(dropTarget);
    const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    if (dragWindowId === windowId && !tabIds.includes(dropTargetId)) {
      if (dropParent.classList.contains(PINNED)) {
        for (const itemId of tabIds) {
          const item = document.querySelector(`[data-tab-id="${itemId}"]`);
          if (item && !item.classList.contains(PINNED)) {
            func.push(updateTab(itemId, {pinned: true}));
          }
        }
      } else if (dropParent.classList.contains(CLASS_TAB_GROUP) || shiftKey) {
        const moveDownArr = [];
        const moveUpArr = [];
        const l = tabIds.length;
        let i = 0, j = dropTargetIndex + 1;
        while (i < l) {
          const itemId = tabIds[i];
          const item = document.querySelector(`[data-tab-id="${itemId}"]`);
          if (item) {
            const itemIndex = getSidebarTabIndex(item);
            if (itemIndex === j) {
              dropParent.appendChild(item);
            } else if (itemIndex < dropTargetIndex) {
              moveDownArr.push(itemId);
            } else {
              moveUpArr.push(itemId);
            }
            if (i === l - 1) {
              item.dataset.restore = dropTargetId;
            }
          }
          i++;
          j++;
        }
        if (moveUpArr.length) {
          const revArr = moveUpArr.reverse();
          const arr = [];
          for (const itemId of revArr) {
            const item = document.querySelector(`[data-tab-id="${itemId}"]`);
            if (item) {
              dropParent.insertBefore(item, dropTarget.nextElementSibling);
              arr.push({
                index: getSidebarTabIndex(item),
                tabId: itemId,
              });
            }
          }
          await moveTabsInOrder(arr, windowId);
        }
        if (moveDownArr.length) {
          const revArr = moveDownArr.reverse();
          const arr = [];
          for (const itemId of revArr) {
            const item = document.querySelector(`[data-tab-id="${itemId}"]`);
            if (item) {
              dropParent.insertBefore(item, dropTarget.nextElementSibling);
              arr.push({
                index: getSidebarTabIndex(item),
                tabId: itemId,
              });
            }
          }
          await moveTabsInOrder(arr, windowId);
        }
      } else {
        const moveDownArr = [];
        const moveUpArr = [];
        const l = tabIds.length;
        let i = 0;
        while (i < l) {
          const itemId = tabIds[i];
          const item = document.querySelector(`[data-tab-id="${itemId}"]`);
          if (item) {
            const itemIndex = getSidebarTabIndex(item);
            if (itemIndex < dropTargetIndex) {
              moveDownArr.push(itemId);
            } else {
              moveUpArr.push(itemId);
            }
            if (i === l - 1) {
              item.dataset.restore = dropTargetId;
            }
          }
          i++;
        }
        if (moveUpArr.length) {
          const revArr = moveUpArr.reverse();
          const arr = [];
          for (const itemId of revArr) {
            const item = document.querySelector(`[data-tab-id="${itemId}"]`);
            if (item) {
              const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              container.appendChild(item);
              container.removeAttribute("hidden");
              dropParent.parentNode.insertBefore(container,
                                                 dropParent.nextElementSibling);
              arr.push({
                index: getSidebarTabIndex(item),
                tabId: itemId,
              });
            }
          }
          await moveTabsInOrder(arr, windowId);
        }
        if (moveDownArr.length) {
          const revArr = moveDownArr.reverse();
          const arr = [];
          for (const itemId of revArr) {
            const item = document.querySelector(`[data-tab-id="${itemId}"]`);
            if (item) {
              const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              container.appendChild(item);
              container.removeAttribute("hidden");
              dropParent.parentNode.insertBefore(container,
                                                 dropParent.nextElementSibling);
              arr.push({
                index: getSidebarTabIndex(item),
                tabId: itemId,
              });
            }
          }
          await moveTabsInOrder(arr, windowId);
        }
      }
    // dragged from other window
    } else if (!tabIds.includes(dropTargetId)) {
      let index;
      if (dropTargetIndex === lastTabIndex) {
        index = -1;
      } else {
        index = dropTargetIndex + 1;
      }
      func.push(moveTab(tabIds, {index, windowId}));
    }
  }
  return Promise.all(func);
};
