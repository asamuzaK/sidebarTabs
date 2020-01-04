/**
 * main.js
 */

import {
  getType, isObjectNotEmpty, isString, throwErr,
} from "./common.js";
import {
  clearStorage, getActiveTab, getAllContextualIdentities,
  getAllTabsInWindow, getContextualId, getCurrentWindow, getHighlightedTab,
  getOs, getRecentlyClosedTab, getStorage, getTab, highlightTab, moveTab,
  restoreSession, sendMessage, setSessionWindowValue,
} from "./browser.js";
import {
  bookmarkTabs, closeOtherTabs, closeTabs, closeTabsToEnd,
  createNewTab, createNewTabInContainer, dupeTabs, highlightTabs,
  moveTabsToEnd, moveTabsToStart, moveTabsToNewWindow,
  muteTabs, pinTabs, reloadTabs, reopenTabsInContainer,
} from "./browser-tabs.js";
import {
  activateTab, getSessionTabList, getSidebarTab, getSidebarTabId,
  getSidebarTabIndex, getTabsInRange, getTemplate,
  isNewTab, scrollTabIntoView, setSessionTabList,
} from "./util.js";
import {
  handleDragEnd, handleDragEnter, handleDragLeave, handleDragOver,
  handleDragStart, handleDrop,
} from "./tab-dnd.js";
import {
  addHighlightToTabs, addTabAudioClickListener, addTabCloseClickListener,
  addTabIconErrorListener, removeHighlight,
  setContextualIdentitiesIcon, setTabAudio, setTabAudioIcon, setTabContent,
  setTabIcon, toggleHighlight,
} from "./tab-content.js";
import {
  addTabContextClickListener, detachTabsFromGroup, groupSameDomainTabs,
  groupSelectedTabs, restoreTabContainers, toggleTabGroupCollapsedState,
  ungroupTabs,
} from "./tab-group.js";
import {
  initCustomTheme, sendCurrentTheme, setScrollbarWidth, setTabHeight, setTheme,
  updateCustomThemeCss,
} from "./theme.js";
import {
  overrideContextMenu, updateContextMenu,
} from "./menu.js";
import menuItems from "./menu-items.js";

/* api */
const {
  i18n, tabs,
} = browser;

/* constants */
import {
  ACTIVE, AUDIBLE,
  CLASS_TAB_AUDIO, CLASS_TAB_AUDIO_ICON, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_ICON,
  CLASS_TAB_IDENT_ICON, CLASS_TAB_TITLE, CLASS_TAB_TMPL, CLASS_TAB_TOGGLE_ICON,
  CLASS_THEME_CUSTOM,
  COOKIE_STORE_DEFAULT,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_SELECT,
  CUSTOM_BG_SELECT_HOVER, CUSTOM_BORDER, CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  EXT_INIT, HIGHLIGHTED, NEW_TAB, NEW_TAB_OPEN_CONTAINER, PINNED,
  SIDEBAR_MAIN, SIDEBAR_STATE_UPDATE,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK, TAB_CLOSE,
  TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
  TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_DOMAIN, TAB_GROUP_SELECTED,
  TAB_GROUP_UNGROUP, TAB_LIST,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_PIN,
  TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER, TABS_BOOKMARK, TABS_CLOSE,
  TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE, TABS_MOVE_END, TABS_MOVE_START,
  TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD, TABS_REOPEN_CONTAINER,
  THEME_CUSTOM, THEME_CUSTOM_INIT, THEME_CUSTOM_REQ, THEME_DARK, THEME_LIGHT,
  THEME_SCROLLBAR_NARROW, THEME_TAB_COMPACT,
} from "./constant.js";
const {TAB_ID_NONE} = tabs;
const MOUSE_BUTTON_MIDDLE = 1;
const MOUSE_BUTTON_RIGHT = 2;

/* sidebar */
export const sidebar = {
  context: null,
  contextualIds: null,
  firstSelectedTab: null,
  incognito: false,
  isMac: false,
  lastClosedTab: null,
  pinnedTabsWaitingToMove: null,
  tabGroupPutNewTabAtTheEnd: false,
  tabsWaitingToMove: null,
  windowId: null,
};

/**
 * set sidebar
 * @returns {void}
 */
export const setSidebar = async () => {
  const win = await getCurrentWindow({
    populate: true,
  });
  const {id, incognito} = win;
  const store = await getStorage(TAB_GROUP_NEW_TAB_AT_END);
  const os = await getOs();
  if (isObjectNotEmpty(store)) {
    const {tabGroupPutNewTabAtTheEnd} = store;
    const {checked} = tabGroupPutNewTabAtTheEnd;
    sidebar.tabGroupPutNewTabAtTheEnd = !!checked;
  } else {
    sidebar.tabGroupPutNewTabAtTheEnd = false;
  }
  sidebar.incognito = incognito;
  sidebar.isMac = os === "mac";
  sidebar.windowId = id;
};

/**
 * set context
 * @param {Object} elm - Element
 * @returns {void}
 */
export const setContext = async elm => {
  sidebar.context = elm && elm.nodeType === Node.ELEMENT_NODE && elm || null;
};

/**
 * set contextual identities cookieStoreIds
 * @returns {void}
 */
export const setContextualIds = async () => {
  const items = await getAllContextualIdentities();
  const arr = [];
  if (items) {
    for (const item of items) {
      const {cookieStoreId} = item;
      arr.push(cookieStoreId);
    }
  }
  sidebar.contextualIds = arr.length && arr || null;
};

/**
 * set last closed tab
 * @param {Object} tab - tabs.Tab
 * @returns {void}
 */
export const setLastClosedTab = async tab => {
  sidebar.lastClosedTab = isObjectNotEmpty(tab) && tab || null;
};

/**
 * set pinned tabs waiting to move
 * @param {?Array} arr - array of tabs
 * @returns {void}
 */
export const setPinnedTabsWaitingToMove = async arr => {
  sidebar.pinnedTabsWaitingToMove = Array.isArray(arr) && arr || null;
};

/**
 * set tabs waiting to move
 * @param {?Array} arr - array of tabs
 * @returns {void}
 */
export const setTabsWaitingToMove = async arr => {
  sidebar.tabsWaitingToMove = Array.isArray(arr) && arr || null;
};

/**
 * init sidebar
 * @param {boolean} bool - bypass cache
 * @returns {void}
 */
export const initSidebar = async (bool = false) => {
  const {windowId} = sidebar;
  await setSessionWindowValue(TAB_LIST, null, windowId);
  await clearStorage();
  window.location.reload(bool);
};

/**
 * get last closed tab
 * @returns {Object} - tabs.Tab
 */
export const getLastClosedTab = async () => {
  const {windowId} = sidebar;
  const tab = await getRecentlyClosedTab(windowId);
  await setLastClosedTab(tab);
  return tab || null;
};

/**
 * undo close tab
 * @returns {?AsyncFunction} - restoreSession()
 */
export const undoCloseTab = async () => {
  const {lastClosedTab} = sidebar;
  let func;
  if (lastClosedTab) {
    const {sessionId} = lastClosedTab;
    func = restoreSession(sessionId);
  }
  return func || null;
};

/* DnD */
/**
 * create DnD data
 * @param {!Object} evt - event
 * @returns {?Function} - handleDragStart()
 */
export const createDnDData = evt => {
  const {currentTarget} = evt;
  const {isMac, windowId} = sidebar;
  let func;
  if (currentTarget.draggable) {
    func = handleDragStart(evt, {isMac, windowId});
  }
  return func || null;
};

/**
 * add DnD event listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addDnDEventListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.draggable && elm.addEventListener("dragstart", createDnDData);
    elm.addEventListener("dragenter", handleDragEnter);
    elm.addEventListener("dragover", handleDragOver);
    elm.addEventListener("dragleave", handleDragLeave);
    elm.addEventListener("dragend", handleDragEnd);
    elm.addEventListener("drop", handleDrop);
  }
};

/* sidebar tab event handlers */
/**
 * handle create new tab
 * @param {Object} evt - event
 * @returns {?AsyncFunction} - createNewTab()
 */
export const handleCreateNewTab = evt => {
  const {button, target} = evt;
  const {windowId} = sidebar;
  let func;
  if (isNewTab(target) ||
      button === MOUSE_BUTTON_MIDDLE &&
      target === document.getElementById(SIDEBAR_MAIN)) {
    func = createNewTab(windowId).catch(throwErr);
  }
  return func || null;
};

/**
 * handle clicked tab
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleClickedTab = async evt => {
  const {button, ctrlKey, metaKey, shiftKey, target} = evt;
  const {firstSelectedTab, isMac, windowId} = sidebar;
  const tab = getSidebarTab(target);
  const func = [];
  if (button === MOUSE_BUTTON_MIDDLE) {
    tab && func.push(closeTabs([tab]));
  } else if (shiftKey) {
    if (tab && firstSelectedTab) {
      const items = await getTabsInRange(tab, firstSelectedTab);
      func.push(highlightTabs(items, windowId));
    }
  } else if (isMac && metaKey || !isMac && ctrlKey) {
    const firstTabIndex = getSidebarTabIndex(firstSelectedTab);
    const tabIndex = getSidebarTabIndex(tab);
    if (Number.isInteger(firstTabIndex) && Number.isInteger(tabIndex)) {
      const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
      const index = [firstTabIndex];
      tabIndex !== firstTabIndex && index.push(tabIndex);
      for (const item of items) {
        const itemIndex = getSidebarTabIndex(item);
        if (itemIndex === firstTabIndex && itemIndex === tabIndex) {
          index.splice(0, 1);
        } else if (itemIndex === tabIndex) {
          const tabIndexIndex = index.findIndex(i => i === tabIndex);
          index.splice(tabIndexIndex, 1);
        } else if (!index.includes(itemIndex)) {
          index.push(itemIndex);
        }
      }
      if (index.length && (index.length > 1 || !index.includes(tabIndex))) {
        func.push(highlightTab(index, windowId));
      } else {
        func.push(toggleHighlight(firstSelectedTab));
      }
    }
  } else if (tab) {
    func.push(activateTab(tab));
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * add sidebar tab click listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabClickListener = async elm => {
  elm && elm.nodeType === Node.ELEMENT_NODE &&
  elm.classList.contains(CLASS_TAB_CONTENT) &&
    elm.addEventListener("click", handleClickedTab);
};

/* tab handlers */
/**
 * handle activated tab
 * @param {!Object} info - activated info
 * @returns {void}
 */
export const handleActivatedTab = async info => {
  const {tabId, windowId} = info;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === sidebar.windowId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const {classList: newClass, parentNode: newParent} = tab;
      const {classList: newParentClass} = newParent;
      const items = document.querySelectorAll(
        `${TAB_QUERY}:not([data-tab-id="${tabId}"])`,
      );
      for (const item of items) {
        const {
          classList: oldClass, parentNode: {classList: oldParentClass},
        } = item;
        oldClass.remove(ACTIVE);
        oldParentClass.remove(ACTIVE);
      }
      newParentClass.add(ACTIVE);
      newClass.add(ACTIVE);
      sidebar.firstSelectedTab = tab;
    }
  }
};

/**
 * handle created tab
 * @param {!Object} tabsTab - tabs.Tab
 * @param {boolean} emulate - emulate tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleCreatedTab = async (tabsTab, emulate = false) => {
  const {
    active, audible, cookieStoreId, favIconUrl, hidden, id, index, openerTabId,
    pinned, status, title, url, windowId,
    mutedInfo: {
      muted,
    },
  } = tabsTab;
  const func = [];
  if (!Number.isInteger(id)) {
    throw new TypeError(`Expected Number but got ${getType(id)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === sidebar.windowId && id !== TAB_ID_NONE) {
    const tab = getTemplate(CLASS_TAB_TMPL);
    const tabItems = [
      `.${CLASS_TAB_CONTEXT}`, `.${CLASS_TAB_TOGGLE_ICON}`,
      `.${CLASS_TAB_CONTENT}`, `.${CLASS_TAB_ICON}`, `.${CLASS_TAB_TITLE}`,
      `.${CLASS_TAB_AUDIO}`, `.${CLASS_TAB_AUDIO_ICON}`,
      `.${CLASS_TAB_CLOSE}`, `.${CLASS_TAB_CLOSE_ICON}`,
    ];
    const items = tab.querySelectorAll(tabItems.join(","));
    const list = document.querySelectorAll(TAB_QUERY);
    const listedTab = list[index];
    const listedTabPrev = index > 0 && list[index - 1];
    let container, openerTab, openerTabsTab;
    for (const item of items) {
      const {classList} = item;
      if (classList.contains(CLASS_TAB_CONTEXT)) {
        item.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
        func.push(addTabContextClickListener(item));
      } else if (classList.contains(CLASS_TAB_TOGGLE_ICON)) {
        item.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
      } else if (classList.contains(CLASS_TAB_CONTENT)) {
        item.title = title;
        func.push(addTabClickListener(item));
      } else if (classList.contains(CLASS_TAB_ICON)) {
        func.push(
          setTabIcon(item, {favIconUrl, status, title, url}),
          addTabIconErrorListener(item),
        );
      } else if (classList.contains(CLASS_TAB_TITLE)) {
        item.textContent = title;
      } else if (classList.contains(CLASS_TAB_AUDIO)) {
        if (audible || muted) {
          classList.add(AUDIBLE);
        } else {
          classList.remove(AUDIBLE);
        }
        func.push(
          setTabAudio(item, {audible, muted}),
          addTabAudioClickListener(item),
        );
      } else if (classList.contains(CLASS_TAB_AUDIO_ICON)) {
        func.push(setTabAudioIcon(item, {audible, muted}));
      } else if (classList.contains(CLASS_TAB_CLOSE)) {
        item.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
        func.push(addTabCloseClickListener(item));
      } else if (classList.contains(CLASS_TAB_CLOSE_ICON)) {
        item.alt = i18n.getMessage(TAB_CLOSE);
      }
    }
    tab.dataset.tabId = id;
    tab.dataset.tab = JSON.stringify(tabsTab);
    await addDnDEventListener(tab);
    if (cookieStoreId && cookieStoreId !== COOKIE_STORE_DEFAULT) {
      const ident = await getContextualId(cookieStoreId);
      const {color, icon, name} = ident;
      const identIcon = tab.querySelector(`.${CLASS_TAB_IDENT_ICON}`);
      func.push(setContextualIdentitiesIcon(identIcon, {color, icon, name}));
    }
    if (Number.isInteger(openerTabId) && !emulate) {
      openerTab = document.querySelector(`[data-tab-id="${openerTabId}"]`);
      openerTabsTab = await getTab(openerTabId);
    }
    if (pinned) {
      container = document.getElementById(PINNED);
      tab.classList.add(PINNED);
      if (container.children[index]) {
        container.insertBefore(tab, container.children[index]);
      } else {
        container.appendChild(tab);
      }
      if (container.childElementCount > 1) {
        container.classList.add(CLASS_TAB_GROUP);
      }
    } else if (openerTab && !openerTab.classList.contains(PINNED) &&
               openerTabsTab) {
      container = openerTab.parentNode;
      if (sidebar.tabGroupPutNewTabAtTheEnd) {
        const {lastElementChild: lastChildTab} = container;
        const lastChildTabId = getSidebarTabId(lastChildTab);
        const lastChildTabsTab = await getTab(lastChildTabId);
        const {index: lastChildTabIndex} = lastChildTabsTab;
        if (index < lastChildTabIndex) {
          await moveTab(id, {
            index: lastChildTabIndex,
            windowId: sidebar.windowId,
          });
        }
        container.appendChild(tab);
      } else if (openerTabsTab.index === index - 1) {
        container.insertBefore(tab, openerTab.nextElementSibling);
      } else {
        container.appendChild(tab);
      }
      container.classList.contains(CLASS_TAB_COLLAPSED) &&
        func.push(toggleTabGroupCollapsedState({target: tab}));
    } else if (list.length !== index && listedTab && listedTab.parentNode &&
               listedTab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTabPrev && listedTabPrev.parentNode &&
               listedTabPrev.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTab.parentNode === listedTabPrev.parentNode) {
      container = listedTab.parentNode;
      container.insertBefore(tab, listedTab);
      container.classList.contains(CLASS_TAB_COLLAPSED) &&
        func.push(toggleTabGroupCollapsedState({target: tab}));
    } else {
      let target;
      if (list.length !== index && listedTab && listedTab.parentNode) {
        target = listedTab.parentNode;
      } else {
        target = document.getElementById(NEW_TAB);
      }
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      target.parentNode.insertBefore(container, target);
    }
    if (hidden) {
      tab.setAttribute("hidden", "hidden");
    } else {
      tab.removeAttribute("hidden");
      if (active ||
          Number.isInteger(openerTabId) && openerTabId !== TAB_ID_NONE) {
        func.push(scrollTabIntoView(tab, {
          active, openerTabId,
        }));
      }
    }
  }
  active && func.push(handleActivatedTab({tabId: id, windowId}));
  return Promise.all(func);
};

/**
 * handle attached tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - attached tab info
 * @returns {?AsyncFunction} - tabs.Tab
 */
export const handleAttachedTab = async (tabId, info) => {
  const {newPosition, newWindowId} = info;
  const {windowId} = sidebar;
  let func;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(newPosition)) {
    throw new TypeError(`Expected Number but got ${getType(newPosition)}.`);
  }
  if (!Number.isInteger(newWindowId)) {
    throw new TypeError(`Expected Number but got ${getType(newWindowId)}.`);
  }
  if (tabId !== TAB_ID_NONE && newWindowId === windowId) {
    const tabsTab = await getTab(tabId);
    tabsTab.index = newPosition;
    func = handleCreatedTab(tabsTab);
  }
  return func || null;
};

/**
 * handle detached tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - detached tab info
 * @returns {void}
 */
export const handleDetachedTab = async (tabId, info) => {
  const {oldWindowId} = info;
  const {windowId} = sidebar;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(oldWindowId)) {
    throw new TypeError(`Expected Number but got ${getType(oldWindowId)}.`);
  }
  if (oldWindowId === windowId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    tab && tab.parentNode.removeChild(tab);
  }
};

/**
 * handle highlighted tab
 * @param {!Object} info - info
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleHighlightedTab = async info => {
  const {tabIds, windowId} = info;
  const func = [];
  if (!Array.isArray(tabIds)) {
    throw new TypeError(`Expected Array but got ${getType(tabIds)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === sidebar.windowId) {
    const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    const highlightedTabIds = tabIds.filter(i => Number.isInteger(i));
    if (highlightedTabIds.length > 1) {
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        if (highlightedTabIds.includes(itemId)) {
          const index = highlightedTabIds.findIndex(i => i === itemId);
          highlightedTabIds.splice(index, 1);
        } else {
          func.push(removeHighlight(item));
        }
      }
      highlightedTabIds.length &&
        func.push(addHighlightToTabs(highlightedTabIds));
    } else {
      const [tabId] = highlightedTabIds;
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        itemId !== tabId && func.push(removeHighlight(item));
      }
    }
  }
  return Promise.all(func);
};

/**
 * handle moved tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - moved info
 * @returns {?AsyncFunction} - promise
 */
export const handleMovedTab = async (tabId, info) => {
  const {fromIndex, toIndex, windowId} = info;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(fromIndex)) {
    throw new TypeError(`Expected Number but got ${getType(fromIndex)}.`);
  }
  if (!Number.isInteger(toIndex)) {
    throw new TypeError(`Expected Number but got ${getType(toIndex)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  let func;
  if (windowId === sidebar.windowId && tab) {
    const tabIndex = getSidebarTabIndex(tab);
    const tabsTab = await getTab(tabId);
    const {index, pinned} = tabsTab;
    const {group, restore} = tab.dataset;
    let setSession;
    if (tabIndex !== index) {
      const {pinnedTabsWaitingToMove, tabsWaitingToMove} = sidebar;
      if (toIndex !== index) {
        const obj = {
          index, tabId, toIndex,
        };
        if (pinned) {
          const arr = pinnedTabsWaitingToMove || [];
          arr[index] = obj;
          await setPinnedTabsWaitingToMove(arr);
        } else {
          const arr = tabsWaitingToMove || [];
          arr[index] = obj;
          await setTabsWaitingToMove(arr);
        }
      } else if (pinned) {
        const container = document.getElementById(PINNED);
        const pinnedTabs = container.querySelectorAll(`.${PINNED}`);
        const target = pinnedTabs[toIndex];
        if (fromIndex > toIndex) {
          container.insertBefore(tab, target);
        } else {
          container.insertBefore(tab, target.nextElementSibling);
        }
        if (Array.isArray(pinnedTabsWaitingToMove)) {
          const arr = pinnedTabsWaitingToMove.filter(i => i);
          for (const item of arr) {
            const {tabId: itemTabId} = item;
            const itemTab =
              document.querySelector(`[data-tab-id="${itemTabId}"]`);
            container.insertBefore(itemTab, tab);
          }
          await setPinnedTabsWaitingToMove(null);
        }
        setSession = true;
      } else if (group) {
        const target = document.querySelector(`[data-tab-id="${group}"]`);
        const container = target.parentNode;
        container.insertBefore(tab, target.nextElementSibling);
        if (Array.isArray(tabsWaitingToMove)) {
          const arr = tabsWaitingToMove.filter(i => i);
          for (const item of arr) {
            const {tabId: itemTabId} = item;
            const itemTab =
              document.querySelector(`[data-tab-id="${itemTabId}"]`);
            container.insertBefore(itemTab, tab);
          }
          await setTabsWaitingToMove(null);
        }
        setSession = true;
      } else {
        const allTabs = document.querySelectorAll(TAB_QUERY);
        const target = allTabs[toIndex];
        const targetParent = target.parentNode;
        if (targetParent.classList.contains(CLASS_TAB_GROUP)) {
          const container = target.parentNode;
          if (fromIndex > toIndex) {
            container.insertBefore(tab, target);
          } else {
            container.insertBefore(tab, target.nextElementSibling);
          }
          if (Array.isArray(tabsWaitingToMove)) {
            const arr = tabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              container.insertBefore(itemTab, tab);
            }
            await setTabsWaitingToMove(null);
          }
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(tab);
          container.removeAttribute("hidden");
          if (fromIndex > toIndex) {
            targetParent.parentNode.insertBefore(container, targetParent);
          } else {
            targetParent.parentNode
              .insertBefore(container, targetParent.nextElementSibling);
          }
          if (Array.isArray(tabsWaitingToMove)) {
            const arr = tabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              const itemContainer = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              itemContainer.appendChild(itemTab);
              itemContainer.removeAttribute("hidden");
              container.parentNode.insertBefore(itemContainer, container);
            }
            await setTabsWaitingToMove(null);
          }
        }
        setSession = true;
      }
    }
    if (group) {
      tab.dataset.group = "";
    }
    if (restore) {
      tab.dataset.restore = "";
      setSession = true;
    }
    if (setSession) {
      func = restoreTabContainers().then(setSessionTabList);
    }
  }
  return func || null;
};

/**
 * handle removed tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - removed tab info
 * @returns {void}
 */
export const handleRemovedTab = async (tabId, info) => {
  const {isWindowClosing, windowId} = info;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === sidebar.windowId && !isWindowClosing) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    tab && tab.parentNode.removeChild(tab);
  }
};

/**
 * handle updated tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - updated tab info
 * @param {!Object} tabsTab - tabs.Tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleUpdatedTab = async (tabId, info, tabsTab) => {
  const {windowId} = tabsTab;
  const func = [];
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === sidebar.windowId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      await setTabContent(tab, tabsTab);
      if (info.hasOwnProperty("audible") || info.hasOwnProperty("mutedInfo")) {
        const tabAudio = tab.querySelector(`.${CLASS_TAB_AUDIO}`);
        const tabAudioIcon = tab.querySelector(`.${CLASS_TAB_AUDIO_ICON}`);
        const {audible, mutedInfo: {muted}} = tabsTab;
        const opt = {audible, muted};
        if (audible || muted) {
          tabAudio.classList.add(AUDIBLE);
        } else {
          tabAudio.classList.remove(AUDIBLE);
        }
        func.push(setTabAudio(tabAudio, opt));
        func.push(setTabAudioIcon(tabAudioIcon, opt));
      }
      if (info.hasOwnProperty("pinned")) {
        const pinnedContainer = document.getElementById(PINNED);
        if (info.pinned) {
          const container = pinnedContainer;
          tab.classList.add(PINNED);
          container.appendChild(tab);
          func.push(restoreTabContainers().then(setSessionTabList));
        } else {
          const {
            nextElementSibling: pinnedNextSibling,
            parentNode: pinnedParentNode,
          } = pinnedContainer;
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          tab.classList.remove(PINNED);
          container.appendChild(tab);
          container.removeAttribute("hidden");
          pinnedParentNode.insertBefore(container, pinnedNextSibling);
          func.push(restoreTabContainers().then(setSessionTabList));
        }
      }
      if (info.hasOwnProperty("status")) {
        if (info.status === "complete") {
          const activeTabsTab = await getActiveTab(windowId);
          const {id: activeTabId} = activeTabsTab;
          func.push(handleActivatedTab({
            windowId,
            tabId: activeTabId,
          }));
        }
      }
      info.hasOwnProperty("discarded") && func.push(setSessionTabList());
      if (info.hasOwnProperty("hidden")) {
        if (info.hidden) {
          tab.setAttribute("hidden", "hidden");
        } else {
          tab.removeAttribute("hidden");
        }
      }
      tab.dataset.tab = JSON.stringify(tabsTab);
    }
  }
  return Promise.all(func);
};

/* context menu */
/**
 * handle clicked menu
 * @param {!Object} info - clicked menu info
 * @returns {AsyncFunction} - clicked menu handler
 */
export const handleClickedMenu = async info => {
  const {menuItemId} = info;
  const {context, contextualIds, windowId} = sidebar;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
  const tab = getSidebarTab(context);
  const tabId = getSidebarTabId(tab);
  const func = [];
  let tabsTab;
  if (Number.isInteger(tabId)) {
    tabsTab = await getTab(tabId);
  }
  switch (menuItemId) {
    case TAB_ALL_BOOKMARK: {
      func.push(bookmarkTabs(Array.from(allTabs)));
      break;
    }
    case TAB_ALL_RELOAD:
      func.push(reloadTabs(Array.from(allTabs)));
      break;
    case TAB_ALL_SELECT:
      func.push(highlightTabs(Array.from(allTabs), windowId));
      break;
    case TAB_BOOKMARK:
      func.push(bookmarkTabs([tab]));
      break;
    case TAB_CLOSE:
      func.push(closeTabs([tab]));
      break;
    case TAB_CLOSE_END:
      func.push(closeTabsToEnd(tab));
      break;
    case TAB_CLOSE_OTHER:
      func.push(closeOtherTabs([tab]));
      break;
    case TAB_CLOSE_UNDO:
      func.push(undoCloseTab());
      break;
    case TAB_DUPE:
      func.push(dupeTabs([tab], windowId));
      break;
    case TAB_GROUP_COLLAPSE:
      tab && func.push(
        toggleTabGroupCollapsedState({target: tab}).then(setSessionTabList),
      );
      break;
    case TAB_GROUP_DETACH:
      tab && func.push(
        detachTabsFromGroup([tab], windowId).then(restoreTabContainers)
          .then(setSessionTabList),
      );
      break;
    case TAB_GROUP_DETACH_TABS:
      func.push(
        detachTabsFromGroup(Array.from(selectedTabs), windowId)
          .then(restoreTabContainers).then(setSessionTabList),
      );
      break;
    case TAB_GROUP_DOMAIN:
      func.push(
        groupSameDomainTabs(tabId, windowId).then(restoreTabContainers)
          .then(setSessionTabList),
      );
      break;
    case TAB_GROUP_SELECTED:
      func.push(
        groupSelectedTabs(windowId).then(restoreTabContainers)
          .then(setSessionTabList),
      );
      break;
    case TAB_GROUP_UNGROUP:
      tab && func.push(
        ungroupTabs(tab.parentNode).then(restoreTabContainers)
          .then(setSessionTabList),
      );
      break;
    case TAB_MOVE_END:
      func.push(moveTabsToEnd([tab], tabId, windowId));
      break;
    case TAB_MOVE_START:
      func.push(moveTabsToStart([tab], tabId, windowId));
      break;
    case TAB_MOVE_WIN:
      func.push(moveTabsToNewWindow([tab]));
      break;
    case TAB_MUTE:
      if (tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(muteTabs([tab], !muted));
      }
      break;
    case TAB_PIN:
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(pinTabs([tab], !pinned));
      }
      break;
    case TAB_RELOAD:
      func.push(reloadTabs([tab]));
      break;
    case TABS_BOOKMARK:
      func.push(bookmarkTabs(Array.from(selectedTabs)));
      break;
    case TABS_CLOSE:
      func.push(closeTabs(Array.from(selectedTabs)));
      break;
    case TABS_CLOSE_OTHER:
      func.push(closeOtherTabs(Array.from(selectedTabs)));
      break;
    case TABS_DUPE:
      func.push(dupeTabs(Array.from(selectedTabs).reverse(), windowId));
      break;
    case TABS_MOVE_END:
      func.push(moveTabsToEnd(Array.from(selectedTabs), tabId, windowId));
      break;
    case TABS_MOVE_START:
      func.push(moveTabsToStart(Array.from(selectedTabs), tabId, windowId));
      break;
    case TABS_MOVE_WIN:
      func.push(moveTabsToNewWindow(Array.from(selectedTabs)));
      break;
    case TABS_MUTE:
      if (tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(muteTabs(Array.from(selectedTabs), !muted));
      }
      break;
    case TABS_PIN:
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(pinTabs(Array.from(selectedTabs), !pinned));
      }
      break;
    case TABS_RELOAD:
      func.push(reloadTabs(Array.from(selectedTabs)));
      break;
    default: {
      if (Array.isArray(contextualIds)) {
        if (menuItemId.endsWith("Reopen")) {
          const itemId = menuItemId.replace(/Reopen$/, "");
          if (contextualIds.includes(itemId)) {
            let arr;
            if (selectedTabs.length) {
              arr = Array.from(selectedTabs);
            } else {
              arr = [tab];
            }
            func.push(reopenTabsInContainer(arr, itemId, windowId));
          }
        } else if (menuItemId.endsWith("NewTab")) {
          const itemId = menuItemId.replace(/NewTab$/, "");
          contextualIds.includes(itemId) &&
            func.push(createNewTabInContainer(itemId, windowId));
        }
      }
    }
  }
  return Promise.all(func);
};

/* events */
/**
 * handle event
 * @param {!Object} evt - event
 * @returns {Promse.<Array>} - results of each handler
 */
export const handleEvt = async evt => {
  const {button, ctrlKey, key, metaKey, shiftKey, target} = evt;
  const {contextualIds, isMac, windowId} = sidebar;
  const func = [];
  // select all tabs
  if ((isMac && metaKey || !isMac && ctrlKey) && key === "a") {
    const allTabs = document.querySelectorAll(TAB_QUERY);
    func.push(highlightTabs(Array.from(allTabs), windowId));
    evt.stopPropagation();
    evt.preventDefault();
  // context menu
  } else if (shiftKey && key === "F10" || key === "ContextMenu" ||
             button === MOUSE_BUTTON_RIGHT) {
    const tab = getSidebarTab(target);
    const bookmarkMenu = menuItems[TAB_ALL_BOOKMARK];
    const tabGroupMenu = menuItems[TAB_GROUP];
    const tabKeys = [
      TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_DUPE,
      TAB_MOVE, TAB_MUTE, TAB_PIN, TAB_RELOAD, TAB_REOPEN_CONTAINER,
    ];
    const tabsKeys = [
      TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE,
      TABS_MUTE, TABS_PIN, TABS_RELOAD, TABS_REOPEN_CONTAINER,
    ];
    const pageKeys = [TAB_CLOSE_UNDO, TAB_ALL_RELOAD, TAB_ALL_SELECT];
    const sepKeys = ["sep-1", "sep-2", "sep-3"];
    const allTabs = document.querySelectorAll(TAB_QUERY);
    const selectedTabs =
      document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    const pinnedContainer = document.getElementById(PINNED);
    const {nextElementSibling: firstUnpinnedContainer} = pinnedContainer;
    const {firstElementChild: firstUnpinnedTab} = firstUnpinnedContainer;
    const multiTabsSelected = !!(
      tab && tab.classList.contains(HIGHLIGHTED) &&
      selectedTabs && selectedTabs.length > 1
    );
    const allTabsSelected = !!(
      selectedTabs && selectedTabs.length > 1 &&
      allTabs && selectedTabs.length === allTabs.length
    );
    if (tab) {
      const {classList: tabClass, parentNode} = tab;
      const {
        classList: parentClass,
        firstElementChild: parentFirstChild,
        lastElementChild: parentLastChild,
      } = parentNode;
      const tabId = getSidebarTabId(tab);
      const tabsTab = await getTab(tabId);
      const {index, mutedInfo: {muted}, pinned} = tabsTab;
      const tabGroupKeys = [
        TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
        TAB_GROUP_DOMAIN, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
        "sepTabGroup-1",
      ];
      for (const itemKey of tabKeys) {
        const item = menuItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        if (multiTabsSelected) {
          data.visible = false;
        } else {
          switch (itemKey) {
            case TAB_CLOSE_END:
              data.enabled = index < allTabs.length - 1;
              data.title = title;
              break;
            case TAB_CLOSE_OTHER: {
              const obj =
                Number.isInteger(tabId) && document.querySelectorAll(
                  `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`,
                );
              data.enabled = !!(obj && obj.length);
              data.title = title;
              break;
            }
            case TAB_MUTE:
              data.enabled = true;
              data.title = muted && toggleTitle || title;
              break;
            case TAB_PIN:
              data.enabled = true;
              data.title = pinned && toggleTitle || title;
              break;
            case TAB_REOPEN_CONTAINER:
              data.enabled =
                !!(Array.isArray(contextualIds) && contextualIds.length);
              data.title = title;
              break;
            default:
              data.enabled = true;
              data.title = title;
          }
          data.visible = true;
        }
        func.push(updateContextMenu(id, data));
      }
      for (const itemKey of tabsKeys) {
        const item = menuItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        if (multiTabsSelected) {
          if (itemKey === TABS_CLOSE_OTHER) {
            if (allTabsSelected) {
              data.visible = false;
            } else {
              data.visible = true;
              data.enabled = true;
              data.title = title;
            }
          } else {
            switch (itemKey) {
              case TABS_MUTE:
                data.enabled = true;
                data.title = muted && toggleTitle || title;
                break;
              case TABS_PIN:
                data.enabled = true;
                data.title = pinned && toggleTitle || title;
                break;
              case TABS_REOPEN_CONTAINER:
                data.enabled =
                  !!(Array.isArray(contextualIds) && contextualIds.length);
                data.title = title;
                break;
              default:
                data.enabled = true;
                data.title = title;
            }
            data.visible = true;
          }
        } else {
          data.visible = false;
        }
        func.push(updateContextMenu(id, data));
      }
      if (multiTabsSelected) {
        const tabsMoveMenu = menuItems[TABS_MOVE];
        const tabsMoveKeys = [TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN];
        for (const itemKey of tabsMoveKeys) {
          const item = tabsMoveMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {
            visible: true,
          };
          switch (itemKey) {
            case TABS_MOVE_END:
              if (allTabsSelected) {
                data.enabled = false;
              } else if (pinned) {
                data.enabled = tab !== parentLastChild;
              } else {
                data.enabled = index !== allTabs.length - 1;
              }
              data.title = title;
              break;
            case TABS_MOVE_START:
              if (allTabsSelected) {
                data.enabled = false;
              } else if (pinned) {
                data.enabled = tab !== parentFirstChild;
              } else {
                data.enabled = tab !== firstUnpinnedTab;
              }
              data.title = title;
              break;
            default:
              data.enabled = true;
              data.title = title;
          }
          func.push(updateContextMenu(id, data));
        }
        if (Array.isArray(contextualIds)) {
          const itemKeys = contextualIds.filter(k => isString(k) && k);
          for (const itemKey of itemKeys) {
            func.push(updateContextMenu(`${itemKey}Reopen`, {
              parentId: TABS_REOPEN_CONTAINER,
            }));
          }
        }
      } else {
        const tabMoveMenu = menuItems[TAB_MOVE];
        const tabMoveKeys = [TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN];
        for (const itemKey of tabMoveKeys) {
          const item = tabMoveMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {
            visible: true,
          };
          switch (itemKey) {
            case TAB_MOVE_END:
              if (pinned) {
                data.enabled = tab !== parentLastChild;
              } else {
                data.enabled = index !== allTabs.length - 1;
              }
              data.title = title;
              break;
            case TAB_MOVE_START:
              if (pinned) {
                data.enabled = tab !== parentFirstChild;
              } else {
                data.enabled = tab !== firstUnpinnedTab;
              }
              data.title = title;
              break;
            default:
              data.enabled = true;
              data.title = title;
          }
          func.push(updateContextMenu(id, data));
        }
        if (Array.isArray(contextualIds)) {
          const itemKeys = contextualIds.filter(k => isString(k) && k);
          for (const itemKey of itemKeys) {
            func.push(updateContextMenu(`${itemKey}Reopen`, {
              parentId: TAB_REOPEN_CONTAINER,
            }));
          }
        }
      }
      for (const itemKey of tabGroupKeys) {
        const item = tabGroupMenu.subItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        switch (itemKey) {
          case TAB_GROUP_COLLAPSE:
            if (parentClass.contains(CLASS_TAB_GROUP) && toggleTitle) {
              data.enabled = true;
              data.title = parentClass.contains(CLASS_TAB_COLLAPSED) &&
                           toggleTitle || title;
            } else {
              data.enabled = false;
            }
            data.visible = true;
            break;
          case TAB_GROUP_DETACH:
            if (multiTabsSelected) {
              data.visible = false;
            } else if (!pinned && parentClass.contains(CLASS_TAB_GROUP)) {
              data.enabled = true;
              data.title = title;
              data.visible = true;
            } else {
              data.enabled = false;
              data.title = title;
              data.visible = true;
            }
            break;
          case TAB_GROUP_DETACH_TABS:
            if (multiTabsSelected) {
              if (!pinned && parentClass.contains(CLASS_TAB_GROUP) &&
                  tabClass.contains(HIGHLIGHTED)) {
                data.enabled = true;
                data.title = title;
                data.visible = true;
              } else {
                data.enabled = false;
                data.title = title;
                data.visible = true;
              }
            } else {
              data.visible = false;
            }
            break;
          case TAB_GROUP_DOMAIN:
            data.enabled = !pinned;
            data.title = title;
            data.visible = true;
            break;
          case TAB_GROUP_SELECTED:
            data.enabled = !pinned && tabClass.contains(HIGHLIGHTED);
            data.title = title;
            data.visible = true;
            break;
          case TAB_GROUP_UNGROUP:
            data.enabled = !pinned && parentClass.contains(CLASS_TAB_GROUP);
            data.title = title;
            data.visible = true;
            break;
          default:
            data.enabled = parentClass.contains(CLASS_TAB_GROUP);
            data.title = title;
            data.visible = true;
        }
        func.push(updateContextMenu(id, data));
      }
      for (const sep of sepKeys) {
        func.push(updateContextMenu(sep, {
          visible: true,
        }));
      }
      await setContext(tab);
      func.push(
        updateContextMenu(tabGroupMenu.id, {
          enabled: true,
          title: tabGroupMenu.title,
          visible: true,
        }),
        updateContextMenu(bookmarkMenu.id, {
          visible: false,
        }),
      );
    } else {
      for (const itemKey of tabKeys) {
        const item = menuItems[itemKey];
        func.push(updateContextMenu(item.id, {
          visible: false,
        }));
      }
      for (const itemKey of tabsKeys) {
        const item = menuItems[itemKey];
        func.push(updateContextMenu(item.id, {
          visible: false,
        }));
      }
      for (const sep of sepKeys) {
        func.push(updateContextMenu(sep, {
          visible: false,
        }));
      }
      await setContext(target);
      func.push(
        updateContextMenu(tabGroupMenu.id, {
          visible: false,
        }),
        updateContextMenu(bookmarkMenu.id, {
          enabled: true,
          title: bookmarkMenu.title,
          visible: true,
        }),
      );
    }
    if (isNewTab(target)) {
      func.push(
        updateContextMenu(NEW_TAB_OPEN_CONTAINER, {
          enabled: !!(Array.isArray(contextualIds) && contextualIds.length),
          visible: true,
        }),
        updateContextMenu("sep-0", {
          visible: true,
        }),
      );
      if (Array.isArray(contextualIds)) {
        const itemKeys = contextualIds.filter(k => isString(k) && k);
        for (const itemKey of itemKeys) {
          func.push(updateContextMenu(`${itemKey}NewTab`, {
            parentId: NEW_TAB_OPEN_CONTAINER,
          }));
        }
      }
    } else {
      const data = {
        visible: false,
      };
      func.push(
        updateContextMenu(NEW_TAB_OPEN_CONTAINER, data),
        updateContextMenu("sep-0", data),
      );
    }
    for (const itemKey of pageKeys) {
      const item = menuItems[itemKey];
      const {id, title} = item;
      const data = {
        title,
      };
      switch (itemKey) {
        case TAB_ALL_RELOAD:
          data.enabled = true;
          data.visible = tab && allTabs.length > 1 && !allTabsSelected || !tab;
          break;
        case TAB_ALL_SELECT:
          data.enabled = allTabs.length > 1 && !allTabsSelected;
          data.visible = true;
          break;
        case TAB_CLOSE_UNDO: {
          const {lastClosedTab} = sidebar;
          data.enabled = !!lastClosedTab;
          data.visible = true;
          break;
        }
        default:
      }
      func.push(updateContextMenu(id, data));
    }
  }
  return Promise.all(func);
};

/**
 * handle contextmenu event
 * @param {!Object} evt - event
 * @returns {AsyncFunction} - overrideContextMenu()
 */
export const handleContextmenuEvt = async evt => {
  const {target} = evt;
  const tabId = getSidebarTabId(target);
  const opt = {};
  if (Number.isInteger(tabId) && tabId !== TAB_ID_NONE) {
    opt.tabId = tabId;
    opt.context = "tab";
  }
  return overrideContextMenu(opt);
};

/* runtime message */
/**
 * handle runtime message
 * @param {!Object} msg - message
 * @param {!Object} sender - sender
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleMsg = async msg => {
  const items = Object.entries(msg);
  const func = [];
  for (const [key, value] of items) {
    switch (key) {
      case EXT_INIT:
        value && func.push(initSidebar(value));
        break;
      case THEME_CUSTOM_INIT:
        value && func.push(initCustomTheme(value));
        break;
      case THEME_CUSTOM_REQ:
        value && func.push(sendCurrentTheme());
        break;
      default:
    }
  }
  return Promise.all(func);
};

/**
 * request sidebar state update
 * @returns {?AsyncFunction} - sendMessage()
 */
export const requestSidebarStateUpdate = async () => {
  const {windowId} = sidebar;
  let func;
  if (Number.isInteger(windowId)) {
    const win = await getCurrentWindow();
    const {focused, id, type} = win;
    if (windowId === id && focused && type === "normal") {
      const msg = {
        [SIDEBAR_STATE_UPDATE]: {
          windowId,
        },
      };
      func = sendMessage(null, msg);
    }
  }
  return func || null;
};

/* storage */
/**
 * set variable
 * @param {string} item - item
 * @param {Object} obj - value object
 * @param {boolean} changed - changed
 * @returns {Promise.<Array>} - results of each handler
 */
export const setVar = async (item, obj, changed = false) => {
  const func = [];
  if (item && obj) {
    const {checked, value} = obj;
    switch (item) {
      case CUSTOM_BG:
      case CUSTOM_BG_ACTIVE:
      case CUSTOM_BG_HOVER:
      case CUSTOM_BG_SELECT:
      case CUSTOM_BG_SELECT_HOVER:
      case CUSTOM_BORDER:
      case CUSTOM_BORDER_ACTIVE:
      case CUSTOM_COLOR:
      case CUSTOM_COLOR_ACTIVE:
      case CUSTOM_COLOR_HOVER:
      case CUSTOM_COLOR_SELECT:
      case CUSTOM_COLOR_SELECT_HOVER:
        changed && func.push(
          updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`, item, value),
        );
        break;
      case TAB_GROUP_NEW_TAB_AT_END:
        sidebar[item] = !!checked;
        break;
      case THEME_CUSTOM:
      case THEME_DARK:
      case THEME_LIGHT:
        changed && checked && func.push(setTheme([item]));
        break;
      case THEME_SCROLLBAR_NARROW:
        changed && func.push(setScrollbarWidth(!!checked));
        break;
      case THEME_TAB_COMPACT:
        changed && func.push(setTabHeight(!!checked));
        break;
      default:
    }
  }
  return Promise.all(func);
};

/**
 * set variables
 * @param {Object} data - data
 * @returns {Promise.<Array>} - results of each handler
 */
export const setVars = async (data = {}) => {
  const items = Object.entries(data);
  const func = [];
  for (const item of items) {
    const [key, value] = item;
    const {newValue} = value;
    func.push(setVar(key, newValue || value, !!newValue));
  }
  return Promise.all(func);
};

/* restore tabs */
/**
 * restore highlighted tabs
 * @returns {void}
 */
export const restoreHighlightedTabs = async () => {
  const {windowId} = sidebar;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const items = await getHighlightedTab(windowId);
  const tabIds = new Set();
  for (const item of items) {
    const {id} = item;
    tabIds.add(id);
  }
  for (const tab of allTabs) {
    const tabId = getSidebarTabId(tab);
    if (tabIds.size > 1 && tabIds.has(tabId)) {
      tab.classList.add(HIGHLIGHTED);
    } else {
      tab.classList.remove(HIGHLIGHTED);
    }
  }
};

/**
 * restore tab groups
 * @returns {void}
 */
export const restoreTabGroups = async () => {
  const tabList = await getSessionTabList(TAB_LIST);
  if (tabList) {
    const {recent} = tabList;
    const containers =
      document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
    const items = document.querySelectorAll(TAB_QUERY);
    const l = items.length;
    let i = 0;
    while (i < l) {
      // NOTE: `tabList[j]` is for backward compat. Remove it in the future.
      const list = recent && recent[i] || tabList[i];
      if (list) {
        const {collapsed, containerIndex, url} = list;
        const item = items[i];
        const {dataset: {tab: itemTab}} = item;
        const {pinned, url: itemUrl} = JSON.parse(itemTab);
        if (pinned) {
          const container = document.getElementById(PINNED);
          const containerChildTabs = container.children;
          const containerChildTab = containerChildTabs[i];
          item !== containerChildTab && container.appendChild(item);
          if (collapsed) {
            container.classList.add(CLASS_TAB_COLLAPSED);
          } else {
            container.classList.remove(CLASS_TAB_COLLAPSED);
          }
        } else {
          const container = containers[containerIndex];
          if (item.parentNode !== container) {
            const prevList = recent[i - 1];
            const {url: prevUrl} = prevList;
            const prevItem = items[i - 1];
            const {dataset: {tab: prevItemTab}} = prevItem;
            const {url: prevItemUrl} = JSON.parse(prevItemTab);
            if (itemUrl === url || prevItemUrl === prevUrl) {
              container.appendChild(item);
            } else {
              break;
            }
          }
          if (collapsed) {
            container.classList.add(CLASS_TAB_COLLAPSED);
          } else {
            container.classList.remove(CLASS_TAB_COLLAPSED);
          }
        }
      } else {
        break;
      }
      i++;
    }
  }
};

/**
 * emulate tabs in order
 * @param {Array} arr - array of tabs.Tab
 * @returns {void}
 */
export const emulateTabsInOrder = async arr => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const tab = arr.shift();
  isObjectNotEmpty(tab) && await handleCreatedTab(tab, true);
  arr.length && await emulateTabsInOrder(arr);
};

/**
 * emulate tabs in sidebar
 * @returns {AsyncFunction} - emulateTabsInOrder()
 */
export const emulateTabs = async () => {
  const allTabs = await getAllTabsInWindow();
  return emulateTabsInOrder(allTabs);
};

/**
 * set main
 * @returns {void} - result of each handler
 */
export const setMain = async () => {
  const main = document.getElementById(SIDEBAR_MAIN);
  const newTab = document.getElementById(NEW_TAB);
  main.addEventListener("click", handleCreateNewTab);
  newTab.addEventListener("click", handleCreateNewTab);
};
