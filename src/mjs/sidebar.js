/**
 * sidebar.js
 */

import {
  getType, isObjectNotEmpty, isString, sleep, throwErr,
} from "./common.js";
import {
  clearStorage, createBookmark, createNewWindow, createTab, getActiveTab,
  getAllTabsInWindow, getContextualId, getCurrentWindow, getHighlightedTab,
  getOs, getRecentlyClosedTab, getStorage, getTab,
  highlightTab, makeConnection, moveTab, moveTabsInOrder, reloadTab, removeTab,
  restoreSession, setSessionWindowValue, updateTab,
} from "./browser.js";
import {
  getSessionTabList, getSidebarTab, getSidebarTabId, getSidebarTabIndex,
  getSidebarTabContainer, getTabsInRange, getTemplate, restoreTabContainer,
  setSessionTabList,
} from "./tab-util.js";
import {
  addTabAudioClickListener, addTabCloseClickListener, setTabAudio,
  setTabAudioIcon, setTabContent, setTabIcon, addTabIconErrorListener,
} from "./tab-content.js";
import {
  menuItems, toggleContextMenuClass, updateContextMenu,
} from "./contextmenu.js";
import {setSidebarTheme, setTheme} from "./theme.js";
import {localizeHtml} from "./localize.js";
import {
  CLASS_MENU_LABEL, CLASS_TAB_CONTAINER, CLASS_TAB_CONTENT, CLASS_TAB_GROUP,
  CLASS_TAB_ICON, CLASS_TAB_TITLE, COOKIE_STORE_DEFAULT,
  DISABLED, EXT_INIT, MIME_PLAIN, MIME_URI, NEW_TAB, PINNED,
  TAB, TAB_BOOKMARK, TAB_BOOKMARK_ALL, TAB_CLOSE, TAB_CLOSE_END,
  TAB_CLOSE_OTHER, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_DETACH, TAB_GROUP_DUPE, TAB_GROUP_EXPAND, TAB_GROUP_NEW_TAB_AT_END,
  TAB_GROUP_PIN, TAB_GROUP_RELOAD, TAB_GROUP_SELECTED, TAB_GROUP_SYNC,
  TAB_GROUP_UNGROUP, TAB_LIST,
  TAB_MOVE_WIN_NEW, TAB_MUTE, TAB_OBSERVE, TAB_PIN, TAB_QUERY,
  TAB_RELOAD, TAB_RELOAD_ALL, TAB_SYNC, THEME_DARK, THEME_LIGHT,
} from "./constant.js";

/* api */
const {i18n, runtime, storage, tabs, windows} = browser;

/* constants */
const {TAB_ID_NONE} = tabs;
const {WINDOW_ID_CURRENT, WINDOW_ID_NONE} = windows;
const ACTIVE = "active";
const AUDIBLE = "audible";
const CLASS_TAB_AUDIO = "tab-audio";
const CLASS_TAB_AUDIO_ICON = "tab-audio-icon";
const CLASS_TAB_CLOSE = "tab-close";
const CLASS_TAB_CLOSE_ICON = "tab-close-icon";
const CLASS_TAB_COLLAPSED = "tab-collapsed";
const CLASS_TAB_CONTAINER_TMPL = "tab-container-template";
const CLASS_TAB_CONTEXT = "tab-context";
const CLASS_TAB_HIGHLIGHT = "highlighted";
const CLASS_TAB_TMPL = "tab-template";
const CLASS_TAB_TOGGLE_ICON = "tab-toggle-icon";
const MOUSE_BUTTON_RIGHT = 2;
const SIDEBAR_MAIN = "sidebar-tabs-container";
const TIME_3SEC = 3000;

/* sidebar */
const sidebar = {
  firstSelectedTab: null,
  incognito: false,
  windowId: null,
  context: null,
  lastClosedTab: null,
  tabGroupPutNewTabAtTheEnd: false,
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

/* tab util */
/**
 * activate tab
 * @param {Object} elm - element
 * @returns {?AsyncFunction} - updateTab()
 */
const activateTab = async elm => {
  const tabId = getSidebarTabId(elm);
  let func;
  if (Number.isInteger(tabId)) {
    const active = true;
    func = updateTab(tabId, {active});
  }
  return func || null;
};

/**
 * observe tab
 * @param {number} tabId - tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
const observeTab = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  await sleep(TIME_3SEC);
  const tabsTab = await getTab(tabId);
  const func = [];
  if (tabsTab) {
    const {status, id} = tabsTab;
    if (status === "complete") {
      await setTabContent(document.querySelector(`[data-tab-id="${id}"]`),
                          tabsTab);
      func.push(setSessionTabList());
    } else {
      func.push(observeTab(id));
    }
  }
  return Promise.all(func);
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
      toggleTabGroupCollapsedState(evt).catch(throwErr)
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
 * @returns {?AsyncFunction} - moveTab()
 */
const detachTabFromGroup = async elm => {
  let func;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {parentNode} = elm;
    if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
        !parentNode.classList.contains(PINNED)) {
      const {lastElementChild, nextElementSibling} = parentNode;
      const tabId = elm.dataset && elm.dataset.tabId && elm.dataset.tabId * 1;
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
          const tabsTab = target.dataset && target.dataset.tab &&
                            JSON.parse(target.dataset.tab);
          const {index: tabIndex} = tabsTab;
          if (Number.isInteger(tabIndex)) {
            index = tabIndex - 1;
          } else {
            index = -1;
          }
        }
        func = moveTab(tabId, {windowId, index});
      }
    }
  }
  return func || null;
};

/**
 * group selected tabs
 * @returns {?AsyncFunction} - moveTab()
 */
const groupSelectedTabs = async () => {
  const items =
    document.querySelectorAll(`${TAB_QUERY}.${CLASS_TAB_HIGHLIGHT}`);
  const tab = items && items[0];
  let func;
  if (tab) {
    let tabsTab = await detachTabFromGroup(tab);
    if (Array.isArray(tabsTab)) {
      [tabsTab] = tabsTab;
    } else if (!tabsTab) {
      tabsTab = tab.dataset && tab.dataset.tab && JSON.parse(tab.dataset.tab);
    }
    const {id: tabId, index: tabIndex} = tabsTab;
    const {parentNode: tabParent} = tab;
    let arr = [], indexShift = 0;
    for (const item of items) {
      if (item !== tab) {
        const {dataset: itemDataset, parentNode: itemParent} = item;
        const {
          previousElementSibling: itemParentPreviousSibling,
        } = itemParent;
        const itemTabId = itemDataset && itemDataset.tabId &&
                            itemDataset.tabId * 1;
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
            itemDataset.group = true;
            arr.push(itemTabId);
          }
        }
      }
    }
    if (Number.isInteger(tabIndex) && arr.length) {
      const {windowId} = sidebar;
      let index;
      if (indexShift) {
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
      let i = 0;
      while (i < l) {
        const item = items[i];
        const {containerIndex, url: tabListUrl} = tabList[i];
        const {dataset: {tab: itemTab}} = item;
        const {url: itemUrl} = JSON.parse(itemTab);
        if (item && Number.isInteger(containerIndex) &&
            itemUrl === tabListUrl) {
          containers[containerIndex].appendChild(item);
          i++;
        } else {
          break;
        }
      }
    }
  }
};

/* highlight */
/**
 * toggle highlight class of tab
 * @param {Object} elm - element
 * @returns {Object} - element
 */
const toggleHighlight = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.classList.toggle(CLASS_TAB_HIGHLIGHT);
  }
  return elm;
};

/**
 * add hightlight class to tab
 * @param {Object} elm - element
 * @returns {Object} - element
 */
const addHighlight = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.classList.add(CLASS_TAB_HIGHLIGHT);
  }
  return elm;
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
 * @returns {Object} - element
 */
const removeHighlight = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.classList.remove(CLASS_TAB_HIGHLIGHT);
    if (sidebar.firstSelectedTab === elm) {
      sidebar.firstSelectedTab = null;
    }
  }
  return elm;
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
        tab.classList.add(CLASS_TAB_HIGHLIGHT);
      }
    }
  }
};

/* bookmark */
/**
 * bookmark all tabs
 * @returns {Promise.<Array>} - results of each handler
 */
const bookmarkAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
  for (const item of items) {
    const itemTab = item.dataset && item.dataset.tab &&
                      JSON.parse(item.dataset.tab);
    const {title, url} = itemTab;
    func.push(createBookmark({title, url}));
  }
  return Promise.all(func);
};

/**
 * bookmark tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
const bookmarkTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {classList} = container;
    if (classList.contains(CLASS_TAB_GROUP)) {
      const items = container.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
      for (const item of items) {
        const itemTab = item.dataset && item.dataset.tab &&
                          JSON.parse(item.dataset.tab);
        const {title, url} = itemTab;
        func.push(createBookmark({title, url}));
      }
    }
  }
  return Promise.all(func);
};

/* close */
/**
 * close tab group
 * @param {Object} node - tab group container
 * @returns {?AsyncFunction} - removeTab()
 */
const closeTabGroup = async node => {
  const {id, classList, nodeType} = node;
  let func;
  if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
      classList.contains(CLASS_TAB_GROUP)) {
    const items = node.querySelectorAll(TAB_QUERY);
    const arr = [];
    for (const item of items) {
      const {dataset} = item;
      const tabId = dataset && dataset.tabId && dataset.tabId * 1;
      Number.isInteger(tabId) && arr.push(tabId);
    }
    func = arr.length && removeTab(arr);
  }
  return func || null;
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

/* dupe */
/**
 * duplicate tab
 * @param {number} tabId - tab ID
 * @returns {?AsyncFunction} - createTab()
 */
const dupeTab = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  let func;
  const tabsTab = await getTab(tabId);
  if (tabsTab) {
    const {index, url} = tabsTab;
    const {windowId} = sidebar;
    const opt = {
      active: true,
      index: index + 1,
      openerTabId: tabId,
      url, windowId,
    };
    func = createTab(opt);
  }
  return func || null;
};

/**
 * duplicate tab and get duplicated tab index
 * @param {number} tabId - tab ID
 * @returns {number} - index
 */
const getDupedTabIndex = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  const {windowId} = sidebar;
  const {id} = await dupeTab(tabId);
  const dupedTab = document.querySelector(`[data-tab-id="${id}"]`);
  const {parentNode} = dupedTab;
  const {nextElementSibling: parentNextSibling} = parentNode;
  const {firstElementChild: nextSiblingFirstChild} = parentNextSibling;
  const {dataset} = nextSiblingFirstChild;
  const nextSiblingFirstChildTabsTab = dataset.tab && JSON.parse(dataset.tab);
  let index;
  if (nextSiblingFirstChildTabsTab) {
    index = nextSiblingFirstChildTabsTab.index * 1;
  } else {
    index = -1;
  }
  if (Number.isInteger(index)) {
    const [tabsTab] = await moveTab(tabId, {index, windowId});
    if (tabsTab) {
      const items = document.querySelectorAll(TAB_QUERY);
      if (items && items.length === tabsTab.index + 1) {
        index = -1;
      } else {
        index = tabsTab.index + 1;
      }
    }
  }
  return index;
};

/**
 * duplicate tabs and get duplicated tab IDs
 * @param {Array} arr - array of tab ID
 * @returns {Array} - array of duped tab ID
 */
const getDupedTabIds = async arr => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}`);
  }
  const dupeTabArr = [];
  for (const tabId of arr) {
    dupeTabArr.push(dupeTab(tabId));
  }
  const tabsTabArr = await Promise.all(dupeTabArr);
  const dupedTabIdArr = [];
  for (const tabsTab of tabsTabArr) {
    const {id} = tabsTab;
    const dupedTab = document.querySelector(`[data-tab-id="${id}"]`);
    dupedTab.dataset.group = true;
    dupedTabIdArr.push(id);
  }
  return dupedTabIdArr;
};

/**
 * duplicate tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
const dupeTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {classList} = container;
    if (classList.contains(CLASS_TAB_GROUP)) {
      const items = container.querySelectorAll(TAB_QUERY);
      if (items && items.length) {
        const itemArr = [];
        let firstTabId;
        for (const item of items) {
          const tabId = item.dataset && item.dataset.tabId * 1;
          if (Number.isInteger(tabId)) {
            if (Number.isInteger(firstTabId)) {
              itemArr.push(tabId);
            } else {
              firstTabId = tabId;
            }
          }
        }
        if (Number.isInteger(firstTabId) && itemArr.length) {
          const {windowId} = sidebar;
          const index = await getDupedTabIndex(firstTabId);
          const idArr = await getDupedTabIds(itemArr);
          const opt = {
            index, windowId,
          };
          func.push(moveTab(idArr.filter(id => Number.isInteger(id)), opt));
        }
      }
    }
  }
  return Promise.all(func);
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

/* pin */
/**
 * pin tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
const pinTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const {classList} = container;
    if (classList.contains(CLASS_TAB_GROUP)) {
      const items = container.querySelectorAll(TAB_QUERY);
      if (items && items.length) {
        for (const item of items) {
          const tabId = item.dataset && item.dataset.tabId * 1;
          const tabsTab =
              item.dataset && item.dataset.tab && JSON.parse(item.dataset.tab);
          if (Number.isInteger(tabId) && tabsTab) {
            const {pinned} = tabsTab;
            func.push(updateTab(tabId, {pinned: !pinned}));
          }
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
const reloadAllTabs = async () => {
  const func = [];
  const items = document.querySelectorAll(TAB_QUERY);
  for (const item of items) {
    const itemId = item && item.dataset && item.dataset.tabId * 1;
    Number.isInteger(itemId) && func.push(reloadTab(itemId));
  }
  return Promise.all(func);
};

/**
 * reload tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
const reloadTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      const itemId = item && item.dataset && item.dataset.tabId * 1;
      Number.isInteger(itemId) && func.push(reloadTab(itemId));
    }
  }
  return Promise.all(func);
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
    const {dataset: dropDataset, parentNode: dropParent} = dropTarget;
    const {classList: dropParentClassList} = dropParent;
    const {windowId} = sidebar;
    const {ctrlKey, shiftKey} = opt;
    if (dragWindowId === windowId) {
      let arr = [], indexShift = 0;
      for (const id of tabIds) {
        const tab = document.querySelector(`[data-tab-id="${id}"]`);
        if (tab && dropTarget !== tab) {
          const {dataset: tabDataset, parentNode: tabParent} = tab;
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
            tabDataset.group = !!shiftKey;
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
          const dropTargetId =
            dropDataset && dropDataset.tabId && dropDataset.tabId * 1;
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
  const func = [];
  let dropTarget, node = target;
  while (node && node.parentNode) {
    const {dataset} = node;
    if (dataset && dataset.tabId) {
      dropTarget = node;
      break;
    }
    node = node.parentNode;
  }
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
  const {classList, dataset} = target;
  const {windowId} = sidebar;
  const container = getSidebarTabContainer(target);
  const data = {
    windowId,
  };
  let items;
  if (classList.contains(CLASS_TAB_HIGHLIGHT)) {
    items =
      document.querySelectorAll(`${TAB_QUERY}.${CLASS_TAB_HIGHLIGHT}`);
  } else if (ctrlKey &&
             container && container.classList.contains(CLASS_TAB_GROUP)) {
    items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      item.classList.add(CLASS_TAB_HIGHLIGHT);
    }
  }
  if (items && items.length) {
    const arr = [];
    for (const tab of items) {
      const {dataset: tabDataset} = tab;
      const {tabId} = tabDataset;
      arr.push(tabId * 1);
    }
    if (arr.length) {
      data.tabIds = arr;
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
    }
  } else {
    const {tabId} = dataset;
    if (tabId) {
      data.tabIds = [tabId * 1];
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
 * @returns {Promise.<Array>} - result of each handler
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
    id !== PINNED && func.push(addDropEventListener(item));
  }
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
        document.querySelectorAll(`${TAB_QUERY}.${CLASS_TAB_HIGHLIGHT}`);
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
 * @returns {Promise.<Array>} - results of each handler
 */
const handleCreatedTab = async tabsTab => {
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
    if (Number.isInteger(openerTabId)) {
      openerTab = document.querySelector(`[data-tab-id="${openerTabId}"]`);
      if (openerTab && openerTab.dataset && openerTab.dataset.tab) {
        openerTabsTab = JSON.parse(openerTab.dataset.tab);
      }
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
          const lastChildTabId = lastChildTab.dataset.tabId * 1;
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
      document.querySelectorAll(`${TAB_QUERY}.${CLASS_TAB_HIGHLIGHT}`);
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
 * @returns {void}
 */
const handleMovedTab = async (tabId, info) => {
  const {fromIndex, toIndex, windowId} = info;
  if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const items = document.querySelectorAll(TAB_QUERY);
      if (toIndex === 0) {
        const tabsTab = await getTab(tabId);
        const {pinned} = tabsTab;
        if (pinned) {
          const container = document.getElementById(PINNED);
          const {firstElementChild} = container;
          container.insertBefore(tab, firstElementChild);
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          const [target] = items;
          container.appendChild(tab);
          container.removeAttribute("hidden");
          target.parentNode.insertBefore(container, target);
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
        if (!group && parentNode.childElementCount === 1 || unPinned ||
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
    }
  }
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
        const {muted} = tabsTab.mutedInfo;
        const {audible} = tabsTab;
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

/* sync */
/**
 * sync tab
 * @param {number} tabId - tab ID
 * @returns {?AsyncFunction} - handleUpdatedTab()
 */
const syncTab = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}`);
  }
  let func;
  const tabsTab = await getTab(tabId);
  if (tabsTab) {
    const {favIconUrl, status, title} = tabsTab;
    const info = {favIconUrl, status, title};
    func = handleUpdatedTab(tabId, info, tabsTab);
  }
  return func || null;
};

/**
 * sync tab group
 * @param {Object} container - tab container
 * @returns {Promise.<Array>} - results of each handler
 */
const syncTabGroup = async container => {
  const func = [];
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      const itemId = item && item.dataset && item.dataset.tabId * 1;
      Number.isInteger(itemId) && func.push(syncTab(itemId));
    }
  }
  return Promise.all(func);
};

/**
 * emulate tabs to sidebar
 * @returns {Promise.<Array>} - results of each handler
 */
const emulateTabs = async () => {
  const items = await getAllTabsInWindow(WINDOW_ID_CURRENT);
  const func = [];
  for (const item of items) {
    func.push(handleCreatedTab(item));
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
 * handle context menu click
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
const handleClickedContextMenu = async evt => {
  const {target} = evt;
  const {id: targetId, parentNode: targetParent} = target;
  const {id: parentId} = targetParent;
  const id = targetId || parentId;
  const tab = sidebar.context && sidebar.context.classList &&
                sidebar.context.classList.contains(TAB) && sidebar.context;
  const tabId = tab && tab.dataset && tab.dataset.tabId &&
                  tab.dataset.tabId * 1;
  const tabsTab = tab && tab.dataset && tab.dataset.tab &&
                    JSON.parse(tab.dataset.tab);
  const func = [];
  switch (id) {
    case TAB_BOOKMARK: {
      if (tabsTab && !tabsTab.pinned) {
        const {title, url} = tabsTab;
        func.push(createBookmark({title, url}));
      }
      break;
    }
    case TAB_BOOKMARK_ALL:
      func.push(bookmarkAllTabs());
      break;
    case TAB_CLOSE:
      if (Number.isInteger(tabId)) {
        func.push(removeTab(tabId));
      }
      break;
    case TAB_CLOSE_END: {
      if (Number.isInteger(tabId)) {
        const index = tabsTab && tabsTab.index && tabsTab.index * 1;
        const arr = [];
        if (Number.isInteger(index)) {
          const items = document.querySelectorAll(
            `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
          );
          for (const item of items) {
            const {dataset} = item;
            const itemId = dataset && dataset.tabId && dataset.tabId * 1;
            const itemTab = dataset && dataset.tab && JSON.parse(dataset.tab);
            const itemIndex = itemTab && itemTab.index && itemTab.index * 1;
            Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
              itemIndex > index && arr.push(itemId);
          }
        }
        arr.length && func.push(removeTab(arr));
      }
      break;
    }
    case TAB_CLOSE_OTHER: {
      if (Number.isInteger(tabId)) {
        const items = document.querySelectorAll(
          `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
        );
        const arr = [];
        for (const item of items) {
          const {dataset} = item;
          const itemId = dataset && dataset.tabId && dataset.tabId * 1;
          Number.isInteger(itemId) && arr.push(itemId);
        }
        arr.length && func.push(removeTab(arr));
      }
      break;
    }
    case TAB_CLOSE_UNDO:
      func.push(undoCloseTab());
      break;
    case TAB_DUPE:
      if (Number.isInteger(tabId)) {
        func.push(dupeTab(tabId));
      }
      break;
    case TAB_GROUP_BOOKMARK: {
      if (tab && tabsTab && !tabsTab.pinned) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(bookmarkTabGroup(tabParent));
        }
      }
      break;
    }
    case TAB_GROUP_CLOSE: {
      if (tab && tabsTab && !tabsTab.pinned) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(
            closeTabGroup(tabParent).then(restoreTabContainers)
              .then(setSessionTabList)
          );
        }
      }
      break;
    }
    case TAB_GROUP_COLLAPSE: {
      if (tab) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(toggleTabGroupCollapsedState({target: tab}));
        }
      }
      break;
    }
    case TAB_GROUP_DETACH: {
      if (tab) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP) &&
            !tabParentClassList.contains(PINNED)) {
          func.push(
            detachTabFromGroup(tab).then(restoreTabContainers)
              .then(setSessionTabList)
          );
        }
      }
      break;
    }
    case TAB_GROUP_DUPE: {
      if (tab && tabsTab && !tabsTab.pinned) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(dupeTabGroup(tabParent));
        }
      }
      break;
    }
    case TAB_GROUP_PIN: {
      if (tab) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(pinTabGroup(tabParent));
        }
      }
      break;
    }
    case TAB_GROUP_RELOAD: {
      if (tab) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(reloadTabGroup(tabParent));
        }
      }
      break;
    }
    case TAB_GROUP_SELECTED:
      func.push(groupSelectedTabs());
      break;
    case TAB_GROUP_SYNC: {
      if (tab) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(syncTabGroup(tabParent));
        }
      }
      break;
    }
    case TAB_GROUP_UNGROUP: {
      if (tab && tabsTab && !tabsTab.pinned) {
        const {parentNode: tabParent} = tab;
        const {classList: tabParentClassList} = tabParent;
        if (tabParentClassList.contains(CLASS_TAB_GROUP)) {
          func.push(
            ungroupTabs(tabParent).then(restoreTabContainers)
              .then(setSessionTabList)
          );
        }
      }
      break;
    }
    case TAB_MOVE_WIN_NEW:
      if (Number.isInteger(tabId)) {
        func.push(createNewWindow({
          tabId,
          type: "normal",
        }));
      }
      break;
    case TAB_MUTE: {
      if (Number.isInteger(tabId) && tabsTab) {
        const {mutedInfo: {muted}} = tabsTab;
        func.push(updateTab(tabId, {muted: !muted}));
      }
      break;
    }
    case TAB_PIN: {
      if (tabsTab) {
        const {pinned} = tabsTab;
        func.push(updateTab(tabId, {pinned: !pinned}));
      }
      break;
    }
    case TAB_RELOAD:
      if (Number.isInteger(tabId)) {
        func.push(reloadTab(tabId));
      }
      break;
    case TAB_RELOAD_ALL:
      func.push(reloadAllTabs());
      break;
    case TAB_SYNC:
      if (Number.isInteger(tabId)) {
        func.push(syncTab(tabId));
      }
      break;
    default:
      throw new Error(`No handler found for ${id}.`);
  }
  return Promise.all(func).then(removeHighlightFromTabs);
};

/**
 * add menuitem click listener
 * @param {Object} elm - element
 * @returns {void}
 */
const addContextMenuClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", evt =>
      handleClickedContextMenu(evt).catch(throwErr)
    );
  }
};

/**
 * create context menu item
 * @param {string} id - menu item ID
 * @param {Object} data - context data
 * @returns {Promise.<Array>} - results of each handler
 */
const createMenuItem = async (id, data = {}) => {
  const {enabled, onclick, title, type} = data;
  const func = [];
  if (isString(id) && type === "normal") {
    const elm = document.getElementById(id);
    if (elm) {
      const {classList} = elm;
      const label = elm.querySelector(`.${CLASS_MENU_LABEL}`);
      if (label) {
        label.textContent = title;
        label.title = title;
      }
      if (enabled) {
        classList.remove(DISABLED);
      } else {
        classList.add(DISABLED);
      }
      onclick && func.push(addContextMenuClickListener(elm));
    }
  }
  return Promise.all(func);
};

/**
 * create context menu items
 * @param {Object} menu - menu
 * @returns {Promise.<Array>} - results of each handler
 */
const createContextMenu = async (menu = menuItems) => {
  const items = Object.keys(menu);
  const func = [];
  for (const item of items) {
    const {enabled, id, onclick, subItems, title, type} = menu[item];
    const itemData = {enabled, onclick, title, type};
    func.push(createMenuItem(id, itemData));
    if (subItems) {
      func.push(createContextMenu(subItems));
    }
  }
  return Promise.all(func);
};

/**
 * handle context menu
 * @param {!Object} evt - event
 * @returns {Promse.<Array>} - Promise chain
 */
const handleContextMenu = evt => {
  const {button, key, shiftKey, target} = evt;
  const func = [];
  if (shiftKey && key === "F10" || key === "ContextMenu" ||
      button === MOUSE_BUTTON_RIGHT) {
    const tab = getSidebarTab(target);
    const tabMenu = menuItems.sidebarTabs.subItems[TAB];
    const tabKeys = [
      TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_DUPE,
      TAB_MOVE_WIN_NEW, TAB_MUTE, TAB_PIN, TAB_RELOAD, TAB_SYNC,
    ];
    const tabGroupMenu = menuItems.sidebarTabs.subItems[TAB_GROUP];
    const tabGroupKeys = [
      TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
      TAB_GROUP_DETACH, TAB_GROUP_DUPE, TAB_GROUP_PIN, TAB_GROUP_RELOAD,
      TAB_GROUP_SELECTED, TAB_GROUP_SYNC, TAB_GROUP_UNGROUP,
    ];
    const allTabsKeys = [TAB_BOOKMARK_ALL, TAB_CLOSE_UNDO];
    if (tab) {
      const {classList: tabClass, parentNode} = tab;
      const {classList: parentClass} = parentNode;
      const tabId = tab.dataset && tab.dataset.tabId;
      const tabsTab = tab.dataset && JSON.parse(tab.dataset.tab);
      sidebar.context = tab;
      func.push(
        updateContextMenu(tabMenu.id, {
          enabled: true,
          title: tabMenu.title,
        }),
        toggleContextMenuClass(TAB, true),
      );
      for (const itemKey of tabKeys) {
        const item = tabMenu.subItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        switch (itemKey) {
          case TAB_DUPE:
            if (tabsTab.pinned) {
              data.enabled = false;
            } else {
              data.enabled = true;
            }
            data.title = title;
            break;
          case TAB_CLOSE_END: {
            if (tabsTab.pinned) {
              data.enabled = false;
            } else {
              const index = getSidebarTabIndex(tab);
              const obj = document.querySelectorAll(TAB_QUERY);
              if (Number.isInteger(index) && obj.length - 1 > index) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
            }
            data.title = title;
            break;
          }
          case TAB_CLOSE_OTHER: {
            if (tabsTab.pinned) {
              data.enabled = false;
            } else {
              const obj = tabId && document.querySelectorAll(
                `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
              );
              if (obj && obj.length) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
            }
            data.title = title;
            break;
          }
          case TAB_MUTE: {
            const {mutedInfo: {muted}} = tabsTab;
            data.enabled = true;
            if (muted) {
              data.title = toggleTitle;
            } else {
              data.title = title;
            }
            break;
          }
          case TAB_PIN:
            data.enabled = true;
            if (parentClass.contains(PINNED)) {
              data.title = toggleTitle;
            } else {
              data.title = title;
            }
            break;
          default:
            data.enabled = true;
            data.title = title;
        }
        func.push(updateContextMenu(id, data));
      }
      if (parentClass.contains(CLASS_TAB_GROUP) ||
          tabClass.contains(CLASS_TAB_HIGHLIGHT)) {
        func.push(
          updateContextMenu(tabGroupMenu.id, {
            enabled: true,
            title: tabGroupMenu.title,
          }),
          toggleContextMenuClass(CLASS_TAB_GROUP, true),
        );
      } else {
        func.push(
          updateContextMenu(tabGroupMenu.id, {
            enabled: false,
            title: tabGroupMenu.title,
          }),
          toggleContextMenuClass(CLASS_TAB_GROUP, false),
        );
      }
      for (const itemKey of tabGroupKeys) {
        const item = tabGroupMenu.subItems[itemKey];
        const {id, title, toggleTitle} = item;
        const data = {};
        switch (itemKey) {
          case TAB_GROUP_BOOKMARK:
          case TAB_GROUP_CLOSE:
          case TAB_GROUP_DETACH:
          case TAB_GROUP_DUPE:
          case TAB_GROUP_PIN:
          case TAB_GROUP_UNGROUP:
            if (!tabsTab.pinned && parentClass.contains(CLASS_TAB_GROUP)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
            break;
          case TAB_GROUP_COLLAPSE: {
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
          }
          case TAB_GROUP_SELECTED: {
            if (!tabsTab.pinned && tabClass.contains(CLASS_TAB_HIGHLIGHT)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
            break;
          }
          default:
            if (parentClass.contains(CLASS_TAB_GROUP)) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            data.title = title;
        }
        func.push(updateContextMenu(id, data));
      }
    } else {
      sidebar.context = target;
      func.push(
        updateContextMenu(tabMenu.id, {
          enabled: false,
          title: tabMenu.title,
        }),
        toggleContextMenuClass(TAB, false),
        toggleContextMenuClass(CLASS_TAB_GROUP, false),
      );
      for (const itemKey of tabKeys) {
        const item = tabMenu.subItems[itemKey];
        const {id, title} = item;
        const enabled = false;
        func.push(updateContextMenu(id, {enabled, title}));
      }
      func.push(updateContextMenu(tabGroupMenu.id, {
        enabled: false,
        title: tabGroupMenu.title,
      }));
      for (const itemKey of tabGroupKeys) {
        const item = tabGroupMenu.subItems[itemKey];
        const {id, title} = item;
        const enabled = false;
        func.push(updateContextMenu(id, {enabled, title}));
      }
    }
    for (const itemKey of allTabsKeys) {
      const item = menuItems.sidebarTabs.subItems[itemKey];
      const {id, title} = item;
      const data = {};
      switch (itemKey) {
        case TAB_BOOKMARK_ALL: {
          const items =
            document.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
          if (items.length > 1) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
          break;
        }
        case TAB_CLOSE_UNDO: {
          const {lastClosedTab} = sidebar;
          if (lastClosedTab) {
            data.enabled = true;
          } else {
            data.enabled = false;
          }
          break;
        }
        default:
          data.enabled = true;
      }
      data.title = title;
      func.push(updateContextMenu(id, data));
    }
  }
  return Promise.all(func).catch(throwErr);
};

window.addEventListener("keydown", handleContextMenu, true);
window.addEventListener("mousedown", handleContextMenu, true);

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
      case EXT_INIT: {
        if (obj) {
          func.push(initSidebar(obj));
        }
        break;
      }
      case TAB_OBSERVE: {
        if (obj) {
          const {tab} = sender;
          const {id} = tab;
          Number.isInteger(id) && func.push(observeTab(id));
        }
        break;
      }
      default:
    }
  }
  return Promise.all(func);
};

/* listeners */
storage.onChanged.addListener(data => setVars(data).catch(throwErr));

runtime.onMessage.addListener((msg, sender) => {
  handleMsg(msg, sender).catch(throwErr);
});

tabs.onActivated.addListener(info =>
  handleActivatedTab(info).then(expandActivatedCollapsedTab).catch(throwErr)
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
    .then(setSessionTabList).then(expandActivatedCollapsedTab)
    .catch(throwErr)
);

tabs.onHighlighted.addListener(info =>
  handleHighlightedTab(info).catch(throwErr)
);

tabs.onMoved.addListener((tabId, info) =>
  handleMovedTab(tabId, info).then(restoreTabContainers)
    .then(setSessionTabList).catch(throwErr)
);

tabs.onRemoved.addListener((tabId, info) =>
  handleRemovedTab(tabId, info).then(restoreTabContainers)
    .then(setSessionTabList).then(getLastClosedTab)
    .then(expandActivatedCollapsedTab).catch(throwErr)
);

tabs.onUpdated.addListener((tabId, info, tabsTab) =>
  handleUpdatedTab(tabId, info, tabsTab).catch(throwErr)
);

/* start up */
setSidebarTheme().then(() => Promise.all([
  addDropEventListener(document.getElementById(SIDEBAR_MAIN)),
  addNewTabClickListener(),
  createContextMenu(),
  setSidebar(),
  localizeHtml(),
  makeConnection({name: TAB}),
])).then(emulateTabs).then(restoreTabGroup).then(restoreTabContainers)
  .then(restoreHighlightedTab).then(setSessionTabList).then(getLastClosedTab)
  .catch(throwErr);
