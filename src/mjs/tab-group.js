/**
 * tab-group.js
 */

import {
  getType, throwErr,
} from "./common.js";
import {
  moveTabsInOrder,
} from "./browser-tabs.js";
import {
  activateTab, getSidebarTabContainer, getSidebarTabId, getSidebarTabIndex,
  getTemplate, setSessionTabList,
} from "./util.js";

/* api */
const {i18n, windows} = browser;

/* constants */
import {
  ACTIVE, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTEXT,
  CLASS_TAB_GROUP,
  HIGHLIGHTED, PINNED, TAB_GROUP_COLLAPSE, TAB_GROUP_EXPAND, TAB_QUERY,
} from "./constant.js";

/**
 * toggle tab group collapsed state
 * @param {Object} evt - event
 * @returns {?AsyncFunction} - activateTab()
 */
export const toggleTabGroupCollapsedState = async (evt = {}) => {
  const {target} = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container && container.classList.contains(CLASS_TAB_GROUP)) {
    const {firstElementChild: tab} = container;
    const {firstElementChild: tabContext} = tab;
    const {firstElementChild: toggleIcon} = tabContext;
    container.classList.toggle(CLASS_TAB_COLLAPSED);
    if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
      toggleIcon.alt = i18n.getMessage(TAB_GROUP_EXPAND);
      func = activateTab(tab);
    } else {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
      toggleIcon.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
    }
  }
  return func;
};

/**
 * handle tab context on click
 * @param {Object} evt - Event
 * @returns {AsyncFunction} - promise chain
 */
export const tabContextOnClick = evt =>
  toggleTabGroupCollapsedState(evt).then(setSessionTabList).catch(throwErr);

/**
 * add tab context click listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabContextClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CONTEXT)) {
    elm.addEventListener("click", tabContextOnClick);
  }
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
      func = toggleTabGroupCollapsedState({target: tab});
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
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(item);
        container.removeAttribute("hidden");
        parentNode.parentNode.insertBefore(container, parentNextSibling);
        if (item !== parentLastChild) {
          const itemIndex = getSidebarTabIndex(item);
          arr.push({
            index: itemIndex,
            tabId: itemId,
          });
        }
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
