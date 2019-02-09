/**
 * main.js
 */

import {
  getType, isObjectNotEmpty, isString, logErr, throwErr,
} from "./common.js";
import {
  clearStorage, createTab, getActiveTab, getAllContextualIdentities,
  getAllTabsInWindow, getContextualId, getCurrentWindow, getHighlightedTab,
  getOs, getRecentlyClosedTab, getStorage, getTab,
  highlightTab, moveTab, restoreSession, setSessionWindowValue, updateTab,
} from "./browser.js";
import {
  bookmarkTabs, closeOtherTabs, closeTabs, closeTabsToEnd,
  createNewTab, createNewTabInContainer, dupeTabs, highlightTabs,
  moveTabsInOrder, moveTabsToEnd, moveTabsToStart, moveTabsToNewWindow,
  muteTabs, pinTabs, reloadTabs, reopenTabsInContainer,
} from "./browser-tabs.js";
import {
  activateTab, getSessionTabList, getSidebarTab, getSidebarTabId,
  getSidebarTabIndex, getSidebarTabContainer, getTabsInRange, getTemplate,
  isNewTab, setSessionTabList,
} from "./util.js";
import {
  addHighlightToTabs, addTabAudioClickListener, addTabCloseClickListener,
  addTabIconErrorListener, removeHighlight,
  setContextualIdentitiesIcon, setTabAudio, setTabAudioIcon, setTabContent,
  setTabIcon, toggleHighlight,
} from "./tab-content.js";
import {
  addTabContextClickListener, detachTabsFromGroup, groupSelectedTabs,
  restoreTabContainers, toggleTabGroupCollapsedState, ungroupTabs,
} from "./tab-group.js";
import {
  setTabHeight, setTheme,
} from "./theme.js";
import {
  updateContextMenu,
} from "./menu.js";
import menuItems from "./menu-items.js";

/* api */
const {
  i18n, tabs, windows,
} = browser;

/* constants */
import {
  ACTIVE, AUDIBLE,
  CLASS_TAB_AUDIO, CLASS_TAB_AUDIO_ICON, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_ICON,
  CLASS_TAB_IDENT_ICON, CLASS_TAB_TITLE, CLASS_TAB_TMPL, CLASS_TAB_TOGGLE_ICON,
  COOKIE_STORE_DEFAULT, EXT_INIT, HIGHLIGHTED, MIME_PLAIN, MIME_URI, NEW_TAB,
  NEW_TAB_OPEN_CONTAINER, PINNED, SIDEBAR_MAIN,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK, TAB_CLOSE,
  TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
  TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP, TAB_LIST,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_PIN,
  TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER, TABS_BOOKMARK, TABS_CLOSE,
  TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE, TABS_MOVE_END, TABS_MOVE_START,
  TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD, TABS_REOPEN_CONTAINER,
  THEME_DARK, THEME_LIGHT, THEME_TAB_COMPACT,
} from "./constant.js";
const {TAB_ID_NONE} = tabs;
const {WINDOW_ID_CURRENT, WINDOW_ID_NONE} = windows;
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
  if (tab) {
    sidebar.lastClosedTab = tab;
  } else {
    sidebar.lastClosedTab = null;
  }
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

/* new tab */
/**
 * handle new tab on click
 * @returns {AsyncFunction} - createNewTab()
 */
export const newTabOnClick = () => {
  const {windowId} = sidebar;
  return createNewTab(windowId).catch(throwErr);
};

/* DnD */
/**
 * extract drag and drop tabs
 * @param {Object} dropTarget - target element
 * @param {Object} data - dragged data
 * @param {Object} opt - key options
 * @returns {Promise.<Array>} - results of each handler
 */
export const extractDroppedTabs = async (dropTarget, data = {}, opt = {}) => {
  const {windowId} = sidebar;
  const {tabIds, windowId: dragWindowId} = data;
  const dropTargetId = getSidebarTabId(dropTarget);
  const dropTargetIndex = getSidebarTabIndex(dropTarget);
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      Number.isInteger(dropTargetId) && Array.isArray(tabIds) &&
      tabIds.length && !tabIds.includes(dropTargetId) &&
      Number.isInteger(dropTargetIndex) &&
      Number.isInteger(dragWindowId) && dragWindowId !== WINDOW_ID_NONE) {
    if (dragWindowId === windowId) {
      const {shiftKey} = opt;
      const {parentNode: dropParent} = dropTarget;
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
        let restore, i = 0, j = dropTargetIndex + 1;
        while (i < l) {
          const itemId = tabIds[i];
          const item = document.querySelector(`[data-tab-id="${itemId}"]`);
          if (item) {
            const itemIndex = getSidebarTabIndex(item);
            if (itemIndex === j) {
              dropParent.appendChild(item);
              restore = true;
            } else if (itemIndex < dropTargetIndex) {
              moveDownArr.push([itemId, item]);
            } else {
              moveUpArr.push([itemId, item]);
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
          for (const [itemId, item] of revArr) {
            dropParent.insertBefore(item, dropTarget.nextElementSibling);
            arr.push({
              index: getSidebarTabIndex(item),
              tabId: itemId,
            });
          }
          await moveTabsInOrder(arr, windowId);
        }
        if (moveDownArr.length) {
          const revArr = moveDownArr.reverse();
          const arr = [];
          for (const [itemId, item] of revArr) {
            dropParent.insertBefore(item, dropTarget.nextElementSibling);
            arr.push({
              index: getSidebarTabIndex(item),
              tabId: itemId,
            });
          }
          await moveTabsInOrder(arr, windowId);
        }
        if (restore) {
          func.push(restoreTabContainers().then(setSessionTabList));
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
              moveDownArr.push([itemId, item]);
            } else {
              moveUpArr.push([itemId, item]);
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
          for (const [itemId, item] of revArr) {
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
          await moveTabsInOrder(arr, windowId);
        }
        if (moveDownArr.length) {
          const revArr = moveDownArr.reverse();
          const arr = [];
          for (const [itemId, item] of revArr) {
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
          await moveTabsInOrder(arr, windowId);
        }
      }
    // dragged from other window
    } else {
      const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
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

/**
 * handle drop
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleDrop = evt => {
  const {ctrlKey, dataTransfer, metaKey, shiftKey, target} = evt;
  const {windowId} = sidebar;
  const url = dataTransfer.getData(MIME_URI);
  const data = dataTransfer.getData(MIME_PLAIN);
  const dropTarget = getSidebarTab(target);
  const dropTargetId = getSidebarTabId(target);
  const func = [];
  if (url) {
    const opt = {
      url,
      active: true,
    };
    if (Number.isInteger(dropTargetId)) {
      func.push(updateTab(dropTargetId, opt));
    } else {
      opt.windowId = windowId;
      func.push(createTab(opt));
    }
  } else if (dropTarget && data) {
    let item;
    try {
      item = JSON.parse(data);
    } catch (e) {
      logErr(e);
    }
    if (isObjectNotEmpty(item)) {
      const opt = {
        ctrlKey, metaKey, shiftKey,
      };
      func.push(extractDroppedTabs(dropTarget, item, opt));
    }
  }
  evt.stopPropagation();
  evt.preventDefault();
  return Promise.all(func).catch(throwErr);
};

/**
 * handle dragover
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragOver = evt => {
  const {dataTransfer: {types}} = evt;
  if (Array.isArray(types) && types.includes(MIME_PLAIN)) {
    evt.stopPropagation();
    evt.preventDefault();
  }
};

/**
 * handle dragenter
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragEnter = evt => {
  const {dataTransfer} = evt;
  const {types} = dataTransfer;
  if (Array.isArray(types) && types.includes(MIME_PLAIN)) {
    dataTransfer.dropEffect = "move";
    evt.stopPropagation();
    evt.preventDefault();
  }
};

/**
 * handle dragstart
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragStart = evt => {
  const {ctrlKey, metaKey, target} = evt;
  const {classList} = target;
  const {isMac, windowId} = sidebar;
  const container = getSidebarTabContainer(target);
  const data = {
    windowId,
  };
  let items;
  if (classList.contains(HIGHLIGHTED)) {
    items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  } else if (container && container.classList.contains(CLASS_TAB_GROUP) &&
             (isMac && metaKey || !isMac && ctrlKey)) {
    items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      item.classList.add(HIGHLIGHTED);
    }
  }
  if (items && items.length) {
    const arr = [];
    for (const item of items) {
      const tabId = getSidebarTabId(item);
      arr.push(tabId);
    }
    data.tabIds = arr;
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
  } else {
    const tabId = getSidebarTabId(target);
    data.tabIds = [tabId];
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
  }
};

/**
 * add DnD drop event listener
 * @param {Object} elm - draggable element
 * @returns {void}
 */
export const addDropEventListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("dragenter", handleDragEnter);
    elm.addEventListener("dragover", handleDragOver);
    elm.addEventListener("drop", handleDrop);
  }
};

/**
 * add DnD drag event listener
 * @param {Object} elm - draggable element
 * @returns {void}
 */
export const addDragEventListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.draggable) {
    elm.addEventListener("dragstart", handleDragStart);
  }
};

/* sidebar tab event handlers */
/**
 * handle clicked tab
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleClickedTab = async evt => {
  const {ctrlKey, metaKey, shiftKey, target} = evt;
  const {firstSelectedTab, isMac, windowId} = sidebar;
  const tab = getSidebarTab(target);
  const func = [];
  if (shiftKey) {
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
      if (tabIndex !== firstTabIndex) {
        index.push(tabIndex);
      }
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CONTENT)) {
    elm.addEventListener("click", handleClickedTab);
  }
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
        `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
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
      tab.removeAttribute("draggable");
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
      await addDragEventListener(tab);
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
      if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
        func.push(toggleTabGroupCollapsedState({target: tab}));
      }
    } else if (list.length !== index && listedTab && listedTab.parentNode &&
               listedTab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTabPrev && listedTabPrev.parentNode &&
               listedTabPrev.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTab.parentNode === listedTabPrev.parentNode) {
      await addDragEventListener(tab);
      container = listedTab.parentNode;
      container.insertBefore(tab, listedTab);
      if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
        func.push(toggleTabGroupCollapsedState({target: tab}));
      }
    } else {
      let target;
      if (list.length !== index && listedTab && listedTab.parentNode) {
        target = listedTab.parentNode;
      } else {
        target = document.getElementById(NEW_TAB);
      }
      await addDragEventListener(tab);
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      target.parentNode.insertBefore(container, target);
      func.push(addDropEventListener(container));
    }
    if (hidden) {
      tab.setAttribute("hidden", "hidden");
    } else {
      tab.removeAttribute("hidden");
    }
  }
  if (active) {
    func.push(handleActivatedTab({tabId: id, windowId}));
  }
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
      if (highlightedTabIds.length) {
        func.push(addHighlightToTabs(highlightedTabIds));
      }
    } else {
      const [tabId] = highlightedTabIds;
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        if (itemId !== tabId) {
          func.push(removeHighlight(item));
        }
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
    if (tabIndex !== index) {
      const allTabs = document.querySelectorAll(TAB_QUERY);
      if (toIndex !== index) {
        const obj = {
          index, tabId, toIndex,
        };
        if (pinned) {
          if (Array.isArray(sidebar.pinnedTabsWaitingToMove)) {
            sidebar.pinnedTabsWaitingToMove[index] = obj;
          } else {
            sidebar.pinnedTabsWaitingToMove = [];
            sidebar.pinnedTabsWaitingToMove[index] = obj;
          }
        } else if (Array.isArray(sidebar.tabsWaitingToMove)) {
          sidebar.tabsWaitingToMove[index] = obj;
        } else {
          sidebar.tabsWaitingToMove = [];
          sidebar.tabsWaitingToMove[index] = obj;
        }
      } else if (pinned) {
        const {pinnedTabsWaitingToMove} = sidebar;
        const container = document.getElementById(PINNED);
        if (toIndex === 0) {
          const {firstElementChild} = container;
          container.insertBefore(tab, firstElementChild);
          if (Array.isArray(pinnedTabsWaitingToMove)) {
            const arr = pinnedTabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              container.insertBefore(itemTab, firstElementChild);
            }
            sidebar.pinnedTabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        } else {
          const target = allTabs[toIndex];
          if (target.parentNode === container) {
            container.insertBefore(tab, target);
          } else {
            container.appendChild(tab);
          }
          if (Array.isArray(pinnedTabsWaitingToMove)) {
            const arr = pinnedTabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              if (target.parentNode === container) {
                container.insertBefore(itemTab, target);
              } else {
                container.appendChild(itemTab);
              }
            }
            sidebar.pinnedTabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        }
      } else if (group) {
        const openerTab = document.querySelector(`[data-tab-id="${group}"]`);
        if (openerTab && openerTab.parentNode !== tab.parentNode) {
          openerTab.parentNode.appendChild(tab);
        }
      } else if (toIndex === 0) {
        const {tabsWaitingToMove} = sidebar;
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        const [target] = allTabs;
        const {parentNode} = target;
        container.appendChild(tab);
        container.removeAttribute("hidden");
        parentNode.parentNode.insertBefore(container, parentNode);
        if (Array.isArray(tabsWaitingToMove)) {
          const arr = tabsWaitingToMove.filter(i => i);
          for (const item of arr) {
            const {tabId: itemTabId} = item;
            const itemTab =
              document.querySelector(`[data-tab-id="${itemTabId}"]`);
            const itemContainer = getTemplate(CLASS_TAB_CONTAINER_TMPL);
            itemContainer.appendChild(itemTab);
            itemContainer.removeAttribute("hidden");
            parentNode.parentNode.insertBefore(itemContainer, parentNode);
          }
          sidebar.tabsWaitingToMove = null;
          func = restoreTabContainers().then(setSessionTabList);
        }
      } else {
        const {tabsWaitingToMove} = sidebar;
        const target = allTabs[toIndex];
        const {parentNode: targetParent} = target;
        const unPinned =
          toIndex > fromIndex &&
          allTabs[fromIndex].parentNode.classList.contains(PINNED) &&
          targetParent.classList.contains(PINNED) &&
          target === targetParent.lastElementChild;
        const detached =
          toIndex > fromIndex &&
          allTabs[fromIndex].parentNode.classList.contains(CLASS_TAB_GROUP) &&
          allTabs[fromIndex].parentNode.nextElementSibling === targetParent &&
          target === targetParent.firstElementChild;
        if (unPinned || detached || target === targetParent.firstElementChild) {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(tab);
          container.removeAttribute("hidden");
          if (unPinned || toIndex > fromIndex && !detached) {
            targetParent.parentNode
              .insertBefore(container, targetParent.nextElementSibling);
          } else {
            targetParent.parentNode.insertBefore(container, targetParent);
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
            sidebar.tabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        } else {
          targetParent.insertBefore(tab, target.nextElementSibling);
          if (Array.isArray(tabsWaitingToMove)) {
            const arr = tabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              targetParent.insertBefore(itemTab, tab);
            }
            sidebar.tabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        }
      }
    }
    if (group) {
      tab.dataset.group = "";
    }
    if (restore) {
      tab.dataset.restore = "";
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
    if (tab) {
      tab.parentNode.removeChild(tab);
    }
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
          tab.removeAttribute("draggable");
          container.appendChild(tab);
          func.push(restoreTabContainers().then(setSessionTabList));
        } else {
          const {
            nextElementSibling: pinnedNextSibling,
            parentNode: pinnedParentNode,
          } = pinnedContainer;
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          tab.classList.remove(PINNED);
          tab.setAttribute("draggable", "true");
          func.push(addDragEventListener(tab));
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
      if (info.hasOwnProperty("discarded")) {
        func.push(setSessionTabList());
      }
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
      if (tab) {
        func.push(
          toggleTabGroupCollapsedState({target: tab}).then(setSessionTabList)
        );
      }
      break;
    case TAB_GROUP_DETACH:
      if (tab) {
        func.push(
          detachTabsFromGroup([tab], windowId).then(restoreTabContainers)
            .then(setSessionTabList)
        );
      }
      break;
    case TAB_GROUP_DETACH_TABS:
      func.push(
        detachTabsFromGroup(Array.from(selectedTabs), windowId)
          .then(restoreTabContainers).then(setSessionTabList)
      );
      break;
    case TAB_GROUP_SELECTED:
      func.push(
        groupSelectedTabs(windowId).then(restoreTabContainers)
          .then(setSessionTabList)
      );
      break;
    case TAB_GROUP_UNGROUP:
      if (tab) {
        func.push(
          ungroupTabs(tab.parentNode).then(restoreTabContainers)
            .then(setSessionTabList)
        );
      }
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
          if (contextualIds.includes(itemId)) {
            func.push(createNewTabInContainer(itemId, windowId));
          }
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * handle event
 * @param {!Object} evt - event
 * @returns {Promse.<Array>} - results of each handler
 */
export const handleEvt = async evt => {
  const {button, ctrlKey, key, metaKey, shiftKey, target} = evt;
  const {isMac, windowId} = sidebar;
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
      const {contextualIds} = sidebar;
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
        TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP, "sepTabGroup-1",
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
                  `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`
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
          const data = {};
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
          data.visible = true;
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
          const data = {};
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
          data.visible = true;
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
      if (parentClass.contains(CLASS_TAB_GROUP) ||
          tabClass.contains(HIGHLIGHTED)) {
        func.push(
          updateContextMenu(tabGroupMenu.id, {
            enabled: true,
            title: tabGroupMenu.title,
            visible: true,
          }),
        );
      } else {
        func.push(
          updateContextMenu(tabGroupMenu.id, {
            enabled: false,
            title: tabGroupMenu.title,
            visible: true,
          }),
        );
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
      sidebar.context = tab;
      func.push(updateContextMenu(bookmarkMenu.id, {
        visible: false,
      }));
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
      sidebar.context = target;
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
    for (const itemKey of pageKeys) {
      const item = menuItems[itemKey];
      const {id, title} = item;
      const data = {};
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
      data.title = title;
      func.push(updateContextMenu(id, data));
    }
  }
  return Promise.all(func);
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
        if (value) {
          func.push(initSidebar(value));
        }
        break;
      default:
    }
  }
  return Promise.all(func);
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
    const {checked} = obj;
    switch (item) {
      case TAB_GROUP_NEW_TAB_AT_END:
        sidebar[item] = !!checked;
        break;
      case THEME_DARK:
      case THEME_LIGHT:
        if (changed && checked) {
          func.push(setTheme([item]));
        }
        break;
      case THEME_TAB_COMPACT:
        if (changed) {
          func.push(setTabHeight(!!checked));
        }
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
  if (Array.isArray(items)) {
    for (const item of items) {
      const {id} = item;
      tabIds.add(id);
    }
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
          if (item !== containerChildTab) {
            container.appendChild(item);
          }
          if (collapsed) {
            container.classList.add(CLASS_TAB_COLLAPSED);
          } else {
            container.classList.remove(CLASS_TAB_COLLAPSED);
          }
        } else {
          const container = containers[containerIndex];
          if (item.parentNode !== container) {
            // NOTE: `tabList[i - 1]` is for backward compat.
            const prevList = recent && recent[i - 1] || tabList[i - 1];
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
 * emulate tabs in sidebar
 * @returns {void}
 */
export const emulateTabs = async () => {
  const items = await getAllTabsInWindow(WINDOW_ID_CURRENT);
  const func = [];
  for (const item of items) {
    func.push(handleCreatedTab(item, true));
  }
  await Promise.all(func);
};

/**
 * set main
 * @returns {void} - result of each handler
 */
export const setMain = async () => {
  const elm = document.getElementById(SIDEBAR_MAIN);
  const newTab = document.getElementById(NEW_TAB);
  await addDropEventListener(elm);
  newTab.addEventListener("click", newTabOnClick);
};
