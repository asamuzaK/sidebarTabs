/**
 * sidebar.js
 */

import {
  isObjectNotEmpty, isString, logErr, throwErr,
} from "./common.js";
import {
  clearStorage, createNewWindow, createTab, getActiveTab,
  getAllContextualIdentities, getAllTabsInWindow, getContextualId,
  getCurrentWindow, getHighlightedTab, getOs, getRecentlyClosedTab,
  getStorage, getTab, highlightTab, makeConnection, moveTab,
  restoreSession, setSessionWindowValue, updateTab,
} from "./browser.js";
import {
  bookmarkTabs, closeOtherTabs, closeTabs, closeTabsToEnd, dupeTabs,
  highlightTabs, moveTabsInOrder, moveTabsToEnd, moveTabsToStart,
  moveTabsToNewWindow, muteTabs, pinTabs, reloadTabs, reopenTabsInContainer,
} from "./browser-tabs.js";
import {
  activateTab, getSessionTabList, getSidebarTab, getSidebarTabId,
  getSidebarTabIndex, getSidebarTabContainer, getTabsInRange, getTemplate,
  setSessionTabList,
} from "./util.js";
import {
  addHighlightToTabs, addTabAudioClickListener, addTabCloseClickListener,
  addTabIconErrorListener, observeTab, removeHighlight,
  setContextualIdentitiesIcon, setTabAudio, setTabAudioIcon, setTabContent,
  setTabIcon, toggleHighlight,
} from "./tab-content.js";
import {
  addTabContextClickListener, detachTabsFromGroup, expandActivatedCollapsedTab,
  groupSelectedTabs, toggleTabGroupCollapsedState, ungroupTabs,
} from "./tab-group.js";
import {
  localizeHtml,
} from "./localize.js";
import {
  setSidebarTheme, setTabHeight, setTheme,
} from "./theme.js";
import {
  createContextMenu, updateContextMenu,
} from "./menu.js";
import menuItems from "./menu-items.js";

/* api */
const {
  contextualIdentities, i18n, menus, runtime, storage, tabs, windows,
} = browser;

/* constants */
import {
  ACTIVE, AUDIBLE, CLASS_TAB_AUDIO, CLASS_TAB_AUDIO_ICON, CLASS_TAB_CLOSE,
  CLASS_TAB_CLOSE_ICON, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT,
  CLASS_TAB_GROUP, CLASS_TAB_ICON, CLASS_TAB_IDENT_ICON, CLASS_TAB_TITLE,
  CLASS_TAB_TMPL, CLASS_TAB_TOGGLE_ICON, COOKIE_STORE_DEFAULT, EXT_INIT,
  HIGHLIGHTED, MIME_PLAIN, MIME_URI, NEW_TAB, PINNED, SIDEBAR_MAIN, TAB,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK, TAB_CLOSE,
  TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
  TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP, TAB_LIST,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_OBSERVE,
  TAB_PIN, TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER, TABS_BOOKMARK,
  TABS_CLOSE, TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE, TABS_MOVE_END,
  TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD,
  TABS_REOPEN_CONTAINER, THEME_DARK, THEME_LIGHT, THEME_TAB_COMPACT,
} from "./constant.js";
const {TAB_ID_NONE} = tabs;
const {WINDOW_ID_CURRENT} = windows;
const MOUSE_BUTTON_RIGHT = 2;

/* sidebar */
const sidebar = {
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
const setSidebar = async () => {
  const win = await getCurrentWindow({
    populate: true,
  });
  if (win) {
    const {id, incognito} = win;
    const {
      tabGroupPutNewTabAtTheEnd,
    } = await getStorage(TAB_GROUP_NEW_TAB_AT_END);
    const os = await getOs();
    if (tabGroupPutNewTabAtTheEnd) {
      const {checked} = tabGroupPutNewTabAtTheEnd;
      sidebar.tabGroupPutNewTabAtTheEnd = !!checked;
    }
    sidebar.incognito = incognito;
    sidebar.isMac = os === "mac";
    sidebar.windowId = id;
  }
};

/**
 * set contextual identities cookieStoreIds
 * @returns {void}
 */
const setContextualIds = async () => {
  const items = await getAllContextualIdentities();
  const arr = [];
  if (items) {
    for (const item of items) {
      const {cookieStoreId} = item;
      if (isString(cookieStoreId)) {
        arr.push(cookieStoreId);
      }
    }
  }
  sidebar.contextualIds = arr.length && arr || null;
};

/**
 * init sidebar
 * @param {boolean} bool - bypass cache
 * @returns {void}
 */
const initSidebar = async (bool = false) => {
  const {windowId} = sidebar;
  await setSessionWindowValue(TAB_LIST, null, windowId);
  await clearStorage();
  window.location.reload(bool);
};

/**
 * get last closed tab
 * @returns {Object} - tabs.Tab
 */
const getLastClosedTab = async () => {
  const {windowId} = sidebar;
  const tab = await getRecentlyClosedTab(windowId);
  if (tab) {
    sidebar.lastClosedTab = tab;
  }
  return tab || null;
};

/**
 * undo close tab
 * @returns {?AsyncFunction} - restoreSession()
 */
const undoCloseTab = async () => {
  const {lastClosedTab} = sidebar;
  let func;
  if (lastClosedTab) {
    const {sessionId} = lastClosedTab;
    if (isString(sessionId)) {
      func = restoreSession(sessionId);
    }
  }
  return func || null;
};

/* new tab */
/**
 * create new tab
 * @returns {AsyncFunction} - createTab()
 */
const createNewTab = async () => {
  const {windowId} = sidebar;
  return createTab({
    windowId,
    active: true,
  });
};

/**
 * add new tab click listener
 * @returns {void}
 */
const addNewTabClickListener = async () => {
  const newTab = document.getElementById(NEW_TAB);
  if (newTab) {
    newTab.addEventListener("click", evt => createNewTab(evt).catch(throwErr));
  }
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
  const {tabIds, windowId: dragWindowId} = data;
  const {windowId} = sidebar;
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

/**
 * handle drop
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
const handleDrop = evt => {
  const {ctrlKey, dataTransfer, metaKey, shiftKey, target} = evt;
  const {windowId} = sidebar;
  const url = dataTransfer.getData(MIME_URI);
  const data = dataTransfer.getData(MIME_PLAIN);
  const dropTarget = getSidebarTab(target);
  const func = [];
  if (url) {
    const opt = {
      url,
      active: true,
    };
    if (dropTarget) {
      const tabId = getSidebarTabId(dropTarget);
      if (Number.isInteger(tabId)) {
        func.push(updateTab(tabId, opt));
      }
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
const handleDragOver = evt => {
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
const handleDragEnter = evt => {
  const {target, dataTransfer} = evt;
  if (target.nodeType === Node.ELEMENT_NODE) {
    const {types} = dataTransfer;
    if (Array.isArray(types) && types.includes(MIME_PLAIN)) {
      dataTransfer.dropEffect = "move";
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
};

/**
 * add DnD drop event listener
 * @param {Object} elm - draggable element
 * @returns {void}
 */
const addDropEventListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("dragenter", handleDragEnter);
    elm.addEventListener("dragover", handleDragOver);
    elm.addEventListener("drop", handleDrop);
  }
};

/**
 * handle dragstart
 * @param {!Object} evt - event
 * @returns {void}
 */
const handleDragStart = evt => {
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
      if (Number.isInteger(tabId)) {
        arr.push(tabId);
      }
    }
    if (arr.length) {
      data.tabIds = arr;
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
    }
  } else {
    const tabId = getSidebarTabId(target);
    if (Number.isInteger(tabId)) {
      data.tabIds = [tabId];
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
    }
  }
};

/**
 * add DnD drag event listener
 * @param {Object} elm - draggable element
 * @returns {void}
 */
const addDragEventListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("dragstart", handleDragStart);
  }
};

/* sidebar tab event handlers */
/**
 * handle clicked tab
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
const handleClickedTab = async evt => {
  const {ctrlKey, metaKey, shiftKey, target} = evt;
  const {firstSelectedTab, isMac, windowId} = sidebar;
  const firstTabIndex = getSidebarTabIndex(firstSelectedTab);
  const tab = getSidebarTab(target);
  const func = [];
  if (shiftKey) {
    if (tab && firstSelectedTab) {
      const items = await getTabsInRange(tab, firstSelectedTab);
      func.push(highlightTabs(items, windowId));
    }
  } else if (isMac && metaKey || !isMac && ctrlKey) {
    if (Number.isInteger(firstTabIndex)) {
      const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
      const tabIndex = getSidebarTabIndex(tab);
      const index = [firstTabIndex];
      if (tab !== firstSelectedTab) {
        index.push(tabIndex);
      }
      for (const item of items) {
        const itemIndex = getSidebarTabIndex(item);
        if (Number.isInteger(itemIndex)) {
          if (itemIndex === firstTabIndex && itemIndex === tabIndex) {
            index.splice(0, 1);
          } else if (itemIndex === tabIndex) {
            const tabIndexIndex = index.findIndex(i => i === tabIndex);
            index.splice(tabIndexIndex, 1);
          } else {
            index.push(itemIndex);
          }
        }
      }
      if (index.length) {
        if (index.length === 1 && index.includes(tabIndex)) {
          func.push(toggleHighlight(firstSelectedTab));
        } else {
          func.push(highlightTab(index, windowId));
        }
      } else {
        func.push(toggleHighlight(firstSelectedTab));
      }
    }
  } else {
    func.push(activateTab(tab));
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * add sidebar tab click listener
 * @param {Object} elm - element
 * @returns {void}
 */
const addTabClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", handleClickedTab);
  }
};

/**
 * restore sidebar tab containers
 * @returns {Promise.<Array>} - results of each handler
 */
const restoreTabContainers = async () => {
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  const func = [];
  if (items) {
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
      func.push(addDropEventListener(item));
    }
  }
  return Promise.all(func);
};

/* tab handlers */
/**
 * handle activated tab
 * @param {!Object} info - activated info
 * @returns {void}
 */
const handleActivatedTab = async info => {
  const {tabId, windowId} = info;
  if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
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
 * @param {Object} tabsTab - tabs.Tab
 * @param {boolean} emulate - emulate tab
 * @returns {Promise.<Array>} - results of each handler
 */
const handleCreatedTab = async (tabsTab, emulate = false) => {
  const func = [];
  if (isObjectNotEmpty(tabsTab)) {
    const {
      active, audible, cookieStoreId, favIconUrl, id, index, mutedInfo,
      openerTabId, pinned, status, title, url, windowId,
    } = tabsTab;
    const {muted} = mutedInfo;
    if (windowId === sidebar.windowId && id !== TAB_ID_NONE) {
      const tab = getTemplate(CLASS_TAB_TMPL);
      const tabItems = [
        `.${TAB}`, `.${CLASS_TAB_CONTEXT}`, `.${CLASS_TAB_TOGGLE_ICON}`,
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
          item.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
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
          item.alt = i18n.getMessage(`${TAB_CLOSE}`);
        }
      }
      tab.dataset.tabId = id;
      tab.dataset.tab = JSON.stringify(tabsTab);
      if (cookieStoreId && cookieStoreId !== COOKIE_STORE_DEFAULT) {
        const ident = await getContextualId(cookieStoreId);
        if (ident) {
          const {color, icon, name} = ident;
          const identIcon = tab.querySelector(`.${CLASS_TAB_IDENT_ICON}`);
          func.push(
            setContextualIdentitiesIcon(identIcon, {color, icon, name})
          );
        }
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
          if (lastChildTab && lastChildTab.dataset &&
              lastChildTab.dataset.tabId) {
            const lastChildTabId = getSidebarTabId(lastChildTab);
            const lastChildTabsTab = await getTab(lastChildTabId);
            if (lastChildTabsTab) {
              const {index: lastChildTabIndex} = lastChildTabsTab;
              if (index < lastChildTabIndex) {
                await moveTab(id, {
                  index: lastChildTabIndex,
                  windowId: sidebar.windowId,
                });
              }
              container.appendChild(tab);
            }
          } else {
            container.insertBefore(tab, openerTab.nextElementSibling);
          }
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
      }
    }
    if (active) {
      func.push(handleActivatedTab({tabId: id, windowId}));
    }
  }
  return Promise.all(func);
};

/**
 * handle attached tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - attached tab info
 * @returns {?AsyncFunction} - tabs.Tab
 */
const handleAttachedTab = async (tabId, info) => {
  let func;
  if (tabId !== TAB_ID_NONE) {
    const {newPosition, newWindowId} = info;
    const {windowId} = sidebar;
    if (newWindowId === windowId) {
      const tabsTab = await getTab(tabId);
      if (tabsTab) {
        tabsTab.index = newPosition;
        func = handleCreatedTab(tabsTab);
      }
    }
  }
  return func || null;
};

/**
 * handle detached tab
 * @param {!number} tabId - tab ID
 * @param {!Object} info - detached tab info
 * @returns {void}
 */
const handleDetachedTab = async (tabId, info) => {
  if (tabId !== TAB_ID_NONE) {
    const {oldWindowId} = info;
    const {windowId} = sidebar;
    if (oldWindowId === windowId) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      tab && tab.parentNode.removeChild(tab);
    }
  }
};

/**
 * handle highlighted tab
 * @param {!Object} info - info
 * @returns {Promise.<Array>} - results of each handler
 */
const handleHighlightedTab = async info => {
  const {tabIds, windowId} = info;
  const func = [];
  if (Array.isArray(tabIds) && windowId === sidebar.windowId) {
    const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    if (tabIds.length > 1) {
      const highlightedTabs = Array.from(tabIds);
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        if (highlightedTabs.length && highlightedTabs.includes(itemId)) {
          const index = highlightedTabs.findIndex(i => i === itemId);
          highlightedTabs.splice(index, 1);
        } else {
          func.push(removeHighlight(item));
        }
      }
      if (highlightedTabs.length) {
        func.push(addHighlightToTabs(highlightedTabs));
      }
    } else {
      const [tabId] = tabIds;
      if (Number.isInteger(tabId)) {
        for (const item of items) {
          const itemId = getSidebarTabId(item);
          if (itemId !== tabId) {
            func.push(removeHighlight(item));
          }
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
const handleMovedTab = async (tabId, info) => {
  const {fromIndex, toIndex, windowId} = info;
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
        const container = document.getElementById(PINNED);
        const {firstElementChild, lastElementChild} = container;
        const lastPinnedTabIndex = getSidebarTabIndex(lastElementChild);
        if (toIndex === 0) {
          container.insertBefore(tab, firstElementChild);
          if (Array.isArray(sidebar.pinnedTabsWaitingToMove)) {
            const {pinnedTabsWaitingToMove: arr} = sidebar;
            for (const item of arr) {
              if (isObjectNotEmpty(item)) {
                const {tabId: itemTabId} = item;
                const itemTab =
                  document.querySelector(`[data-tab-id="${itemTabId}"]`);
                container.insertBefore(itemTab, firstElementChild);
              }
            }
            sidebar.pinnedTabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        } else {
          if (toIndex === lastPinnedTabIndex) {
            container.appendChild(tab);
          } else {
            const target = allTabs[toIndex];
            const {nextElementSibling} = target;
            container.insertBefore(tab, nextElementSibling);
          }
          if (Array.isArray(sidebar.pinnedTabsWaitingToMove)) {
            const {pinnedTabsWaitingToMove: arr} = sidebar;
            for (const item of arr) {
              if (isObjectNotEmpty(item)) {
                const {tabId: itemTabId} = item;
                const itemTab =
                  document.querySelector(`[data-tab-id="${itemTabId}"]`);
                container.insertBefore(itemTab, tab);
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
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        const [target] = allTabs;
        const {parentNode} = target;
        container.appendChild(tab);
        container.removeAttribute("hidden");
        parentNode.parentNode.insertBefore(container, parentNode);
        if (Array.isArray(sidebar.tabsWaitingToMove)) {
          const {tabsWaitingToMove: arr} = sidebar;
          for (const item of arr) {
            if (isObjectNotEmpty(item)) {
              const {tabId: itemTabId} = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              const itemContainer = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              itemContainer.appendChild(itemTab);
              itemContainer.removeAttribute("hidden");
              parentNode.parentNode.insertBefore(itemContainer, parentNode);
            }
          }
          sidebar.tabsWaitingToMove = null;
          func = restoreTabContainers().then(setSessionTabList);
        }
      } else {
        const lastTabIndex = allTabs.length - 1;
        const target = allTabs[toIndex];
        const {
          nextElementSibling: targetNextSibling, parentNode: targetParent,
        } = target;
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
          if (toIndex === lastTabIndex) {
            const newtab = document.getElementById(NEW_TAB);
            targetParent.parentNode.insertBefore(container, newtab);
          } else {
            targetParent.parentNode.insertBefore(container, targetParent);
          }
          if (Array.isArray(sidebar.tabsWaitingToMove)) {
            const {tabsWaitingToMove: arr} = sidebar;
            for (const item of arr) {
              if (isObjectNotEmpty(item)) {
                const {tabId: itemTabId} = item;
                const itemTab =
                  document.querySelector(`[data-tab-id="${itemTabId}"]`);
                const itemContainer = getTemplate(CLASS_TAB_CONTAINER_TMPL);
                itemContainer.appendChild(itemTab);
                itemContainer.removeAttribute("hidden");
                container.parentNode.insertBefore(itemContainer, container);
              }
            }
            sidebar.tabsWaitingToMove = null;
            func = restoreTabContainers().then(setSessionTabList);
          }
        } else {
          targetParent.insertBefore(tab, targetNextSibling);
          if (Array.isArray(sidebar.tabsWaitingToMove)) {
            const {tabsWaitingToMove: arr} = sidebar;
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
      tab.dataset.group = null;
    }
    if (restore) {
      tab.dataset.restore = null;
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
const handleRemovedTab = async (tabId, info) => {
  const {isWindowClosing, windowId} = info;
  if (windowId === sidebar.windowId && !isWindowClosing &&
      tabId !== TAB_ID_NONE) {
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
const handleUpdatedTab = async (tabId, info, tabsTab) => {
  const {windowId} = tabsTab;
  const func = [];
  if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      await setTabContent(tab, tabsTab);
      if (info.hasOwnProperty("audible") || info.hasOwnProperty("mutedInfo")) {
        const tabAudio = tab.querySelector(`.${CLASS_TAB_AUDIO}`);
        const tabAudioIcon = tab.querySelector(`.${CLASS_TAB_AUDIO_ICON}`);
        const {audible, mutedInfo: {muted}} = tabsTab;
        const opt = {audible, muted};
        if (tabAudio) {
          if (audible || muted) {
            tabAudio.classList.add(AUDIBLE);
          } else {
            tabAudio.classList.remove(audible);
          }
          func.push(setTabAudio(tabAudio, opt));
        }
        if (tabAudioIcon) {
          func.push(setTabAudioIcon(tabAudioIcon, opt));
        }
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
            nextElementSibling: pinnedNextElement,
            parentNode: pinnedParentNode,
          } = pinnedContainer;
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          tab.classList.remove(PINNED);
          tab.setAttribute("draggable", "true");
          func.push(addDragEventListener(tab));
          container.appendChild(tab);
          container.removeAttribute("hidden");
          pinnedParentNode.insertBefore(container, pinnedNextElement);
          func.push(restoreTabContainers().then(setSessionTabList));
        }
      }
      if (info.hasOwnProperty("status")) {
        if (info.status === "complete") {
          const activeTabsTab = await getActiveTab(windowId);
          const {id: activeTabId} = activeTabsTab;
          const activeTab =
            document.querySelector(`[data-tab-id="${activeTabId}"]`);
          const {classList} = activeTab;
          if (!classList.contains(ACTIVE)) {
            func.push(handleActivatedTab({
              windowId,
              tabId: activeTabId,
            }));
          }
        }
      }
      if (info.hasOwnProperty("url")) {
        func.push(observeTab(tabId));
      }
      if (info.hasOwnProperty("discarded")) {
        func.push(setSessionTabList());
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
const handleClickedMenu = async info => {
  const {menuItemId} = info;
  const {context, contextualIds, windowId} = sidebar;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
  const tab = getSidebarTab(context);
  const func = [];
  let isGrouped, tabId, tabParent, tabParentClassList, tabsTab;
  if (tab) {
    tabId = getSidebarTabId(tab);
    tabParent = tab.parentNode;
    tabParentClassList = tabParent.classList;
    isGrouped = tabParentClassList.contains(CLASS_TAB_GROUP);
    if (Number.isInteger(tabId)) {
      tabsTab = await getTab(tabId);
    } else {
      tabsTab = tab && tab.dataset.tab && JSON.parse(tab.dataset.tab);
    }
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
      if (tab && isGrouped) {
        func.push(
          toggleTabGroupCollapsedState({target: tab}).then(setSessionTabList)
        );
      }
      break;
    case TAB_GROUP_DETACH:
      if (tab && isGrouped &&
          tabParentClassList && !tabParentClassList.contains(PINNED)) {
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
      if (tabsTab && !tabsTab.pinned && tabParent && isGrouped) {
        func.push(
          ungroupTabs(tabParent).then(restoreTabContainers)
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
      if (Number.isInteger(tabId)) {
        func.push(createNewWindow({
          tabId,
          type: "normal",
        }));
      }
      break;
    case TAB_MUTE:
      if (tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(updateTab([tab], {muted: !muted}));
      }
      break;
    case TAB_PIN:
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(pinTabs([tab], {pinned: !pinned}));
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
      if (Array.isArray(contextualIds) && contextualIds.includes(menuItemId)) {
        let arr;
        if (selectedTabs.length) {
          arr = Array.from(selectedTabs);
        } else {
          arr = [tab];
        }
        func.push(reopenTabsInContainer(arr, menuItemId, windowId));
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
const handleEvt = async evt => {
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
    const multiTabsSelected = !!(selectedTabs && selectedTabs.length > 1);
    const allTabsSelected = !!(
      multiTabsSelected && allTabs && selectedTabs.length === allTabs.length
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
        TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
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
        for (const itemKey of contextualIds) {
          if (isString(itemKey)) {
            func.push(updateContextMenu(itemKey, {
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
        for (const itemKey of contextualIds) {
          if (isString(itemKey)) {
            func.push(updateContextMenu(itemKey, {
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
 * @param {Object} msg - message
 * @param {Object} sender - sender
 * @returns {Promise.<Array>} - results of each handler
 */
const handleMsg = async (msg, sender) => {
  const items = Object.keys(msg);
  const func = [];
  for (const item of items) {
    const obj = msg[item];
    switch (item) {
      case EXT_INIT:
        if (obj) {
          func.push(initSidebar(obj));
        }
        break;
      case TAB_OBSERVE:
        if (obj) {
          const {tab} = sender;
          const {id} = tab;
          if (Number.isInteger(id)) {
            func.push(observeTab(id));
          }
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
const setVar = async (item, obj, changed = false) => {
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
const setVars = async (data = {}) => {
  const items = Object.entries(data);
  const func = [];
  if (items.length) {
    for (const item of items) {
      const [key, value] = item;
      const {newValue} = value;
      func.push(setVar(key, newValue || value, !!newValue));
    }
  }
  return Promise.all(func);
};

/* restore tabs */
/**
 * restore highlighted tabs
 * @returns {void}
 */
const restoreHighlightedTabs = async () => {
  const {windowId} = sidebar;
  const items = await getHighlightedTab(windowId);
  if (items && items.length > 1) {
    for (const item of items) {
      const {id} = item;
      const tab = document.querySelector(`[data-tab-id="${id}"]`);
      if (tab) {
        tab.classList.add(HIGHLIGHTED);
      }
    }
  }
};

/**
 * restore tab groups
 * @returns {void}
 */
const restoreTabGroups = async () => {
  if (!sidebar.incognito) {
    const tabList = await getSessionTabList(TAB_LIST);
    const items = document.querySelectorAll(TAB_QUERY);
    if (tabList && items) {
      const containers =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
      const l = items.length;
      let i = 0, j = 0;
      while (i < l) {
        // NOTE: `tabList[j]` is for backward compat. Remove it in the future.
        const list = tabList.hasOwnProperty("recent") && tabList.recent[j] ||
                     tabList[j];
        if (list) {
          const {collapsed, containerIndex, url} = list;
          const item = items[i];
          const {dataset: {tab: itemTab}} = item;
          const {pinned, url: itemUrl} = JSON.parse(itemTab);
          if (pinned) {
            const container = document.getElementById(PINNED);
            const containerChildTabs = container.children;
            const containerChildTab = containerChildTabs[i];
            if (containerChildTabs.length === 0 || !containerChildTab) {
              container.appendChild(item);
            } else if (containerChildTab && containerChildTab !== item) {
              container.insertBefore(item, containerChildTab);
            }
            if (collapsed) {
              container.classList.add(CLASS_TAB_COLLAPSED);
            } else {
              container.classList.remove(CLASS_TAB_COLLAPSED);
            }
          } else if (Number.isInteger(containerIndex) && itemUrl === url) {
            const container = containers[containerIndex];
            container.appendChild(item);
            if (collapsed) {
              container.classList.add(CLASS_TAB_COLLAPSED);
            } else {
              container.classList.remove(CLASS_TAB_COLLAPSED);
            }
          } else {
            j++;
          }
        } else {
          break;
        }
        i++;
        j++;
      }
    }
  }
};

/**
 * emulate tabs in sidebar
 * @returns {void}
 */
const emulateTabs = async () => {
  const items = await getAllTabsInWindow(WINDOW_ID_CURRENT);
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await handleCreatedTab(item, true);
  }
};

/* listeners */
contextualIdentities.onCreated.addListener(() =>
  setContextualIds().catch(throwErr)
);
contextualIdentities.onRemoved.addListener(() =>
  setContextualIds().catch(throwErr)
);
contextualIdentities.onUpdated.addListener(() =>
  setContextualIds().catch(throwErr)
);
menus.onClicked.addListener(info => handleClickedMenu(info).catch(throwErr));
storage.onChanged.addListener(data => setVars(data).catch(throwErr));
runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);
tabs.onActivated.addListener(info =>
  handleActivatedTab(info).then(expandActivatedCollapsedTab)
    .then(setSessionTabList).catch(throwErr)
);
tabs.onAttached.addListener((tabId, info) =>
  handleAttachedTab(tabId, info).then(restoreTabContainers)
    .then(restoreHighlightedTabs).then(setSessionTabList).catch(throwErr)
);
tabs.onCreated.addListener(tabsTab =>
  handleCreatedTab(tabsTab).then(restoreTabContainers)
    .then(setSessionTabList).then(getLastClosedTab).catch(throwErr)
);
tabs.onDetached.addListener((tabId, info) =>
  handleDetachedTab(tabId, info).then(restoreTabContainers)
    .then(expandActivatedCollapsedTab).then(setSessionTabList)
    .catch(throwErr)
);
tabs.onHighlighted.addListener(info =>
  handleHighlightedTab(info).catch(throwErr)
);
tabs.onMoved.addListener((tabId, info) =>
  handleMovedTab(tabId, info).catch(throwErr)
);
tabs.onRemoved.addListener((tabId, info) =>
  handleRemovedTab(tabId, info).then(restoreTabContainers)
    .then(expandActivatedCollapsedTab).then(setSessionTabList)
    .then(getLastClosedTab).catch(throwErr)
);
tabs.onUpdated.addListener((tabId, info, tabsTab) =>
  handleUpdatedTab(tabId, info, tabsTab).catch(throwErr)
);

window.addEventListener("keydown", evt => handleEvt(evt).catch(throwErr), true);
window.addEventListener("mousedown",
                        evt => handleEvt(evt).catch(throwErr), true);

/* start up */
Promise.all([
  addDropEventListener(document.getElementById(SIDEBAR_MAIN)),
  addNewTabClickListener(),
  menus.removeAll().then(createContextMenu),
  localizeHtml(),
  makeConnection({name: TAB}),
  setContextualIds(),
  setSidebar(),
  setSidebarTheme(),
]).then(emulateTabs).then(restoreTabGroups).then(restoreTabContainers)
  .then(restoreHighlightedTabs).then(setSessionTabList).then(getLastClosedTab)
  .catch(throwErr);
