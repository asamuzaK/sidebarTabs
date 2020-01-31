/**
 * tab-group.js
 */

import {
  getType, throwErr,
} from "./common.js";
import {
  getTab, queryTabs,
} from "./browser.js";
import {
  moveTabsInOrder,
} from "./browser-tabs.js";
import {
  activateTab, createUrlMatchString, getSidebarTab, getSidebarTabContainer,
  getSidebarTabId, getSidebarTabIndex, getTemplate, setSessionTabList,
} from "./util.js";

/* api */
const {i18n, windows} = browser;

/* constants */
import {
  ACTIVE, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTEXT,
  CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, HIGHLIGHTED, NEW_TAB, PINNED,
  TAB_GROUP_COLLAPSE, TAB_GROUP_EXPAND, TAB_QUERY,
} from "./constant.js";

/**
 * restore sidebar tab containers
 * @returns {void}
 */
export const restoreTabContainers = async () => {
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  for (const item of items) {
    const {childElementCount, classList, id, parentNode} = item;
    switch (childElementCount) {
      case 0:
        id !== PINNED && parentNode.removeChild(item);
        break;
      case 1:
        classList.remove(CLASS_TAB_GROUP);
        break;
      default:
        classList.add(CLASS_TAB_GROUP);
    }
  }
};

/**
 * collapse tab group
 * @param {Object} elm - element
 * @returns {void}
 */
export const collapseTabGroup = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_GROUP)) {
    const {firstElementChild: tab} = elm;
    const {firstElementChild: tabContext} = tab;
    const {firstElementChild: toggleIcon} = tabContext;
    elm.classList.add(CLASS_TAB_COLLAPSED);
    tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
    toggleIcon.alt = i18n.getMessage(TAB_GROUP_EXPAND);
  }
};

/**
 * expand tab group
 * @param {Object} elm - element
 * @returns {void}
 */
export const expandTabGroup = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_GROUP)) {
    const {firstElementChild: tab} = elm;
    const {firstElementChild: tabContext} = tab;
    const {firstElementChild: toggleIcon} = tabContext;
    elm.classList.remove(CLASS_TAB_COLLAPSED);
    tabContext.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
    toggleIcon.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
  }
};

/**
 * toggle tab group collapsed state
 * @param {Object} elm - element
 * @param {boolean} activate - activate tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupCollapsedState = async (elm, activate) => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
        func.push(expandTabGroup(container));
      } else {
        func.push(collapseTabGroup(container));
      }
      if (activate) {
        const {firstElementChild: tab} = container;
        func.push(activateTab(tab));
      }
    }
  }
  return Promise.all(func);
};

/**
 * toggle multiple tab groups collapsed state
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupsCollapsedState = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        if (item === container) {
          func.push(toggleTabGroupCollapsedState(item, true));
        } else {
          !item.classList.contains(CLASS_TAB_COLLAPSED) &&
            func.push(toggleTabGroupCollapsedState(item, false));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * collapse multiple tab groups
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const collapseTabGroups = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        item !== container && !item.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabGroupCollapsedState(item, false));
      }
    }
  }
  return Promise.all(func);
};

/**
 * handle individual tab group collapsed state
 * @param {!Object} evt - Event
 * @returns {?AsyncFunction} - promise chain
 */
export const handleTabGroupCollapsedState = evt => {
  const {target} = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    func =
      toggleTabGroupCollapsedState(tab, true).then(setSessionTabList)
        .catch(throwErr);
  }
  return func || null;
};

/**
 * handle multiple tab groups collapsed state
 * @param {!Object} evt - Event
 * @returns {?AsyncFunction} - promise chain
 */
export const handleTabGroupsCollapsedState = evt => {
  const {target} = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container) {
    func =
      toggleTabGroupsCollapsedState(container).then(setSessionTabList)
        .catch(throwErr);
  }
  return func || null;
};

/**
 * add tab context click listener
 * @param {Object} elm - element
 * @param {boolean} multi - handle multiple tab groups
 * @returns {void}
 */
export const addTabContextClickListener = async (elm, multi) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CONTEXT)) {
    if (multi) {
      elm.addEventListener("click", handleTabGroupsCollapsedState);
      elm.removeEventListener("click", handleTabGroupCollapsedState);
    } else {
      elm.addEventListener("click", handleTabGroupCollapsedState);
      elm.removeEventListener("click", handleTabGroupsCollapsedState);
    }
  }
};

/**
 * replace tab context click listener
 * @param {boolean} multi - handle multiple tab groups
 * @returns {Promise.<Array>} - result of each handler
 */
export const replaceTabContextClickListener = async multi => {
  const items = document.querySelectorAll(`.${CLASS_TAB_CONTEXT}`);
  const func = [];
  for (const item of items) {
    func.push(addTabContextClickListener(item, !!multi));
  }
  return Promise.all(func);
};

/**
 * expand activated collapsed tab
 * @returns {?AsyncFunction} - toggleTabGroupCollapsedState()
 */
export const expandActivatedCollapsedTab = async () => {
  const tab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
  let func;
  if (tab) {
    const {parentNode} = tab;
    if (parentNode.classList.contains(CLASS_TAB_COLLAPSED) &&
        parentNode.firstElementChild !== tab) {
      func = toggleTabGroupCollapsedState(tab, true);
    }
  }
  return func || null;
};

/**
 * detach tabs from tab group
 * @param {Array} nodes - array of node
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - moveTabsInOrder()
 */
export const detachTabsFromGroup = async (nodes, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let func;
  const revArr = nodes.reverse();
  const arr = [];
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  for (const item of revArr) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      const {parentNode} = item;
      if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
          !parentNode.classList.contains(PINNED)) {
        const {
          lastElementChild: parentLastChild,
          nextElementSibling: parentNextSibling,
        } = parentNode;
        const move = item !== parentLastChild;
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        const itemIndex = getSidebarTabIndex(item);
        container.appendChild(item);
        container.removeAttribute("hidden");
        parentNode.parentNode.insertBefore(container, parentNextSibling);
        move && arr.push({
          index: itemIndex,
          tabId: itemId,
        });
      }
    }
  }
  if (arr.length) {
    func = moveTabsInOrder(arr, windowId);
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
  if (selectedTabs.length > 1) {
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
      item.dataset.group = tabId;
      if (item === tab) {
        itemIndex = getSidebarTabIndex(item);
      } else {
        container.appendChild(item);
        itemIndex = getSidebarTabIndex(item);
      }
      arr.push({
        index: itemIndex,
        tabId: itemId,
      });
    }
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * group same container tabs
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - moveTabsInOrder()
 */
export const groupSameContainerTabs = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  const {cookieStoreId} = tabsTab;
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const items = await queryTabs({
    cookieStoreId, windowId,
    pinned: false,
  });
  let func;
  if (Array.isArray(items) && items.length > 1) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    const tabParent = tab.parentNode;
    const containerTabs = [];
    const arr = [];
    let container;
    if (tabParent.classList.contains(CLASS_TAB_GROUP)) {
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      tabParent.parentNode.insertBefore(container,
                                        tabParent.nextElementSibling);
      containerTabs.push([tab, tabId]);
    } else {
      container = tabParent;
    }
    for (const item of items) {
      const {id: itemId} = item;
      if (itemId !== tabId) {
        const itemTab = document.querySelector(`[data-tab-id="${itemId}"]`);
        itemTab.dataset.group = tabId;
        container.appendChild(itemTab);
        containerTabs.push([itemTab, itemId]);
      }
    }
    for (const [itemTab, itemId] of containerTabs) {
      const itemIndex = getSidebarTabIndex(itemTab);
      arr.push({
        index: itemIndex,
        tabId: itemId,
      });
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * group same domain tabs
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - moveTabsInOrder()
 */
export const groupSameDomainTabs = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  const {url: tabUrl} = tabsTab;
  const url = createUrlMatchString(tabUrl);
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const items = await queryTabs({
    url, windowId,
    pinned: false,
  });
  let func;
  if (Array.isArray(items) && items.length > 1) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    const tabParent = tab.parentNode;
    const domainTabs = [];
    const arr = [];
    let container;
    if (tabParent.classList.contains(CLASS_TAB_GROUP)) {
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      tabParent.parentNode.insertBefore(container,
                                        tabParent.nextElementSibling);
      domainTabs.push([tab, tabId]);
    } else {
      container = tabParent;
    }
    for (const item of items) {
      const {id: itemId} = item;
      if (itemId !== tabId) {
        const itemTab = document.querySelector(`[data-tab-id="${itemId}"]`);
        itemTab.dataset.group = tabId;
        container.appendChild(itemTab);
        domainTabs.push([itemTab, itemId]);
      }
    }
    for (const [itemTab, itemId] of domainTabs) {
      const itemIndex = getSidebarTabIndex(itemTab);
      arr.push({
        index: itemIndex,
        tabId: itemId,
      });
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * ungroup tabs
 * @param {Object} node - tab group container
 * @returns {void}
 */
export const ungroupTabs = async node => {
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const {id, classList, parentNode} = node;
    if (id !== PINNED && classList.contains(CLASS_TAB_GROUP)) {
      const items = node.querySelectorAll(TAB_QUERY);
      for (const item of items) {
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(item);
        container.removeAttribute("hidden");
        parentNode.insertBefore(container, node);
      }
    }
  }
};
