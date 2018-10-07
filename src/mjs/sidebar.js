/**
 * sidebar.js
 */

import {isObjectNotEmpty, isString, throwErr} from "./common.js";
import {
  clearStorage, createBookmark, createNewWindow, createTab,
  getActiveTab, getAllContextualIdentities, getAllTabsInWindow, getContextualId,
  getCurrentWindow, getHighlightedTab, getOs, getRecentlyClosedTab, getStorage,
  getTab, highlightTab, makeConnection, moveTab, reloadTab,
  removeTab, restoreSession, setSessionWindowValue, updateTab,
} from "./browser.js";
import {
  activateTab, bookmarkAllTabs, bookmarkTabs, closeOtherTabs, closeTabs,
  closeTabsToEnd, dupeTab, getSessionTabList, getSidebarTab, getSidebarTabId,
  getSidebarTabIndex, getSidebarTabContainer, getTabsInRange, getTemplate,
  moveTabsInOrder, moveTabsToEnd, moveTabsToStart, moveTabsToNewWindow,
  muteTabs, observeTab, pinTabs, reloadAllTabs, reloadTabs, restoreTabContainer,
  setSessionTabList,
} from "./tab-util.js";
import {
  addTabAudioClickListener, addTabCloseClickListener, setCloseTab, setTabAudio,
  setTabAudioIcon, setTabContent, setTabIcon, addTabIconErrorListener,
} from "./tab-content.js";
import {
  createContextMenu, getTargetElement, menuItems, updateContextMenu,
} from "./contextmenu.js";
import {setSidebarTheme, setTheme} from "./theme.js";
import {localizeHtml} from "./localize.js";
import {
  CLASS_TAB_AUDIO, CLASS_TAB_AUDIO_ICON, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_ICON,
  CLASS_TAB_TITLE, CLASS_TAB_TMPL, CLASS_TAB_TOGGLE_ICON,
  COOKIE_STORE_DEFAULT, EXT_INIT, MIME_PLAIN, MIME_URI, NEW_TAB, PINNED, TAB,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT,
  TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_END, TAB_CLOSE_OPTIONS, TAB_CLOSE_OTHER,
  TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_EXPAND,
  TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
  TAB_LIST, TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE,
  TAB_OBSERVE, TAB_PIN, TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_OTHER, TABS_MOVE, TABS_MOVE_END,
  TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD,
  THEME_DARK, THEME_LIGHT,
} from "./constant.js";

/* api */
const {
  contextualIdentities, i18n, menus, runtime, storage, tabs, windows,
} = browser;

/* constants */
const {TAB_ID_NONE} = tabs;
const {WINDOW_ID_CURRENT, WINDOW_ID_NONE} = windows;
const ACTIVE = "active";
const AUDIBLE = "audible";
const HIGHLIGHTED = "highlighted";
const MOUSE_BUTTON_RIGHT = 2;
const SIDEBAR_MAIN = "sidebar-tabs-container";

/* sidebar */
const sidebar = {
  contextualIds: null,
  firstSelectedTab: null,
  incognito: false,
  lastClosedTab: null,
  tabGroupPutNewTabAtTheEnd: false,
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
    if (tabGroupPutNewTabAtTheEnd) {
      const {checked} = tabGroupPutNewTabAtTheEnd;
      sidebar.tabGroupPutNewTabAtTheEnd = !!checked;
    }
    sidebar.incognito = incognito;
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

/* tab group */
/**
 * toggle tab group collapsed state
 * @param {!Object} evt - event
 * @returns {?AsyncFunction} - activateTab()
 */
const toggleTabGroupCollapsedState = async evt => {
  const {target} = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container.classList.contains(CLASS_TAB_GROUP)) {
    const {firstElementChild: tab} = container;
    const {firstElementChild: tabContext} = tab;
    const {firstElementChild: toggleIcon} = tabContext;
    container.classList.toggle(CLASS_TAB_COLLAPSED);
    if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
      toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_EXPAND}`);
      func = activateTab(tab);
    } else {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
      toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
    }
  }
  return func || null;
};

/**
 * add tab context click listener
 * @param {Object} elm - element
 * @returns {void}
 */
const addTabContextClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", evt =>
      toggleTabGroupCollapsedState(evt).then(setSessionTabList).catch(throwErr)
    );
  }
};

/**
 * expand activated collapsed tab
 * @returns {?AsyncFunction} - toggleTabGroupCollapsedState()
 */
const expandActivatedCollapsedTab = async () => {
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
 * detach tab from tab group
 * @param {Object} elm - element
 * @returns {?Array} - array of tabs.Tab
 */
const detachTabFromGroup = async elm => {
  let arr;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {parentNode} = elm;
    if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
        !parentNode.classList.contains(PINNED)) {
      const {lastElementChild, nextElementSibling} = parentNode;
      const tabId = getSidebarTabId(elm);
      if (elm === lastElementChild) {
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(elm);
        container.removeAttribute("hidden");
        parentNode.parentNode.insertBefore(container, nextElementSibling);
      } else {
        const {firstElementChild: target} = nextElementSibling;
        const {windowId} = sidebar;
        let index;
        if (target.classList.contains(NEW_TAB)) {
          index = -1;
        } else {
          const tabsTab = await getTab(tabId);
          const {index: tabIndex} = tabsTab;
          if (Number.isInteger(tabIndex)) {
            index = tabIndex - 1;
          } else {
            index = -1;
          }
        }
        elm.dataset.enroute = true;
        arr = await moveTab([tabId], {windowId, index});
      }
    }
  }
  return arr || null;
};

/**
 * group selected tabs
 * @returns {?AsyncFunction} - moveTab()
 */
const groupSelectedTabs = async () => {
  const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  let func;
  if (items && items.length) {
    const [tab] = items;
    const {parentNode: tabParent} = tab;
    const tabId = getSidebarTabId(tab);
    const tabsTab = await getTab(tabId);
    const {index: tabIndex} = tabsTab;
    let arr = [], indexShift = 0;
    if (tabParent.classList.contains(TAB_GROUP)) {
      await detachTabFromGroup(tab);
    }
    for (const item of items) {
      if (item !== tab) {
        const {parentNode: itemParent} = item;
        const {
          previousElementSibling: itemParentPreviousSibling,
        } = itemParent;
        const itemTabId = getSidebarTabId(item);
        if (Number.isInteger(itemTabId)) {
          if (itemParentPreviousSibling === tabParent) {
            tabParent.appendChild(item);
            tabParent.classList.add(CLASS_TAB_GROUP);
            restoreTabContainer(itemParent);
          } else {
            const itemIndex = getSidebarTabIndex(item);
            if (Number.isInteger(itemIndex) && itemIndex < tabIndex) {
              indexShift++;
            }
            item.dataset.group = true;
            arr.push(itemTabId);
          }
        }
      }
    }
    if (Number.isInteger(tabIndex) && arr.length) {
      const {windowId} = sidebar;
      let index;
      if (indexShift) {
        tab.dataset.enroute = true;
        arr = await moveTabsInOrder(tabId, arr, indexShift, windowId);
        if (Array.isArray(arr) && arr.length) {
          index = tabIndex + indexShift;
        }
      } else {
        index = tabIndex + 1;
      }
      if (Number.isInteger(index)) {
        func = moveTab(arr, {index, windowId});
      }
    }
  }
  return func || null;
};

/**
 * ungroup tabs
 * @param {Object} node - tab group container
 * @returns {void}
 */
const ungroupTabs = async (node = {}) => {
  const {id, classList, nodeType, parentNode} = node;
  if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
      classList.contains(CLASS_TAB_GROUP)) {
    const items = node.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(item);
      container.removeAttribute("hidden");
      parentNode.insertBefore(container, node);
    }
  }
};

/**
 * restore tab group
 * @returns {void}
 */
const restoreTabGroup = async () => {
  if (!sidebar.incognito) {
    const tabList = await getSessionTabList(TAB_LIST);
    const items = document.querySelectorAll(TAB_QUERY);
    if (tabList && items) {
      const containers =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
      const l = items.length;
      let i = 0, j = 0;
      while (i < l) {
        const list = tabList[j];
        if (list) {
          const {collapsed, containerIndex, url} = list;
          const item = items[i];
          const {dataset: {tab: itemTab}} = item;
          const {url: itemUrl} = JSON.parse(itemTab);
          if (Number.isInteger(containerIndex) && itemUrl === url) {
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
          i++;
          j++;
        } else {
          break;
        }
      }
    }
  }
};

/* highlight */
/**
 * add hightlight class to tab
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
const addHighlight = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabId = getSidebarTabId(elm);
    const tab = await getTab(tabId);
    const {audible, mutedInfo: {muted}} = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.add(HIGHLIGHTED);
    func.push(
      setCloseTab(closeElm, true),
      setTabAudio(muteElm, {
        audible, muted,
        highlighted: true,
      }),
    );
  }
  return Promise.all(func);
};

/**
 * add highlight class to tabs
 * @param {Array} arr - array of tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
const addHighlightToTabs = async arr => {
  const func = [];
  if (Array.isArray(arr)) {
    arr.forEach(id => {
      const item = document.querySelector(`[data-tab-id="${id}"]`);
      if (item) {
        func.push(addHighlight(item));
      }
    });
  }
  return Promise.all(func);
};

/**
 * remove hightlight class from tab
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
const removeHighlight = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabId = getSidebarTabId(elm);
    const tab = await getTab(tabId);
    const {audible, mutedInfo: {muted}} = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.remove(HIGHLIGHTED);
    if (sidebar.firstSelectedTab === elm) {
      sidebar.firstSelectedTab = null;
    }
    func.push(
      setCloseTab(closeElm, false),
      setTabAudio(muteElm, {
        audible, muted,
        highlighted: false,
      }),
    );
  }
  return Promise.all(func);
};

/**
 * remove highlight class from tabs
 * @returns {Promise.<Array>} - results of each handler
 */
const removeHighlightFromTabs = async () => {
  const {firstSelectedTab, windowId} = sidebar;
  const func = [];
  if (firstSelectedTab) {
    const index = getSidebarTabIndex(firstSelectedTab);
    func.push(
      removeHighlight(firstSelectedTab),
      highlightTab(index, windowId),
    );
  } else {
    const tab = await getActiveTab(windowId);
    if (tab) {
      const {id, index} = tab;
      const item = document.querySelector(`[data-tab-id="${id}"]`);
      if (item) {
        func.push(
          removeHighlight(item),
          highlightTab(index, windowId),
        );
      }
    }
  }
  return Promise.all(func);
};

/**
 * toggle highlight class of tab
 * @param {Object} elm - element
 * @returns {AsyncFunction} - addHighlight() / removeHightlight()
 */
const toggleHighlight = async elm => {
  let func;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    if (elm.classList.contains(HIGHLIGHTED)) {
      func = removeHighlight(elm);
    } else {
      func = addHighlight(elm);
    }
  }
  return func;
};

/**
 * highlight all tabs
 * @returns {?AsyncFunction} - highlightTab()
 */
const highlightAllTabs = async () => {
  const items = document.querySelectorAll(TAB_QUERY);
  let func;
  if (items) {
    const {firstSelectedTab, windowId} = sidebar;
    const arr = [];
    let firstIndex;
    if (firstSelectedTab) {
      const index = getSidebarTabIndex(firstSelectedTab);
      if (Number.isInteger(index)) {
        firstIndex = index;
        arr.push(index);
      }
    } else {
      const tab = await getActiveTab(windowId);
      if (tab) {
        const {id, index} = tab;
        const item = document.querySelector(`[data-tab-id="${id}"]`);
        if (item) {
          firstIndex = index;
          arr.push(index);
        }
      }
    }
    for (const item of items) {
      const itemIndex = getSidebarTabIndex(item);
      if (Number.isInteger(itemIndex)) {
        if (Number.isInteger(firstIndex)) {
          if (itemIndex !== firstIndex) {
            arr.push(itemIndex);
          }
        } else {
          arr.push(itemIndex);
        }
      }
    }
    func = highlightTab(arr, windowId);
  }
  return func || null;
};

/**
 * restore highlighted tab
 * @returns {void}
 */
const restoreHighlightedTab = async () => {
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
  newTab.addEventListener("click", evt => createNewTab(evt).catch(throwErr));
};

/* DnD */
/**
 * extract drag and drop tabs
 * @param {Object} dropTarget - dropped element
 * @param {Object} data - dragged data
 * @param {Object} opt - key options
 * @returns {Promise.<Array>} - results of each handler
 */
const extractDroppedTabs = async (dropTarget, data = {}, opt = {}) => {
  const {tabIds, windowId: dragWindowId} = data;
  const dropIndex = getSidebarTabIndex(dropTarget);
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      Number.isInteger(dropIndex) && Array.isArray(tabIds) &&
      Number.isInteger(dragWindowId) && dragWindowId !== WINDOW_ID_NONE) {
    const {parentNode: dropParent} = dropTarget;
    const {classList: dropParentClassList} = dropParent;
    const {windowId} = sidebar;
    const {ctrlKey, shiftKey} = opt;
    if (dragWindowId === windowId) {
      let arr = [], indexShift = 0;
      for (const id of tabIds) {
        const tab = document.querySelector(`[data-tab-id="${id}"]`);
        if (tab && dropTarget !== tab) {
          const {parentNode: tabParent} = tab;
          const {
            previousElementSibling: tabParentPreviousSibling,
          } = tabParent;
          if (tabParentPreviousSibling === dropParent && shiftKey) {
            dropParent.appendChild(tab);
            dropParentClassList.add(CLASS_TAB_GROUP);
            restoreTabContainer(tabParent);
          } else {
            const tabIndex = getSidebarTabIndex(tab);
            if (Number.isInteger(tabIndex) && tabIndex < dropIndex) {
              indexShift++;
            }
            tab.dataset.group = !!shiftKey;
            arr.push(id * 1);
          }
          if (dropParentClassList.contains(PINNED)) {
            func.push(updateTab(id * 1, {pinned: true}));
          }
        }
      }
      if (arr.length) {
        const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
        let index;
        if (dropIndex === lastTabIndex) {
          index = -1;
        } else if (arr.length > 1 && indexShift) {
          const dropTargetId = getSidebarTabId(dropTarget);
          dropTarget.dataset.enroute = true;
          arr = await moveTabsInOrder(dropTargetId, arr, indexShift, windowId);
          if (Array.isArray(arr) && arr.length) {
            const dropTargetTabsTab = await getTab(dropTargetId);
            if (dropTargetTabsTab) {
              index = dropTargetTabsTab.index + indexShift;
            }
          }
        } else {
          index = dropIndex + 1 - indexShift;
        }
        if (Number.isInteger(index)) {
          if (ctrlKey &&
              (!dropParentClassList.contains(CLASS_TAB_GROUP) ||
               dropTarget === dropParent.lastElementChild)) {
            func.push(moveTab(arr, {
              index, windowId,
            }).then(groupSelectedTabs));
          } else {
            func.push(moveTab(arr, {
              index, windowId,
            }));
          }
        } else if (ctrlKey &&
                   (!dropParentClassList.contains(CLASS_TAB_GROUP) ||
                    dropTarget === dropParent.lastElementChild)) {
          func.push(groupSelectedTabs());
        }
      }
    } else {
      func.push(moveTab(tabIds, {
        windowId,
        index: dropIndex + 1,
      }));
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
  const {ctrlKey, dataTransfer, shiftKey, target} = evt;
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
      // silent fail
    }
    if (isObjectNotEmpty(item)) {
      func.push(
        extractDroppedTabs(dropTarget, item, {ctrlKey, shiftKey})
          .then(removeHighlightFromTabs).then(setSessionTabList)
      );
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
  const {ctrlKey, target} = evt;
  const {classList} = target;
  const {windowId} = sidebar;
  const container = getSidebarTabContainer(target);
  const data = {
    windowId,
  };
  let items;
  if (classList.contains(HIGHLIGHTED)) {
    items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  } else if (ctrlKey &&
             container && container.classList.contains(CLASS_TAB_GROUP)) {
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

/* tab event handlers */
/**
 * restore sidebar tab containers
 * @returns {Promise.<Array>} - results of each handler
 */
const restoreTabContainers = async () => {
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  const func = [];
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
  return Promise.all(func);
};

/**
 * handle clicked tab
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
const handleClickedTab = async evt => {
  const {ctrlKey, metaKey, shiftKey, target} = evt;
  const {firstSelectedTab, windowId} = sidebar;
  const firstTabIndex = getSidebarTabIndex(firstSelectedTab);
  const os = await getOs();
  const isMac = os === "mac";
  const tab = getSidebarTab(target);
  const func = [];
  if (shiftKey) {
    if (Number.isInteger(firstTabIndex)) {
      const index = [firstTabIndex];
      const items = await getTabsInRange(tab, firstSelectedTab);
      for (const item of items) {
        const itemIndex = getSidebarTabIndex(item);
        if (Number.isInteger(itemIndex) && itemIndex !== firstTabIndex) {
          index.push(itemIndex);
        }
      }
      func.push(highlightTab(index, windowId));
    } else {
      func.push(removeHighlightFromTabs());
    }
  } else if (isMac && metaKey || !isMac && ctrlKey) {
    if (Number.isInteger(firstTabIndex)) {
      const items =
        document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
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
    } else {
      func.push(removeHighlightFromTabs());
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
  const {
    active, audible, cookieStoreId, favIconUrl, id, index, mutedInfo,
    openerTabId, pinned, status, title, url, windowId,
  } = tabsTab;
  const {muted} = mutedInfo;
  const func = [];
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
        const {color} = ident;
        if (color) {
          tab.style.borderColor = color;
        }
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
      container.childElementCount > 1 &&
        container.classList.add(CLASS_TAB_GROUP);
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
              tab.dataset.enroute = true;
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
      container.classList.contains(CLASS_TAB_COLLAPSED) &&
        func.push(toggleTabGroupCollapsedState({target: tab}));
    } else if (list.length !== index && listedTab && listedTab.parentNode &&
               listedTab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTabPrev && listedTabPrev.parentNode &&
               listedTabPrev.parentNode.classList.contains(CLASS_TAB_GROUP) &&
               listedTab.parentNode === listedTabPrev.parentNode) {
      await addDragEventListener(tab);
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
      await addDragEventListener(tab);
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute("hidden");
      target.parentNode.insertBefore(container, target);
    }
  }
  active && func.push(handleActivatedTab({tabId: id, windowId}));
  return Promise.all(func);
};

/**
 * handle attached tab
 * @param {number} tabId - tab ID
 * @param {Object} info - attached tab info
 * @returns {?AsyncFunction} - tabs.Tab
 */
const handleAttachedTab = async (tabId, info) => {
  const {newPosition, newWindowId} = info;
  let func;
  if (newWindowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
    const tabsTab = await getTab(tabId);
    if (tabsTab) {
      tabsTab.index = newPosition;
      func = handleCreatedTab(tabsTab);
    }
  }
  return func || null;
};

/**
 * handle detached tab
 * @param {number} tabId - tab ID
 * @param {Object} info - detached tab info
 * @returns {void}
 */
const handleDetachedTab = async (tabId, info) => {
  const {oldWindowId} = info;
  if (oldWindowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    tab && tab.parentNode.removeChild(tab);
  }
};

/**
 * handle highlighted tab
 * @param {Object} info - info
 * @returns {Promise.<Array>} - results of each handler
 */
const handleHighlightedTab = async info => {
  const {tabIds, windowId} = info;
  const func = [];
  if (Array.isArray(tabIds) && windowId === sidebar.windowId) {
    const items =
      document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    if (tabIds.length > 1) {
      const highlightTabs = Array.from(tabIds);
      for (const item of items) {
        const itemId = getSidebarTabId(item);
        if (highlightTabs.length && highlightTabs.includes(itemId)) {
          const index = highlightTabs.findIndex(i => i === itemId);
          highlightTabs.splice(index, 1);
        } else {
          func.push(removeHighlight(item));
        }
      }
      if (highlightTabs.length) {
        func.push(addHighlightToTabs(highlightTabs));
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
      } else {
        func.push(removeHighlightFromTabs());
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
  let func;
  if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const items = document.querySelectorAll(TAB_QUERY);
      const tabsTab = await getTab(tabId);
      const {pinned} = tabsTab;
      if (toIndex === 0) {
        if (pinned) {
          const container = document.getElementById(PINNED);
          const {firstElementChild} = container;
          container.insertBefore(tab, firstElementChild);
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          const [target] = items;
          const {parentNode} = target;
          container.appendChild(tab);
          container.removeAttribute("hidden");
          parentNode.parentNode.insertBefore(container, parentNode);
        }
      } else if (pinned) {
        const container = document.getElementById(PINNED);
        const {lastElementChild} = container;
        const lastPinnedTabIndex = getSidebarTabIndex(lastElementChild);
        if (toIndex === lastPinnedTabIndex) {
          container.appendChild(tab);
        } else {
          const index = fromIndex < toIndex ?
            toIndex :
            toIndex - 1;
          const target = items[index];
          const {nextElementSibling} = target;
          container.insertBefore(tab, nextElementSibling);
        }
      } else {
        const lastTabIndex = items.length - 1;
        const index = toIndex === lastTabIndex || fromIndex >= toIndex ?
          toIndex :
          toIndex + 1;
        const target = items[index];
        const {parentNode} = target;
        const unPinned =
          toIndex > fromIndex &&
          items[fromIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex] === items[toIndex].parentNode.lastElementChild;
        const detached =
          toIndex > fromIndex &&
          items[fromIndex].parentNode.classList.contains(CLASS_TAB_GROUP) &&
          items[toIndex].parentNode.classList.contains(CLASS_TAB_GROUP) &&
          items[toIndex] === items[toIndex].parentNode.lastElementChild;
        const group = tab.dataset.group === "true";
        if (!group && target === parentNode.firstElementChild || unPinned ||
            detached) {
          const {parentNode: parentParentNode} = parentNode;
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          if (container) {
            container.appendChild(tab);
            container.removeAttribute("hidden");
            if (toIndex === lastTabIndex) {
              const newtab = document.getElementById(NEW_TAB);
              parentParentNode.insertBefore(container, newtab);
            } else {
              parentParentNode.insertBefore(container, parentNode);
            }
          }
        } else {
          const groupIndex = toIndex === lastTabIndex || fromIndex < toIndex ?
            toIndex :
            toIndex - 1;
          const groupTarget = items[groupIndex];
          const {parentNode: groupParent, nextElementSibling} = groupTarget;
          if (toIndex === lastTabIndex) {
            groupParent.appendChild(tab);
          } else {
            groupParent.insertBefore(tab, nextElementSibling);
          }
        }
      }
      tab.dataset.group = null;
      if (tab.dataset.enroute !== "true") {
        func = restoreTabContainers().then(setSessionTabList);
        tab.dataset.enroute = null;
      }
    }
  }
  return func || null;
};

/**
 * handle removed tab
 * @param {number} tabId - tab ID
 * @param {Object} info - removed tab info
 * @returns {void}
 */
const handleRemovedTab = async (tabId, info) => {
  const {isWindowClosing, windowId} = info;
  if (windowId === sidebar.windowId && !isWindowClosing &&
      tabId !== TAB_ID_NONE) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    tab && tab.parentNode.removeChild(tab);
  }
};

/**
 * handle updated tab
 * @param {number} tabId - tab ID
 * @param {Object} info - updated tab info
 * @param {Object} tabsTab - tabs.Tab
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
        tabAudioIcon && func.push(setTabAudioIcon(tabAudioIcon, opt));
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
      info.hasOwnProperty("status") && func.push(observeTab(tabId));
      info.hasOwnProperty("discarded") && func.push(setSessionTabList());
      tab.dataset.tab = JSON.stringify(tabsTab);
    }
  }
  return Promise.all(func);
};

/**
 * emulate tabs to sidebar
 * @returns {void}
 */
const emulateTabs = async () => {
  const items = await getAllTabsInWindow(WINDOW_ID_CURRENT);
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await handleCreatedTab(item, true);
  }
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
        changed && checked && func.push(setTheme([item]));
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

/* context menu */
/**
 * handle clicked menu
 * @param {!Object} info - clicked menu info
 * @returns {AsyncFunction} - clicked menu handler
 */
const handleClickedMenu = async info => {
  const {menuItemId, targetElementId} = info;
  const {contextualIds, windowId} = sidebar;
  const selectedTabs = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  const target = await getTargetElement(targetElementId);
  const tab = await getSidebarTab(target);
  const func = [];
  let isGrouped, tabId, tabParent, tabParentClassList, tabsTab, retFunc;
  if (tab) {
    tabId = getSidebarTabId(tab);
    tabParent = tab.parentNode;
    tabParentClassList = tabParent.classList;
    isGrouped = tabParentClassList.contains(CLASS_TAB_GROUP);
    if (Number.isInteger(tabId)) {
      tabsTab = await getTab(tabId);
    } else {
      tabsTab =
        tab && tab.dataset && tab.dataset.tab && JSON.parse(tab.dataset.tab);
    }
  }
  switch (menuItemId) {
    case TAB_ALL_BOOKMARK:
      func.push(bookmarkAllTabs());
      break;
    case TAB_ALL_RELOAD:
      func.push(reloadAllTabs());
      break;
    case TAB_ALL_SELECT:
      func.push(highlightAllTabs());
      break;
    case TAB_BOOKMARK:
      if (tabsTab) {
        const {title, url} = tabsTab;
        func.push(createBookmark({title, url}));
      }
      break;
    case TAB_CLOSE:
      if (Number.isInteger(tabId)) {
        func.push(removeTab(tabId));
      }
      break;
    case TAB_CLOSE_END:
      func.push(closeTabsToEnd(tab));
      break;
    case TAB_CLOSE_OTHER:
      if (Number.isInteger(tabId)) {
        func.push(closeOtherTabs([tabId]));
      }
      break;
    case TAB_CLOSE_UNDO:
      func.push(undoCloseTab());
      break;
    case TAB_DUPE:
      if (Number.isInteger(tabId)) {
        func.push(dupeTab(tabId, windowId));
      }
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
          detachTabFromGroup(tab).then(restoreTabContainers)
            .then(setSessionTabList)
        );
      }
      break;
    case TAB_GROUP_SELECTED:
      func.push(
        groupSelectedTabs().then(restoreTabContainers).then(setSessionTabList)
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
      if (tab) {
        if (isGrouped) {
          func.push(moveTabsToEnd([tab], windowId).then(restoreTabContainers));
        } else {
          func.push(moveTabsToEnd([tab], windowId));
        }
      }
      break;
    case TAB_MOVE_START:
      if (tab) {
        if (isGrouped) {
          func.push(
            moveTabsToStart([tab], windowId).then(restoreTabContainers)
          );
        } else {
          func.push(moveTabsToStart([tab], windowId));
        }
      }
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
      if (Number.isInteger(tabId) && tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(updateTab(tabId, {muted: !muted}));
      }
      break;
    case TAB_PIN:
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(updateTab(tabId, {pinned: !pinned}));
      }
      break;
    case TAB_RELOAD:
      if (Number.isInteger(tabId)) {
        func.push(reloadTab(tabId));
      }
      break;
    case TABS_BOOKMARK:
      func.push(bookmarkTabs(selectedTabs));
      break;
    case TABS_CLOSE:
      func.push(closeTabs(selectedTabs));
      break;
    case TABS_CLOSE_OTHER: {
      const arr = [];
      for (const item of selectedTabs) {
        const itemId = getSidebarTabId(item);
        if (Number.isInteger(itemId)) {
          arr.push(itemId);
        }
      }
      if (arr.length) {
        func.push(closeOtherTabs(arr));
      }
      break;
    }
    case TABS_MOVE_END:
      func.push(moveTabsToEnd(Array.from(selectedTabs), windowId));
      break;
    case TABS_MOVE_START:
      func.push(moveTabsToStart(Array.from(selectedTabs), windowId));
      break;
    case TABS_MOVE_WIN:
      func.push(moveTabsToNewWindow(Array.from(selectedTabs)));
      break;
    case TABS_MUTE:
      if (tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(muteTabs(selectedTabs, !muted));
      }
      break;
    case TABS_PIN:
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(pinTabs(selectedTabs, !pinned));
      }
      break;
    case TABS_RELOAD:
      func.push(reloadTabs(selectedTabs));
      break;
    default:
      if (Array.isArray(contextualIds) && contextualIds.includes(menuItemId) &&
          tabsTab) {
        const {index, url} = tabsTab;
        const opt = {
          url, windowId,
          cookieStoreId: menuItemId,
          index: index + 1,
        };
        func.push(createTab(opt));
      }
  }
  if (menuItemId === TAB_ALL_SELECT) {
    retFunc = Promise.all(func);
  } else {
    retFunc = Promise.all(func).then(removeHighlightFromTabs);
  }
  return retFunc;
};

/**
 * handle event
 * @param {!Object} evt - event
 * @returns {Promse.<Array>} - results of each handler
 */
const handleEvt = async evt => {
  const {button, key, shiftKey, target} = evt;
  const func = [];
  // context menu
  if (shiftKey && key === "F10" || key === "ContextMenu" ||
      button === MOUSE_BUTTON_RIGHT) {
    const tab = getSidebarTab(target);
    const bookmarkMenu = menuItems[TAB_ALL_BOOKMARK];
    const tabGroupMenu = menuItems[TAB_GROUP];
    const tabKeys = [
      TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_OPTIONS, TAB_DUPE, TAB_MOVE,
      TAB_MUTE, TAB_PIN, TAB_RELOAD, TAB_REOPEN_CONTAINER,
    ];
    const tabsKeys = [
      TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_OTHER, TABS_MOVE,
      TABS_MUTE, TABS_PIN, TABS_RELOAD,
    ];
    const pageKeys = [TAB_CLOSE_UNDO, TAB_ALL_RELOAD, TAB_ALL_SELECT];
    const sepKeys = ["sep-1", "sep-2", "sep-4"];
    const allTabs = document.querySelectorAll(TAB_QUERY);
    const selectedTabs =
      document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    const pinnedContainer = document.getElementById(PINNED);
    const {nextElementSibling: firstUnpinnedContainer} = pinnedContainer;
    const {firstElementChild: firstUnpinnedTab} = firstUnpinnedContainer;
    const multiTabsSelected = selectedTabs && selectedTabs.length > 1;
    const allTabsSelected =
      multiTabsSelected && allTabs && selectedTabs.length === allTabs.length;
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
        TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_SELECTED,
        TAB_GROUP_UNGROUP,
      ];
      for (const itemKey of tabKeys) {
        const item = menuItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        if (itemKey === TAB_REOPEN_CONTAINER) {
          if (Array.isArray(contextualIds) && contextualIds.length) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
          data.title = title;
          data.visible = true;
        } else if (multiTabsSelected) {
          data.visible = false;
        } else {
          switch (itemKey) {
            case TAB_MUTE:
              data.enabled = true;
              if (muted) {
                data.title = toggleTitle;
              } else {
                data.title = title;
              }
              break;
            case TAB_PIN:
              data.enabled = true;
              if (pinned) {
                data.title = toggleTitle;
              } else {
                data.title = title;
              }
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
                if (muted) {
                  data.title = toggleTitle;
                } else {
                  data.title = title;
                }
                break;
              case TABS_PIN:
                data.enabled = true;
                if (pinned) {
                  data.title = toggleTitle;
                } else {
                  data.title = title;
                }
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
                if (tab === parentLastChild) {
                  data.enabled = false;
                } else {
                  data.enabled = true;
                }
              } else if (index === allTabs.length - 1) {
                data.enabled = false;
              } else {
                data.enabled = true;
              }
              data.title = title;
              break;
            case TABS_MOVE_START:
              if (allTabsSelected) {
                data.enabled = false;
              } else if (pinned) {
                if (tab === parentFirstChild) {
                  data.enabled = false;
                } else {
                  data.enabled = true;
                }
              } else if (tab === firstUnpinnedTab) {
                data.enabled = false;
              } else {
                data.enabled = true;
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
      } else {
        const tabCloseMenu = menuItems[TAB_CLOSE_OPTIONS];
        const tabCloseKeys = [TAB_CLOSE_END, TAB_CLOSE_OTHER];
        const tabMoveMenu = menuItems[TAB_MOVE];
        const tabMoveKeys = [TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN];
        for (const itemKey of tabCloseKeys) {
          const item = tabCloseMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {};
          switch (itemKey) {
            case TAB_CLOSE_END:
              if (index < allTabs.length - 1) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
              data.title = title;
              break;
            case TAB_CLOSE_OTHER: {
              const obj =
                Number.isInteger(tabId) && document.querySelectorAll(
                  `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`
                );
              if (obj && obj.length) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
              data.title = title;
              break;
            }
            default:
          }
          data.visible = true;
          func.push(updateContextMenu(id, data));
        }
        for (const itemKey of tabMoveKeys) {
          const item = tabMoveMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {};
          switch (itemKey) {
            case TAB_MOVE_END:
              if (pinned) {
                if (tab === parentLastChild) {
                  data.enabled = false;
                } else {
                  data.enabled = true;
                }
              } else if (index === allTabs.length - 1) {
                data.enabled = false;
              } else {
                data.enabled = true;
              }
              data.title = title;
              break;
            case TAB_MOVE_START:
              if (pinned) {
                if (tab === parentFirstChild) {
                  data.enabled = false;
                } else {
                  data.enabled = true;
                }
              } else if (tab === firstUnpinnedTab) {
                data.enabled = false;
              } else {
                data.enabled = true;
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
          case TAB_GROUP_DETACH:
          case TAB_GROUP_UNGROUP:
            if (!pinned && parentClass.contains(CLASS_TAB_GROUP)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
            break;
          case TAB_GROUP_COLLAPSE:
            if (parentClass.contains(CLASS_TAB_GROUP) && toggleTitle) {
              data.enabled = true;
              if (parentClass.contains(CLASS_TAB_COLLAPSED)) {
                data.title = toggleTitle;
              } else {
                data.title = title;
              }
            } else {
              data.enabled = false;
            }
            break;
          case TAB_GROUP_SELECTED:
            if (!pinned && tabClass.contains(HIGHLIGHTED)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
            break;
          default:
            if (parentClass.contains(CLASS_TAB_GROUP)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
        }
        data.visible = true;
        func.push(updateContextMenu(id, data));
      }
      for (const sep of sepKeys) {
        func.push(updateContextMenu(sep, {
          visible: true,
        }));
      }
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
          if (allTabs.length > 1 && !allTabsSelected) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
          if (allTabsSelected) {
            data.visible = false;
          } else {
            data.visible = true;
          }
          break;
        case TAB_ALL_SELECT:
          if (allTabs.length > 1 && !allTabsSelected) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
          data.visible = true;
          break;
        case TAB_CLOSE_UNDO: {
          const {lastClosedTab} = sidebar;
          if (lastClosedTab) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
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
          Number.isInteger(id) && func.push(observeTab(id));
        }
        break;
      default:
    }
  }
  return Promise.all(func);
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
    .then(setSessionTabList).catch(throwErr)
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
]).then(emulateTabs).then(restoreTabGroup).then(restoreTabContainers)
  .then(restoreHighlightedTab).then(setSessionTabList).then(getLastClosedTab)
  .catch(throwErr);
