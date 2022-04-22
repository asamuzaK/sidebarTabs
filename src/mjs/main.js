/**
 * main.js
 */

/* shared */
import {
  getType, isObjectNotEmpty, isString, sleep, throwErr
} from './common.js';
import {
  clearStorage, getActiveTab, getAllContextualIdentities,
  getAllTabsInWindow, getContextualId, getCurrentWindow, getHighlightedTab,
  getOs, getRecentlyClosedTab, getStorage, getTab, highlightTab, moveTab,
  restoreSession, setSessionWindowValue, warmupTab
} from './browser.js';
import { ports } from './port.js';
import {
  activateTab, createSidebarTab, getSessionTabList, getSidebarTab,
  getSidebarTabContainer, getSidebarTabId, getSidebarTabIndex, getTabsInRange,
  getTemplate, isNewTab, requestSaveSession, scrollTabIntoView,
  storeCloseTabsByDoubleClickValue, switchTab
} from './util.js';
import { bookmarkTabs } from './bookmark.js';
import {
  closeOtherTabs, closeTabs, closeTabsToEnd, closeTabsToStart,
  createNewTab, createNewTabInContainer, dupeTabs, highlightTabs,
  moveTabsToEnd, moveTabsToStart, moveTabsToNewWindow,
  muteTabs, pinTabs, reloadTabs, reopenTabsInContainer
} from './browser-tabs.js';
import {
  addHighlightToTabs, addTabAudioClickListener, addTabCloseClickListener,
  addTabIconErrorListener, removeHighlightFromTabs,
  setContextualIdentitiesIcon, setTabAudio, setTabAudioIcon, setTabContent,
  setTabIcon
} from './tab-content.js';
import {
  handleDragEnd, handleDragEnter, handleDragLeave, handleDragOver,
  handleDragStart, handleDrop
} from './tab-dnd.js';
import {
  addListenersToHeadingItems, addTabContextClickListener, bookmarkTabGroup,
  closeTabGroup, collapseTabGroups, detachTabsFromGroup, getTabGroupHeading,
  groupSameContainerTabs, groupSameDomainTabs, groupSelectedTabs,
  replaceTabContextClickListener, restoreTabContainers,
  toggleAutoCollapsePinnedTabs, toggleTabGrouping,
  toggleTabGroupCollapsedState, toggleTabGroupsCollapsedState,
  toggleTabGroupHeadingState, ungroupTabs
} from './tab-group.js';
import { overrideContextMenu, updateContextMenu } from './menu.js';
import menuItems from './menu-items.js';
import {
  applyTheme, initCustomTheme, sendCurrentTheme, setNewTabSeparator,
  setScrollbarWidth, setTabGroupColorBarWidth, setTabHeight, setTheme,
  setUserCss, updateCustomThemeCss
} from './theme.js';
import {
  ACTIVE, AUDIBLE, BROWSER_SETTINGS_READ,
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_AUDIO, CLASS_TAB_AUDIO_ICON,
  CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON, CLASS_TAB_COLLAPSED,
  CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTENT,
  CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_ICON, CLASS_TAB_IDENT_ICON,
  CLASS_TAB_ITEMS, CLASS_TAB_TITLE, CLASS_TAB_TMPL, CLASS_TAB_TOGGLE_ICON,
  CLASS_THEME_CUSTOM,
  COOKIE_STORE_DEFAULT,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_SELECT,
  CUSTOM_BG_SELECT_HOVER, CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  DISCARDED, EXT_INIT, HIGHLIGHTED,
  NEW_TAB, NEW_TAB_BUTTON, NEW_TAB_OPEN_CONTAINER, NEW_TAB_SEPARATOR_SHOW,
  OPTIONS_OPEN, PINNED, SCROLL_DIR_INVERT,
  SIDEBAR, SIDEBAR_MAIN, SIDEBAR_STATE_UPDATE,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK, TAB_CLOSE,
  TAB_CLOSE_DBLCLICK, TAB_CLOSE_END, TAB_CLOSE_MDLCLICK,
  TAB_CLOSE_MDLCLICK_PREVENT, TAB_CLOSE_OTHER, TAB_CLOSE_START, TAB_CLOSE_UNDO,
  TAB_DUPE,
  TAB_GROUP, TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER, TAB_GROUP_DETACH,
  TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND_COLLAPSE_OTHER, TAB_GROUP_EXPAND_EXCLUDE_PINNED,
  TAB_GROUP_LABEL_SHOW, TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED,
  TAB_GROUP_UNGROUP,
  TAB_LIST, TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE,
  TAB_NEW, TAB_PIN, TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER,
  TAB_SKIP_COLLAPSED, TAB_SWITCH_SCROLL, TAB_SWITCH_SCROLL_ALWAYS,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_MULTIPLE, TABS_DUPE, TABS_MOVE,
  TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN,
  TABS_RELOAD, TABS_REOPEN_CONTAINER,
  THEME_AUTO, THEME_CUSTOM, THEME_CUSTOM_INIT, THEME_CUSTOM_REQ,
  THEME_DARK, THEME_LIGHT, THEME_LIST,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW,
  USER_CSS, USER_CSS_USE
} from './constant.js';

/* api */
const { i18n, runtime, tabs } = browser;

/* constants */
const { TAB_ID_NONE } = tabs;
const MOUSE_BUTTON_LEFT = 0;
const MOUSE_BUTTON_MIDDLE = 1;
const MOUSE_BUTTON_RIGHT = 2;

/* sidebar */
export const sidebar = {
  alwaysSwitchTabByScrolling: false,
  closeTabsByDoubleClick: false,
  closeTabsByMiddleClick: true,
  context: null,
  contextualIds: null,
  enableTabGroup: true,
  firstSelectedTab: null,
  incognito: false,
  invertScrollDirection: false,
  isMac: false,
  lastClosedTab: null,
  pinnedTabsWaitingToMove: null,
  readBrowserSettings: false,
  showNewTabSeparator: false,
  skipCollapsed: false,
  switchTabByScrolling: false,
  tabGroupOnExpandCollapseOther: false,
  tabGroupOnExpandExcludePinned: false,
  tabGroupPutNewTabAtTheEnd: false,
  tabsWaitingToMove: null,
  useUserCSS: false,
  windowId: null
};

/**
 * set sidebar
 *
 * @returns {void}
 */
export const setSidebar = async () => {
  const win = await getCurrentWindow({
    populate: true
  });
  const { id: windowId, incognito } = win;
  const store = await getStorage([
    BROWSER_SETTINGS_READ,
    NEW_TAB_SEPARATOR_SHOW,
    SCROLL_DIR_INVERT,
    TAB_CLOSE_DBLCLICK,
    TAB_CLOSE_MDLCLICK_PREVENT,
    TAB_GROUP_ENABLE,
    TAB_GROUP_EXPAND_COLLAPSE_OTHER,
    TAB_GROUP_EXPAND_EXCLUDE_PINNED,
    TAB_GROUP_NEW_TAB_AT_END,
    TAB_SKIP_COLLAPSED,
    TAB_SWITCH_SCROLL,
    TAB_SWITCH_SCROLL_ALWAYS,
    USER_CSS_USE
  ]);
  const os = await getOs();
  if (isObjectNotEmpty(store)) {
    const {
      alwaysSwitchTabByScrolling, closeTabsByDoubleClick, enableTabGroup,
      invertScrollDirection, preventCloseTabsByMiddleClick, readBrowserSettings,
      showNewTabSeparator, skipCollapsed, switchTabByScrolling,
      tabGroupOnExpandCollapseOther, tabGroupOnExpandExcludePinned,
      tabGroupPutNewTabAtTheEnd, useUserCSS
    } = store;
    sidebar.alwaysSwitchTabByScrolling = alwaysSwitchTabByScrolling
      ? !!alwaysSwitchTabByScrolling.checked
      : false;
    sidebar.closeTabsByDoubleClick = closeTabsByDoubleClick
      ? !!closeTabsByDoubleClick.checked
      : false;
    sidebar.closeTabsByMiddleClick = preventCloseTabsByMiddleClick
      ? !preventCloseTabsByMiddleClick.checked
      : true;
    sidebar.enableTabGroup = enableTabGroup
      ? !!enableTabGroup.checked
      : true;
    sidebar.invertScrollDirection = invertScrollDirection
      ? !!invertScrollDirection.checked
      : false;
    sidebar.readBrowserSettings = readBrowserSettings
      ? !!readBrowserSettings.checked
      : false;
    sidebar.showNewTabSeparator = showNewTabSeparator
      ? !!showNewTabSeparator.checked
      : false;
    sidebar.skipCollapsed = skipCollapsed ? !!skipCollapsed.checked : false;
    sidebar.switchTabByScrolling = switchTabByScrolling
      ? !!switchTabByScrolling.checked
      : false;
    sidebar.tabGroupOnExpandCollapseOther = tabGroupOnExpandCollapseOther
      ? !!tabGroupOnExpandCollapseOther.checked
      : false;
    sidebar.tabGroupOnExpandExcludePinned = tabGroupOnExpandExcludePinned
      ? !!tabGroupOnExpandExcludePinned.checked
      : false;
    sidebar.tabGroupPutNewTabAtTheEnd = tabGroupPutNewTabAtTheEnd
      ? !!tabGroupPutNewTabAtTheEnd.checked
      : false;
    sidebar.useUserCSS = useUserCSS
      ? !!useUserCSS.checked
      : false;
  } else {
    sidebar.alwaysSwitchTabByScrolling = false;
    sidebar.closeTabsByDoubleClick = false;
    sidebar.closeTabsByMiddleClick = true;
    sidebar.enableTabGroup = true;
    sidebar.invertScrollDirection = false;
    sidebar.readBrowserSettings = false;
    sidebar.showNewTabSeparator = false;
    sidebar.skipCollapsed = false;
    sidebar.switchTabByScrolling = false;
    sidebar.tabGroupOnExpandCollapseOther = false;
    sidebar.tabGroupOnExpandExcludePinned = false;
    sidebar.tabGroupPutNewTabAtTheEnd = false;
    sidebar.useUserCSS = false;
  }
  sidebar.incognito = incognito;
  sidebar.isMac = os === 'mac';
  sidebar.windowId = windowId;
};

/**
 * set context
 *
 * @param {object} elm - Element
 * @returns {void}
 */
export const setContext = elm => {
  sidebar.context = elm && elm.nodeType === Node.ELEMENT_NODE ? elm : null;
};

/**
 * set contextual identities cookieStoreIds
 *
 * @returns {void}
 */
export const setContextualIds = async () => {
  const items = await getAllContextualIdentities();
  const arr = [];
  if (items) {
    for (const item of items) {
      const { cookieStoreId } = item;
      arr.push(cookieStoreId);
    }
  }
  sidebar.contextualIds = arr.length ? arr : null;
};

/**
 * set last closed tab
 *
 * @param {object} tab - tabs.Tab
 * @returns {void}
 */
export const setLastClosedTab = async tab => {
  sidebar.lastClosedTab = isObjectNotEmpty(tab) ? tab : null;
};

/**
 * set pinned tabs waiting to move
 *
 * @param {?Array} arr - array of tabs
 * @returns {void}
 */
export const setPinnedTabsWaitingToMove = async arr => {
  sidebar.pinnedTabsWaitingToMove = Array.isArray(arr) ? arr : null;
};

/**
 * set tabs waiting to move
 *
 * @param {?Array} arr - array of tabs
 * @returns {void}
 */
export const setTabsWaitingToMove = async arr => {
  sidebar.tabsWaitingToMove = Array.isArray(arr) ? arr : null;
};

/**
 * init sidebar
 *
 * @param {boolean} bool - bypass cache
 * @returns {void}
 */
export const initSidebar = async (bool = false) => {
  const { windowId } = sidebar;
  await setSessionWindowValue(TAB_LIST, null, windowId);
  await clearStorage();
  window.location.reload(bool);
};

/**
 * get last closed tab
 *
 * @returns {object} - tabs.Tab
 */
export const getLastClosedTab = async () => {
  const { windowId } = sidebar;
  const tab = await getRecentlyClosedTab(windowId);
  await setLastClosedTab(tab);
  return tab || null;
};

/**
 * undo close tab
 *
 * @returns {?Function} - restoreSession()
 */
export const undoCloseTab = async () => {
  const { lastClosedTab } = sidebar;
  let func;
  if (lastClosedTab) {
    const { sessionId } = lastClosedTab;
    func = restoreSession(sessionId);
  }
  return func || null;
};

/**
 * apply user style
 *
 * @returns {Function} - setUserCSS()
 */
export const applyUserStyle = async () => {
  const { useUserCSS } = sidebar;
  let css;
  if (useUserCSS) {
    const res = await getStorage(USER_CSS);
    if (res) {
      const { userCSS } = res;
      if (userCSS) {
        css = userCSS.value;
      }
    }
  }
  return setUserCss(css || '');
};

/* DnD */
/**
 * trigger DnD handler
 *
 * @param {!object} evt - event
 * @returns {?Function} - handleDragStart() / handleDragOver()
 */
export const triggerDndHandler = evt => {
  const { currentTarget, type } = evt;
  const { isMac, windowId } = sidebar;
  let func;
  if (currentTarget.draggable && type === 'dragstart') {
    func = handleDragStart(evt, { isMac, windowId });
  } else if (type === 'dragover') {
    func = handleDragOver(evt, { isMac });
  }
  return func || null;
};

/* sidebar tab event handlers */
/**
 * handle create new tab
 *
 * @param {object} evt - event
 * @returns {?Function} - createNewTab()
 */
export const handleCreateNewTab = evt => {
  const { button, currentTarget, target, type } = evt;
  const main = document.getElementById(SIDEBAR_MAIN);
  const newTab = document.getElementById(NEW_TAB_BUTTON);
  let func;
  if (currentTarget === newTab || target === newTab ||
      (((button === MOUSE_BUTTON_MIDDLE && type === 'mousedown') ||
        (button === MOUSE_BUTTON_LEFT && type === 'dblclick')) &&
       target === main)) {
    const { windowId } = sidebar;
    func = createNewTab(windowId).catch(throwErr);
  }
  return func || null;
};

/**
 * activate clicked tab
 *
 * @param {object} elm - tab
 * @returns {Function} - activateTab()
 */
export const activateClickedTab = async elm => {
  const tabId = getSidebarTabId(elm);
  let func;
  if (Number.isInteger(tabId)) {
    const { closeTabsByDoubleClick } = sidebar;
    closeTabsByDoubleClick && await sleep(300);
    try {
      const { active } = await getTab(tabId);
      if (!active) {
        func = activateTab(elm);
      }
    } catch (e) {
      func = null;
    }
  }
  return func || null;
};

/**
 * handle clicked tab
 *
 * @param {!object} evt - event
 * @returns {Promise.<Array|Error>} - promise chain
 */
export const handleClickedTab = evt => {
  const { button, ctrlKey, detail, metaKey, shiftKey, target, type } = evt;
  const {
    closeTabsByDoubleClick, closeTabsByMiddleClick, firstSelectedTab, isMac,
    switchTabByScrolling, windowId
  } = sidebar;
  const tab = getSidebarTab(target);
  const func = [];
  if (button === MOUSE_BUTTON_MIDDLE && type === 'mousedown' && tab) {
    if (!switchTabByScrolling || closeTabsByMiddleClick) {
      func.push(closeTabs([tab]));
      evt.stopPropagation();
      evt.preventDefault();
    }
  } else if (button === MOUSE_BUTTON_LEFT && type === 'dblclick' &&
             closeTabsByDoubleClick && tab) {
    const { classList } = tab;
    if (classList.contains(ACTIVE)) {
      func.push(closeTabs([tab]));
    } else {
      func.push(activateTab(tab));
    }
    evt.stopPropagation();
    evt.preventDefault();
  } else if (type === 'click') {
    if (shiftKey) {
      if (tab && firstSelectedTab) {
        const items = getTabsInRange(tab, firstSelectedTab);
        func.push(highlightTabs(items, windowId));
      }
    } else if ((isMac && metaKey) || (!isMac && ctrlKey)) {
      const firstSelectedTabIndex = getSidebarTabIndex(firstSelectedTab);
      const tabIndex = getSidebarTabIndex(tab);
      if (Number.isInteger(firstSelectedTabIndex) &&
          Number.isInteger(tabIndex)) {
        const items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
        const highlights = new Set([firstSelectedTabIndex]);
        highlights.add(tabIndex);
        for (const item of items) {
          const itemIndex = getSidebarTabIndex(item);
          if ((itemIndex === firstSelectedTabIndex && itemIndex === tabIndex) ||
              itemIndex === tabIndex) {
            highlights.delete(itemIndex);
          } else {
            highlights.add(itemIndex);
          }
        }
        highlights.size &&
          func.push(highlightTab(Array.from(highlights), windowId));
      }
    } else {
      tab && detail === 1 && func.push(activateClickedTab(tab));
    }
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * add sidebar tab click listener
 *
 * @param {object} elm - element
 * @returns {void}
 */
export const addTabClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_ITEMS)) {
    elm.addEventListener('click', handleClickedTab);
    elm.addEventListener('mousedown', handleClickedTab);
  }
};

/**
 * toggle tab dblclick listener
 *
 * @param {object} elm - element
 * @param {boolean} bool - add or remove
 * @returns {void}
 */
export const toggleTabDblClickListener = async (elm, bool) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CONTENT)) {
    if (bool) {
      elm.addEventListener('dblclick', handleClickedTab);
    } else {
      elm.removeEventListener('dblclick', handleClickedTab);
    }
  }
};

/**
 * replace tab dblclick listeners
 *
 * @param {boolean} bool - add or remove
 * @returns {Promise.<Array>} - result of each handler
 */
export const replaceTabDblClickListeners = async (bool = false) => {
  const items = document.querySelectorAll(TAB_QUERY);
  const func = [];
  for (const item of items) {
    const tabContent = item.querySelector(`.${CLASS_TAB_CONTENT}`);
    tabContent && func.push(toggleTabDblClickListener(tabContent, !!bool));
  }
  return Promise.all(func);
};

/**
 * trigger tab warmup
 *
 * @param {!object} evt - event
 * @returns {?(Function|Error)} - promise chain
 */
export const triggerTabWarmup = evt => {
  const { target } = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    const { classList } = tab;
    const tabId = getSidebarTabId(tab);
    if (!classList.contains(ACTIVE) &&
        Number.isInteger(tabId) && tabId !== TAB_ID_NONE) {
      func = warmupTab(tabId).catch(throwErr);
    }
  }
  return func || null;
};

/**
 * add tab event listeners
 *
 * @param {object} elm - element
 * @returns {void}
 */
export const addTabEventListeners = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.draggable && elm.addEventListener('dragstart', triggerDndHandler);
    elm.addEventListener('dragenter', handleDragEnter);
    elm.addEventListener('dragover', triggerDndHandler);
    elm.addEventListener('dragleave', handleDragLeave);
    elm.addEventListener('dragend', handleDragEnd);
    elm.addEventListener('drop', handleDrop);
    elm.addEventListener('click', triggerTabWarmup, true);
    elm.addEventListener('click', handleClickedTab);
    elm.addEventListener('mousedown', handleClickedTab);
  }
};

/* tab handlers */
/**
 * handle activated tab
 *
 * @param {!object} info - activated info
 * @returns {?Function} - scrollTabIntoView()
 */
export const handleActivatedTab = async info => {
  const { tabId, windowId } = info;
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  let func;
  if (windowId === sidebar.windowId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      const { classList: newClass, parentNode: newParent } = tab;
      const newHeading = newParent.querySelector(`.${CLASS_HEADING}`);
      const items = document.querySelectorAll(
        `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
      );
      const tabsTab = await getTab(tabId);
      const highlightedTabs = await getHighlightedTab(windowId);
      const highlightedTabIds = [];
      for (const item of highlightedTabs) {
        const { id } = item;
        highlightedTabIds.push(id);
      }
      for (const item of items) {
        const {
          classList: oldClass, parentNode: oldParent
        } = item;
        const oldHeading = oldParent.querySelector(`.${CLASS_HEADING}`);
        const oldTabId = item.dataset.tabId * 1;
        !highlightedTabIds.includes(oldTabId) && oldClass.remove(HIGHLIGHTED);
        oldClass.remove(ACTIVE);
        oldHeading.classList.remove(ACTIVE);
        oldParent.classList.remove(ACTIVE);
      }
      newParent.classList.add(ACTIVE);
      !newHeading.hidden && newParent.classList.contains(CLASS_TAB_COLLAPSED) &&
        newHeading.classList.add(ACTIVE);
      newClass.add(ACTIVE);
      newClass.add(HIGHLIGHTED);
      tab.dataset.tab = JSON.stringify(tabsTab);
      sidebar.firstSelectedTab = tab;
      func = scrollTabIntoView(tab);
    }
  }
  return func || null;
};

/**
 * handle created tab
 *
 * @param {!object} tabsTab - tabs.Tab
 * @param {object} opt - options
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleCreatedTab = async (tabsTab, opt = {}) => {
  const {
    active, audible, cookieStoreId, favIconUrl, hidden, id, index, openerTabId,
    pinned, status, title, url, windowId: tabWindowId,
    mutedInfo: {
      muted
    }
  } = tabsTab;
  if (!Number.isInteger(id)) {
    throw new TypeError(`Expected Number but got ${getType(id)}.`);
  }
  if (!Number.isInteger(tabWindowId)) {
    throw new TypeError(`Expected Number but got ${getType(tabWindowId)}.`);
  }
  const {
    closeTabsByDoubleClick, enableTabGroup, incognito,
    tabGroupOnExpandCollapseOther, tabGroupPutNewTabAtTheEnd, windowId
  } = sidebar;
  const func = [];
  if (tabWindowId === windowId && id !== TAB_ID_NONE) {
    const { attached, emulate } = opt;
    const tab = getTemplate(CLASS_TAB_TMPL);
    const tabItems = [
      `.${CLASS_TAB_CONTEXT}`, `.${CLASS_TAB_TOGGLE_ICON}`,
      `.${CLASS_TAB_CONTENT}`, `.${CLASS_TAB_ICON}`, `.${CLASS_TAB_TITLE}`,
      `.${CLASS_TAB_AUDIO}`, `.${CLASS_TAB_AUDIO_ICON}`,
      `.${CLASS_TAB_CLOSE}`, `.${CLASS_TAB_CLOSE_ICON}`
    ];
    const items = tab.querySelectorAll(tabItems.join(','));
    const newTab = document.getElementById(NEW_TAB);
    const tabList = document.querySelectorAll(TAB_QUERY);
    const targetTab = tabList[index];
    const targetTabPrev = index > 0 && tabList[index - 1];
    const insertTarget = tabList.length !== index && targetTab &&
      targetTab.parentNode;
    const inGroup = tabList.length !== index && targetTab && targetTabPrev &&
      targetTab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
      targetTabPrev.parentNode.classList.contains(CLASS_TAB_GROUP) &&
      targetTab.parentNode === targetTabPrev.parentNode;
    let scroll;
    for (const item of items) {
      const { classList } = item;
      if (classList.contains(CLASS_TAB_CONTEXT)) {
        item.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
        func.push(
          addTabContextClickListener(item, !!tabGroupOnExpandCollapseOther)
        );
      } else if (classList.contains(CLASS_TAB_TOGGLE_ICON)) {
        item.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
      } else if (classList.contains(CLASS_TAB_CONTENT)) {
        item.title = title;
        func.push(toggleTabDblClickListener(item, !!closeTabsByDoubleClick));
      } else if (classList.contains(CLASS_TAB_TITLE)) {
        item.textContent = title;
      } else if (classList.contains(CLASS_TAB_AUDIO)) {
        if (audible || muted) {
          classList.add(AUDIBLE);
        } else {
          classList.remove(AUDIBLE);
        }
        func.push(
          setTabAudio(item, {
            audible,
            muted
          }),
          addTabAudioClickListener(item)
        );
      } else if (classList.contains(CLASS_TAB_CLOSE)) {
        item.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
        func.push(addTabCloseClickListener(item));
      } else if (classList.contains(CLASS_TAB_CLOSE_ICON)) {
        item.alt = i18n.getMessage(TAB_CLOSE);
      } else {
        classList.contains(CLASS_TAB_ICON) && func.push(
          setTabIcon(item, {
            favIconUrl,
            status,
            title,
            url
          }),
          addTabIconErrorListener(item)
        );
        classList.contains(CLASS_TAB_AUDIO_ICON) && func.push(
          setTabAudioIcon(item, {
            audible,
            muted
          })
        );
      }
    }
    tab.dataset.tabId = id;
    tab.dataset.tab = JSON.stringify(tabsTab);
    await addTabEventListeners(tab);
    if (!incognito && cookieStoreId && cookieStoreId !== COOKIE_STORE_DEFAULT) {
      const ident = await getContextualId(cookieStoreId);
      const { color, icon, name } = ident;
      const identIcon = tab.querySelector(`.${CLASS_TAB_IDENT_ICON}`);
      func.push(setContextualIdentitiesIcon(identIcon, {
        color,
        icon,
        name
      }));
    }
    if (pinned) {
      const container = document.getElementById(PINNED);
      tab.classList.add(PINNED);
      if (targetTab && targetTab.parentNode === container) {
        container.insertBefore(tab, targetTab);
      } else {
        container.appendChild(tab);
      }
      if (container.childElementCount > 1) {
        container.classList.add(CLASS_TAB_GROUP);
      }
    } else if (emulate) {
      await createSidebarTab(tab, insertTarget);
    } else if (attached) {
      if (inGroup) {
        const container = targetTab.parentNode;
        container.insertBefore(tab, targetTab);
        container.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabGroupCollapsedState(tab, true));
      } else {
        await createSidebarTab(tab, insertTarget);
      }
    } else {
      const openerTab = Number.isInteger(openerTabId) &&
        document.querySelector(`[data-tab-id="${openerTabId}"]`);
      if (openerTab && !openerTab.classList.contains(PINNED)) {
        const openerTabIndex = getSidebarTabIndex(openerTab);
        const container = openerTab.parentNode;
        const {
          lastElementChild: lastChildTab,
          nextElementSibling: nextContainer
        } = container;
        const lastChildTabId = getSidebarTabId(lastChildTab);
        const lastChildTabsTab = await getTab(lastChildTabId);
        const { index: lastChildTabIndex } = lastChildTabsTab;
        if (tabList.length === index && nextContainer !== newTab) {
          await createSidebarTab(tab);
        } else if (index !== openerTabIndex + 1 && !tabGroupPutNewTabAtTheEnd) {
          await createSidebarTab(tab, insertTarget);
        } else {
          if (enableTabGroup && tabGroupPutNewTabAtTheEnd) {
            if (index < lastChildTabIndex) {
              await moveTab(id, {
                windowId,
                index: lastChildTabIndex
              });
            }
            container.appendChild(tab);
          } else if (index < lastChildTabIndex && targetTab) {
            container.insertBefore(tab, targetTab);
          } else {
            container.appendChild(tab);
          }
          container.classList.contains(CLASS_TAB_COLLAPSED) &&
            func.push(toggleTabGroupCollapsedState(tab, true));
          scroll = true;
        }
      } else if (inGroup) {
        const container = targetTab.parentNode;
        container.insertBefore(tab, targetTab);
        container.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabGroupCollapsedState(tab, true));
      } else {
        await createSidebarTab(tab, insertTarget);
      }
    }
    if (hidden) {
      tab.setAttribute('hidden', 'hidden');
    } else {
      tab.removeAttribute('hidden');
      if (active ||
          (scroll && Number.isInteger(openerTabId) &&
           openerTabId !== TAB_ID_NONE)) {
        func.push(scrollTabIntoView(tab, {
          active,
          openerTabId
        }));
      }
    }
  }
  active && func.push(handleActivatedTab({
    tabId: id,
    windowId: tabWindowId
  }));
  return Promise.all(func);
};

/**
 * handle attached tab
 *
 * @param {!number} tabId - tab ID
 * @param {!object} info - attached tab info
 * @returns {?Function} - tabs.Tab
 */
export const handleAttachedTab = async (tabId, info) => {
  const { newPosition, newWindowId } = info;
  const { windowId } = sidebar;
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
    const opt = {
      attached: true
    };
    tabsTab.index = newPosition;
    func = handleCreatedTab(tabsTab, opt);
  }
  return func || null;
};

/**
 * handle detached tab
 *
 * @param {!number} tabId - tab ID
 * @param {!object} info - detached tab info
 * @returns {void}
 */
export const handleDetachedTab = async (tabId, info) => {
  const { oldWindowId } = info;
  const { windowId } = sidebar;
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
 *
 * @param {!object} info - info
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleHighlightedTab = async info => {
  const { tabIds, windowId } = info;
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
    const addHighlights = new Set(highlightedTabIds);
    const remHighlights = new Set();
    for (const item of items) {
      const itemId = getSidebarTabId(item);
      if (highlightedTabIds.includes(itemId)) {
        addHighlights.add(itemId);
      } else {
        remHighlights.add(itemId);
      }
    }
    func.push(
      addHighlightToTabs(Array.from(addHighlights)),
      removeHighlightFromTabs(Array.from(remHighlights))
    );
  }
  return Promise.all(func);
};

/**
 * handle moved tab
 *
 * @param {!number} tabId - tab ID
 * @param {!object} info - moved info
 * @returns {?Function} - promise
 */
export const handleMovedTab = async (tabId, info) => {
  const { fromIndex, toIndex, windowId } = info;
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
    const { index, pinned } = tabsTab;
    const { group, restore } = tab.dataset;
    let setSession;
    tab.dataset.tab = JSON.stringify(tabsTab);
    if (tabIndex !== index) {
      const { pinnedTabsWaitingToMove, tabsWaitingToMove } = sidebar;
      if (toIndex !== index) {
        const obj = {
          index, tabId, toIndex
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
            const { tabId: itemTabId } = item;
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
            const { tabId: itemTabId } = item;
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
              const { tabId: itemTabId } = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              container.insertBefore(itemTab, tab);
            }
            await setTabsWaitingToMove(null);
          }
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(tab);
          container.removeAttribute('hidden');
          if (fromIndex > toIndex) {
            targetParent.parentNode.insertBefore(container, targetParent);
          } else {
            targetParent.parentNode
              .insertBefore(container, targetParent.nextElementSibling);
          }
          if (Array.isArray(tabsWaitingToMove)) {
            const arr = tabsWaitingToMove.filter(i => i);
            for (const item of arr) {
              const { tabId: itemTabId } = item;
              const itemTab =
                document.querySelector(`[data-tab-id="${itemTabId}"]`);
              const itemContainer = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              itemContainer.appendChild(itemTab);
              itemContainer.removeAttribute('hidden');
              container.parentNode.insertBefore(itemContainer, container);
            }
            await setTabsWaitingToMove(null);
          }
        }
        setSession = true;
      }
    }
    if (group) {
      tab.dataset.group = '';
    }
    if (restore) {
      tab.dataset.restore = '';
      setSession = true;
    }
    if (setSession) {
      func = restoreTabContainers().then(requestSaveSession);
    }
  }
  return func || null;
};

/**
 * handle removed tab
 *
 * @param {!number} tabId - tab ID
 * @param {!object} info - removed tab info
 * @returns {void}
 */
export const handleRemovedTab = async (tabId, info) => {
  const { isWindowClosing, windowId } = info;
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
 *
 * @param {!number} tabId - tab ID
 * @param {!object} info - updated tab info
 * @param {!object} tabsTab - tabs.Tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleUpdatedTab = async (tabId, info, tabsTab) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const func = [];
  if (isObjectNotEmpty(info) && isObjectNotEmpty(tabsTab)) {
    const {
      audible, discarded, highlighted, index, mutedInfo: { muted }, windowId
    } = tabsTab;
    if (windowId === sidebar.windowId) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        const tabIndex = getSidebarTabIndex(tab);
        if (tabIndex !== index) {
          func.push(handleMovedTab(tabId, {
            windowId,
            fromIndex: tabIndex,
            toIndex: index
          }));
        }
        await setTabContent(tab, tabsTab);
        if (Object.prototype.hasOwnProperty.call(info, 'audible') ||
            Object.prototype.hasOwnProperty.call(info, 'mutedInfo')) {
          const tabAudio = tab.querySelector(`.${CLASS_TAB_AUDIO}`);
          const tabAudioIcon = tab.querySelector(`.${CLASS_TAB_AUDIO_ICON}`);
          const items =
            document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
          const opt = {
            audible,
            highlighted,
            muted
          };
          if (audible || muted) {
            tabAudio.classList.add(AUDIBLE);
          } else {
            tabAudio.classList.remove(AUDIBLE);
          }
          func.push(
            setTabAudio(tabAudio, opt, items.length),
            setTabAudioIcon(tabAudioIcon, opt)
          );
        }
        if (Object.prototype.hasOwnProperty.call(info, 'pinned')) {
          const pinnedContainer = document.getElementById(PINNED);
          if (info.pinned) {
            const container = pinnedContainer;
            tab.classList.add(PINNED);
            tab.parentNode !== container && container.appendChild(tab);
          } else {
            const {
              nextElementSibling: pinnedNextSibling,
              parentNode: pinnedParentNode
            } = pinnedContainer;
            const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
            tab.classList.remove(PINNED);
            container.appendChild(tab);
            container.removeAttribute('hidden');
            pinnedParentNode.insertBefore(container, pinnedNextSibling);
          }
          func.push(restoreTabContainers().then(requestSaveSession));
        }
        if ((Object.prototype.hasOwnProperty.call(info, 'status') &&
             info.status === 'complete') ||
            Object.prototype.hasOwnProperty.call(info, 'url')) {
          if (info.status === 'complete') {
            const activeTabsTab = await getActiveTab(windowId);
            const { id: activeTabId } = activeTabsTab;
            func.push(
              handleActivatedTab({
                windowId,
                tabId: activeTabId
              }),
              requestSaveSession(windowId)
            );
          } else {
            info.url && func.push(requestSaveSession(windowId));
          }
        }
        if (Object.prototype.hasOwnProperty.call(info, 'discarded')) {
          if (info.discarded) {
            tab.classList.add(DISCARDED);
          } else {
            tab.classList.remove(DISCARDED);
          }
        } else if (discarded) {
          tab.classList.add(DISCARDED);
        } else {
          tab.classList.remove(DISCARDED);
        }
        if (Object.prototype.hasOwnProperty.call(info, 'hidden')) {
          if (info.hidden) {
            tab.setAttribute('hidden', 'hidden');
          } else {
            tab.removeAttribute('hidden');
          }
        }
        tab.dataset.tab = JSON.stringify(tabsTab);
      }
    }
  }
  return Promise.all(func);
};

/* context menu */
/**
 * handle clicked menu
 *
 * @param {!object} info - clicked menu info
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleClickedMenu = async info => {
  const { menuItemId } = info;
  const {
    context, contextualIds, enableTabGroup, tabGroupOnExpandCollapseOther,
    windowId
  } = sidebar;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
  const tab = getSidebarTab(context);
  const tabId = getSidebarTabId(tab);
  const tabIndex = getSidebarTabIndex(tab);
  const heading = getTabGroupHeading(context);
  const func = [];
  let tabsTab;
  if (Number.isInteger(tabId)) {
    tabsTab = await getTab(tabId);
  }
  switch (menuItemId) {
    case OPTIONS_OPEN:
      func.push(runtime.openOptionsPage());
      break;
    case TAB_ALL_BOOKMARK:
      func.push(bookmarkTabs(Array.from(allTabs)));
      break;
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
    case TAB_CLOSE_START:
      func.push(closeTabsToStart(tab));
      break;
    case TAB_CLOSE_UNDO:
      func.push(undoCloseTab());
      break;
    case TAB_DUPE:
      func.push(dupeTabs([tab], windowId));
      break;
    case TAB_GROUP_BOOKMARK:
      func.push(bookmarkTabGroup(tab || heading));
      break;
    case TAB_GROUP_CLOSE:
      func.push(closeTabGroup(tab || heading));
      break;
    case TAB_GROUP_COLLAPSE:
      if (tab) {
        if (enableTabGroup && tabGroupOnExpandCollapseOther) {
          func.push(
            toggleTabGroupsCollapsedState(tab).then(requestSaveSession)
          );
        } else {
          func.push(
            toggleTabGroupCollapsedState(tab, true).then(requestSaveSession)
          );
        }
      }
      break;
    case TAB_GROUP_COLLAPSE_OTHER:
      tab && func.push(Promise.all([
        activateTab(tab),
        collapseTabGroups(tab)
      ]).then(requestSaveSession));
      break;
    case TAB_GROUP_CONTAINER:
      func.push(
        groupSameContainerTabs(tabId, windowId).then(restoreTabContainers)
          .then(requestSaveSession)
      );
      break;
    case TAB_GROUP_DETACH:
      tab && func.push(
        detachTabsFromGroup([tab], windowId).then(restoreTabContainers)
          .then(requestSaveSession)
      );
      break;
    case TAB_GROUP_DETACH_TABS:
      func.push(
        detachTabsFromGroup(Array.from(selectedTabs), windowId)
          .then(restoreTabContainers).then(requestSaveSession)
      );
      break;
    case TAB_GROUP_DOMAIN:
      func.push(
        groupSameDomainTabs(tabId, windowId).then(restoreTabContainers)
          .then(requestSaveSession)
      );
      break;
    case TAB_GROUP_LABEL_SHOW:
      heading && func.push(
        toggleTabGroupHeadingState(heading, tabGroupOnExpandCollapseOther)
      );
      break;
    case TAB_GROUP_SELECTED:
      func.push(
        groupSelectedTabs(windowId).then(restoreTabContainers)
          .then(requestSaveSession)
      );
      break;
    case TAB_GROUP_UNGROUP:
      tab && func.push(
        ungroupTabs(tab.parentNode).then(restoreTabContainers)
          .then(requestSaveSession)
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
        const { mutedInfo: { muted } } = tabsTab;
        func.push(muteTabs([tab], !muted));
      }
      break;
    case TAB_NEW: {
      const opt = {
        index: tabIndex + 1
      };
      if (tab) {
        if (tab.parentNode.classList.contains(CLASS_TAB_GROUP)) {
          opt.openerTabId = tabId;
        }
      }
      if (tabsTab) {
        const { cookieStoreId } = tabsTab;
        if (cookieStoreId !== COOKIE_STORE_DEFAULT) {
          opt.cookieStoreId = cookieStoreId;
        }
      }
      func.push(createNewTab(windowId, opt));
      break;
    }
    case TAB_PIN:
      if (tabsTab) {
        const { pinned } = tabsTab;
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
        const { mutedInfo: { muted } } = tabsTab;
        func.push(muteTabs(Array.from(selectedTabs), !muted));
      }
      break;
    case TABS_PIN:
      if (tabsTab) {
        const { pinned } = tabsTab;
        func.push(pinTabs(Array.from(selectedTabs), !pinned));
      }
      break;
    case TABS_RELOAD:
      func.push(reloadTabs(Array.from(selectedTabs)));
      break;
    default: {
      if (Array.isArray(contextualIds)) {
        if (menuItemId.endsWith('Reopen')) {
          const itemId = menuItemId.replace(/Reopen$/, '');
          if (contextualIds.includes(itemId)) {
            let arr;
            if (selectedTabs.length) {
              arr = Array.from(selectedTabs);
            } else {
              arr = [tab];
            }
            func.push(reopenTabsInContainer(arr, itemId, windowId));
          }
        } else if (menuItemId.endsWith('NewTab')) {
          const itemId = menuItemId.replace(/NewTab$/, '');
          contextualIds.includes(itemId) &&
            func.push(createNewTabInContainer(itemId, windowId));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * prepare contexual IDs menu items
 *
 * @param {string} parentId - parent ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const prepareContexualIdsMenuItems = async parentId => {
  if (!isString(parentId)) {
    throw new TypeError(`Expected String but got ${getType(parentId)}.`);
  }
  const func = [];
  const { contextualIds } = sidebar;
  if (Array.isArray(contextualIds)) {
    const itemKeys = contextualIds.filter(k => isString(k) && k);
    for (const itemKey of itemKeys) {
      if (parentId === TAB_REOPEN_CONTAINER ||
          parentId === TABS_REOPEN_CONTAINER) {
        func.push(updateContextMenu(`${itemKey}Reopen`, {
          parentId
        }));
      } else {
        parentId === NEW_TAB_OPEN_CONTAINER && func.push(
          updateContextMenu(`${itemKey}NewTab`, {
            parentId
          })
        );
      }
    }
  }
  return Promise.all(func);
};

/**
 * prepare new tab menu items
 *
 * @param {object} elm - target element
 * @returns {Promise.<Array>} - results of each handler
 */
export const prepareNewTabMenuItems = async elm => {
  const func = [];
  if (isNewTab(elm)) {
    const { contextualIds, incognito } = sidebar;
    func.push(
      updateContextMenu(NEW_TAB_OPEN_CONTAINER, {
        enabled: !!(Array.isArray(contextualIds) && contextualIds.length),
        visible: !incognito
      }),
      updateContextMenu('sep-0', {
        visible: !incognito
      }),
      prepareContexualIdsMenuItems(NEW_TAB_OPEN_CONTAINER)
    );
  } else {
    const data = {
      visible: false
    };
    func.push(
      updateContextMenu(NEW_TAB_OPEN_CONTAINER, data),
      updateContextMenu('sep-0', data)
    );
  }
  return Promise.all(func);
};

/**
 * prepare page menu items
 *
 * @param {object} opt - options
 * @returns {Promise.<Array>} - results of each handler
 */
export const preparePageMenuItems = async opt => {
  const func = [];
  if (isObjectNotEmpty(opt)) {
    const { allTabsLength, allTabsSelected, isTabContext } = opt;
    const { lastClosedTab } = sidebar;
    const pageKeys = [TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_CLOSE_UNDO];
    for (const itemKey of pageKeys) {
      const item = menuItems[itemKey];
      const { id, title } = item;
      const data = {
        title
      };
      switch (itemKey) {
        case TAB_ALL_RELOAD:
          data.enabled = true;
          data.visible =
            !isTabContext || (allTabsLength > 1 && !allTabsSelected);
          break;
        case TAB_ALL_SELECT:
          data.enabled = allTabsLength > 1 && !allTabsSelected;
          data.visible = true;
          break;
        case TAB_CLOSE_UNDO:
          data.enabled = !!lastClosedTab;
          data.visible = true;
          break;
        default:
      }
      func.push(updateContextMenu(id, data));
    }
  }
  return Promise.all(func);
};

/**
 * prepare tab group menu items
 *
 * @param {object} elm - element
 * @param {object} opt - options
 * @returns {Promise.<Array>} - results of each handler
 */
export const prepareTabGroupMenuItems = async (elm, opt) => {
  const func = [];
  const { enableTabGroup, incognito } = sidebar;
  const tabGroupMenu = menuItems[TAB_GROUP];
  if (elm && elm.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(opt) &&
      enableTabGroup) {
    const { classList: tabClass, parentNode } = elm;
    const { classList: parentClass } = parentNode;
    const { headingShown, multiTabsSelected, pinned } = opt;
    const hasTabId = !!elm.dataset.tabId;
    const tabGroups =
      document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
    const tabGroupKeys = [
      TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
      TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER, TAB_GROUP_DETACH,
      TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_LABEL_SHOW,
      TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
      'sepTabGroup-1', 'sepTabGroup-2', 'sepTabGroup-3'
    ];
    func.push(updateContextMenu(tabGroupMenu.id, {
      enabled: true,
      title: tabGroupMenu.title,
      visible: true
    }));
    for (const itemKey of tabGroupKeys) {
      const item = tabGroupMenu.subItems[itemKey];
      const { id, title, toggleTitle } = item;
      const data = {};
      switch (itemKey) {
        case TAB_GROUP_BOOKMARK:
        case TAB_GROUP_CLOSE:
          data.enabled = parentClass.contains(CLASS_TAB_GROUP);
          data.title = title;
          data.visible = true;
          break;
        case TAB_GROUP_COLLAPSE:
          if (parentClass.contains(CLASS_TAB_GROUP) && toggleTitle) {
            data.enabled = true;
            data.title =
              parentClass.contains(CLASS_TAB_COLLAPSED) ? toggleTitle : title;
          } else {
            data.enabled = false;
          }
          data.visible = true;
          break;
        case TAB_GROUP_COLLAPSE_OTHER:
          if (parentClass.contains(CLASS_TAB_GROUP) && tabGroups.length > 1) {
            data.enabled = true;
            data.visible = true;
          } else {
            data.visible = false;
          }
          break;
        case TAB_GROUP_CONTAINER:
          data.enabled = hasTabId && !(pinned || multiTabsSelected);
          data.title = title;
          data.visible = !incognito;
          break;
        case TAB_GROUP_DOMAIN:
          data.enabled = hasTabId && !(pinned || multiTabsSelected);
          data.title = title;
          data.visible = true;
          break;
        case TAB_GROUP_DETACH:
          if (multiTabsSelected) {
            data.visible = false;
          } else if (hasTabId && !pinned &&
                     parentClass.contains(CLASS_TAB_GROUP)) {
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
        case TAB_GROUP_LABEL_SHOW:
          data.enabled = parentClass.contains(CLASS_TAB_GROUP);
          data.title = headingShown ? toggleTitle : title;
          data.visible = true;
          break;
        case TAB_GROUP_SELECTED:
          data.enabled =
            !pinned && multiTabsSelected && tabClass.contains(HIGHLIGHTED);
          data.title = title;
          data.visible = true;
          break;
        case TAB_GROUP_UNGROUP:
          data.enabled = !pinned && parentClass.contains(CLASS_TAB_GROUP);
          data.title = title;
          data.visible = true;
          break;
        default:
          data.enabled = hasTabId && parentClass.contains(CLASS_TAB_GROUP);
          data.title = title;
          data.visible = true;
      }
      func.push(updateContextMenu(id, data));
    }
  } else {
    func.push(updateContextMenu(tabGroupMenu.id, {
      visible: false
    }));
  }
  return Promise.all(func);
};

/**
 * prepare tab menu items
 *
 * @param {object} elm - target element
 * @returns {Promise.<Array>} - results of each handler
 */
export const prepareTabMenuItems = async elm => {
  const func = [];
  const { contextualIds, enableTabGroup, incognito } = sidebar;
  const tab = getSidebarTab(elm);
  const heading = getTabGroupHeading(elm);
  const bookmarkMenu = menuItems[TAB_ALL_BOOKMARK];
  const closeMenu = menuItems[TABS_CLOSE_MULTIPLE];
  const tabGroupMenu = menuItems[TAB_GROUP];
  const tabKeys = [
    TAB_BOOKMARK, TAB_CLOSE, TAB_DUPE, TAB_MOVE, TAB_MUTE, TAB_NEW, TAB_PIN,
    TAB_RELOAD, TAB_REOPEN_CONTAINER
  ];
  const tabsKeys = [
    TABS_BOOKMARK, TABS_CLOSE, TABS_DUPE, TABS_MOVE, TABS_MUTE, TABS_PIN,
    TABS_RELOAD, TABS_REOPEN_CONTAINER
  ];
  const closeKeys = [TAB_CLOSE_START, TAB_CLOSE_END, TAB_CLOSE_OTHER];
  const sepKeys = ['sep-1', 'sep-2', 'sep-3', 'sep-4'];
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const selectedTabs =
    document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  const pinnedContainer = document.getElementById(PINNED);
  const { nextElementSibling: firstUnpinnedContainer } = pinnedContainer;
  const firstUnpinnedTab = firstUnpinnedContainer.querySelector(TAB_QUERY);
  const multiTabsSelected = !!(
    tab && tab.classList.contains(HIGHLIGHTED) &&
    selectedTabs && selectedTabs.length > 1
  );
  const allTabsSelected = !!(
    selectedTabs && selectedTabs.length > 1 &&
    allTabs && selectedTabs.length === allTabs.length
  );
  if (tab) {
    const { parentNode } = tab;
    const parentFirstTab = parentNode.querySelector(TAB_QUERY);
    const parentLastTab = parentNode.lastElementChild;
    const tabId = getSidebarTabId(tab);
    const otherTabs = document.querySelectorAll(
      `${TAB_QUERY}:not(.${PINNED}):not([data-tab-id="${tabId}"])`
    );
    const lastTab = allTabs[allTabs.length - 1];
    const tabsTab = await getTab(tabId);
    const { index, mutedInfo: { muted }, pinned } = tabsTab;
    for (const itemKey of tabKeys) {
      const item = menuItems[itemKey];
      const { id, title, toggleTitle } = item;
      const data = {};
      if (multiTabsSelected && (itemKey !== TAB_NEW && itemKey !== 'sep-1')) {
        data.visible = false;
      } else {
        switch (itemKey) {
          case TAB_MUTE:
            data.enabled = true;
            data.title = muted ? toggleTitle : title;
            data.visible = true;
            break;
          case TAB_PIN:
            data.enabled = true;
            data.title = pinned ? toggleTitle : title;
            data.visible = true;
            break;
          case TAB_REOPEN_CONTAINER:
            data.enabled =
              !!(Array.isArray(contextualIds) && contextualIds.length);
            data.title = title;
            data.visible = !incognito;
            break;
          default:
            data.enabled = true;
            data.title = title;
            data.visible = true;
        }
      }
      func.push(updateContextMenu(id, data));
    }
    for (const itemKey of tabsKeys) {
      const item = menuItems[itemKey];
      const { id, title, toggleTitle } = item;
      const data = {};
      if (multiTabsSelected) {
        switch (itemKey) {
          case TABS_CLOSE:
            data.enabled = true;
            data.title = i18n.getMessage(`${TABS_CLOSE}_menu`, [
              `${selectedTabs.length}`,
              '(&C)'
            ]);
            data.visible = true;
            break;
          case TABS_MUTE:
            data.enabled = true;
            data.title = muted ? toggleTitle : title;
            data.visible = true;
            break;
          case TABS_PIN:
            data.enabled = true;
            data.title = pinned ? toggleTitle : title;
            data.visible = true;
            break;
          case TABS_REOPEN_CONTAINER:
            data.enabled =
              !!(Array.isArray(contextualIds) && contextualIds.length);
            data.title = title;
            data.visible = !incognito;
            break;
          default:
            data.enabled = true;
            data.title = title;
            data.visible = true;
        }
      } else {
        data.visible = false;
      }
      func.push(updateContextMenu(id, data));
    }
    for (const itemKey of closeKeys) {
      const item = closeMenu.subItems[itemKey];
      const { id, title } = item;
      const data = {
        title,
        visible: true
      };
      switch (itemKey) {
        case TAB_CLOSE_END:
          data.enabled =
            !allTabsSelected && firstUnpinnedTab && lastTab !== tab;
          break;
        case TAB_CLOSE_OTHER:
          data.enabled = !allTabsSelected && !!(otherTabs && otherTabs.length);
          break;
        case TAB_CLOSE_START:
          data.enabled = !allTabsSelected && firstUnpinnedTab !== tab &&
            !tab.classList.contains(PINNED);
          break;
        default:
      }
      func.push(updateContextMenu(id, data));
    }
    func.push(updateContextMenu(closeMenu.id, {
      visible: true
    }));
    if (multiTabsSelected) {
      const tabsMoveMenu = menuItems[TABS_MOVE];
      const tabsMoveKeys = [TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN];
      for (const itemKey of tabsMoveKeys) {
        const item = tabsMoveMenu.subItems[itemKey];
        const { id, title } = item;
        const data = {
          visible: true
        };
        switch (itemKey) {
          case TABS_MOVE_END:
            if (allTabsSelected) {
              data.enabled = false;
            } else if (pinned) {
              data.enabled = tab !== parentLastTab;
            } else {
              data.enabled = index !== allTabs.length - 1;
            }
            data.title = title;
            break;
          case TABS_MOVE_START:
            if (allTabsSelected) {
              data.enabled = false;
            } else if (pinned) {
              data.enabled = tab !== parentFirstTab;
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
      func.push(prepareContexualIdsMenuItems(TABS_REOPEN_CONTAINER));
    } else {
      const tabMoveMenu = menuItems[TAB_MOVE];
      const tabMoveKeys = [TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN];
      for (const itemKey of tabMoveKeys) {
        const item = tabMoveMenu.subItems[itemKey];
        const { id, title } = item;
        const data = {
          visible: true
        };
        switch (itemKey) {
          case TAB_MOVE_END:
            if (pinned) {
              data.enabled = tab !== parentLastTab;
            } else {
              data.enabled = index !== allTabs.length - 1;
            }
            data.title = title;
            break;
          case TAB_MOVE_START:
            if (pinned) {
              data.enabled = tab !== parentFirstTab;
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
      func.push(prepareContexualIdsMenuItems(TAB_REOPEN_CONTAINER));
    }
    func.push(prepareTabGroupMenuItems(tab, {
      multiTabsSelected,
      pinned,
      headingShown: heading && !heading.hidden
    }));
    for (const sep of sepKeys) {
      if (sep === 'sep-4' && !enableTabGroup) {
        func.push(updateContextMenu(sep, {
          visible: false
        }));
      } else {
        func.push(updateContextMenu(sep, {
          visible: true
        }));
      }
    }
    setContext(tab);
    func.push(updateContextMenu(bookmarkMenu.id, {
      visible: false
    }));
  } else if (heading) {
    for (const itemKey of tabKeys) {
      const item = menuItems[itemKey];
      func.push(updateContextMenu(item.id, {
        visible: false
      }));
    }
    for (const itemKey of tabsKeys) {
      const item = menuItems[itemKey];
      func.push(updateContextMenu(item.id, {
        visible: false
      }));
    }
    setContext(heading);
    for (const sep of sepKeys) {
      if (sep === 'sep-4') {
        func.push(updateContextMenu(sep, {
          visible: true
        }));
      } else {
        func.push(updateContextMenu(sep, {
          visible: false
        }));
      }
    }
    func.push(
      prepareTabGroupMenuItems(heading, {
        multiTabsSelected,
        headingShown: !heading.hidden,
        pinned: heading.parentNode === pinnedContainer
      }),
      updateContextMenu(closeMenu.id, {
        visible: false
      }),
      updateContextMenu(bookmarkMenu.id, {
        enabled: true,
        title: bookmarkMenu.title,
        visible: true
      })
    );
  } else {
    for (const itemKey of tabKeys) {
      const item = menuItems[itemKey];
      func.push(updateContextMenu(item.id, {
        visible: false
      }));
    }
    for (const itemKey of tabsKeys) {
      const item = menuItems[itemKey];
      func.push(updateContextMenu(item.id, {
        visible: false
      }));
    }
    for (const sep of sepKeys) {
      func.push(updateContextMenu(sep, {
        visible: false
      }));
    }
    setContext(elm);
    func.push(
      updateContextMenu(tabGroupMenu.id, {
        visible: false
      }),
      updateContextMenu(closeMenu.id, {
        visible: false
      }),
      updateContextMenu(bookmarkMenu.id, {
        enabled: true,
        title: bookmarkMenu.title,
        visible: true
      })
    );
  }
  func.push(preparePageMenuItems({
    allTabsSelected,
    allTabsLength: allTabs.length,
    isTabContext: !!tab
  }));
  return Promise.all(func);
};

/* events */
/**
 * handle event
 *
 * @param {!object} evt - event
 * @returns {Promise.<Array|Error>} - promise chain
 */
export const handleEvt = evt => {
  const { button, ctrlKey, key, metaKey, shiftKey, target } = evt;
  const { isMac, windowId } = sidebar;
  const func = [];
  // select all tabs
  if (((isMac && metaKey) || (!isMac && ctrlKey)) && key === 'a') {
    const allTabs = document.querySelectorAll(TAB_QUERY);
    func.push(highlightTabs(Array.from(allTabs), windowId));
    evt.stopPropagation();
    evt.preventDefault();
  // context menu
  } else if ((shiftKey && key === 'F10') || key === 'ContextMenu' ||
             button === MOUSE_BUTTON_RIGHT) {
    func.push(
      prepareTabMenuItems(target),
      prepareNewTabMenuItems(target)
    );
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * handle contextmenu event
 *
 * @param {!object} evt - event
 * @returns {(Function|Error)} - promise chain
 */
export const handleContextmenuEvt = evt => {
  const { target } = evt;
  const container = getSidebarTabContainer(target);
  const tabId =
    container && getSidebarTabId(container.querySelector(TAB_QUERY));
  const opt = {};
  if (Number.isInteger(tabId) && tabId !== TAB_ID_NONE) {
    opt.tabId = tabId;
    opt.context = 'tab';
  }
  return overrideContextMenu(opt).catch(throwErr);
};

/**
 * handle wheel event
 *
 * @param {!object} evt - event
 * @returns {?(Function|Error)} - promise chain
 */
export const handleWheelEvt = evt => {
  const { deltaY } = evt;
  const {
    alwaysSwitchTabByScrolling, invertScrollDirection, skipCollapsed,
    switchTabByScrolling, windowId
  } = sidebar;
  const main = document.getElementById(SIDEBAR_MAIN);
  const enableSwitchTab = main && switchTabByScrolling && (
    main.scrollHeight === main.clientHeight || alwaysSwitchTabByScrolling
  );
  let func;
  if (enableSwitchTab && Number.isFinite(deltaY) && deltaY !== 0) {
    evt.preventDefault();
    alwaysSwitchTabByScrolling && evt.stopPropagation();
    func = switchTab({
      skipCollapsed,
      windowId,
      deltaY: invertScrollDirection ? deltaY * -1 : deltaY
    }).catch(throwErr);
  }
  return func || null;
};

/* runtime message */
/**
 * handle runtime message
 *
 * @param {!object} msg - message
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
 *
 * @returns {?Function} - port.postMessage()
 */
export const requestSidebarStateUpdate = async () => {
  const { windowId } = sidebar;
  const port = ports.get(`${SIDEBAR}_${windowId}`);
  let func;
  if (port && Number.isInteger(windowId)) {
    const win = await getCurrentWindow();
    const { focused, id, type } = win;
    if (windowId === id && focused && type === 'normal') {
      const msg = {
        [SIDEBAR_STATE_UPDATE]: {
          windowId
        }
      };
      func = port.postMessage(msg);
    }
  }
  return func || null;
};

/* storage */
/**
 * set variable
 *
 * @param {string} item - item
 * @param {object} obj - value object
 * @param {boolean} changed - changed
 * @returns {Promise.<Array>} - results of each handler
 */
export const setVar = async (item, obj, changed = false) => {
  const func = [];
  if (item && obj) {
    const { checked, value } = obj;
    switch (item) {
      case BROWSER_SETTINGS_READ:
        sidebar[item] = !!checked;
        changed && func.push(storeCloseTabsByDoubleClickValue(!!checked));
        break;
      case CUSTOM_BG:
      case CUSTOM_BG_ACTIVE:
      case CUSTOM_BG_HOVER:
      case CUSTOM_BG_SELECT:
      case CUSTOM_BG_SELECT_HOVER:
      case CUSTOM_BORDER_ACTIVE:
      case CUSTOM_COLOR:
      case CUSTOM_COLOR_ACTIVE:
      case CUSTOM_COLOR_HOVER:
      case CUSTOM_COLOR_SELECT:
      case CUSTOM_COLOR_SELECT_HOVER:
        changed && func.push(
          updateCustomThemeCss(`.${CLASS_THEME_CUSTOM}`, item, value)
        );
        break;
      case NEW_TAB_SEPARATOR_SHOW:
        sidebar[item] = !!checked;
        changed && func.push(setNewTabSeparator(!!checked));
        break;
      case TAB_CLOSE_DBLCLICK:
        sidebar[item] = !!checked;
        changed && func.push(replaceTabDblClickListeners(!!checked));
        break;
      case TAB_CLOSE_MDLCLICK_PREVENT:
        sidebar[TAB_CLOSE_MDLCLICK] = !checked;
        break;
      case TAB_GROUP_ENABLE:
        sidebar[item] = !!checked;
        changed && func.push(toggleTabGrouping());
        break;
      case TAB_GROUP_EXPAND_COLLAPSE_OTHER:
        sidebar[item] = !!checked;
        changed && func.push(replaceTabContextClickListener(!!checked));
        break;
      case TAB_GROUP_EXPAND_EXCLUDE_PINNED:
        sidebar[item] = !!checked;
        func.push(toggleAutoCollapsePinnedTabs(!checked));
        break;
      case THEME_AUTO:
      case THEME_CUSTOM:
      case THEME_DARK:
      case THEME_LIGHT:
        changed && checked && func.push(setTheme([item, !!checked]));
        break;
      case THEME_LIST:
        changed && func.push(applyTheme());
        break;
      case THEME_UI_SCROLLBAR_NARROW:
        changed && func.push(setScrollbarWidth(!!checked));
        break;
      case THEME_UI_TAB_COMPACT:
        changed && func.push(setTabHeight(!!checked));
        break;
      case THEME_UI_TAB_GROUP_NARROW:
        changed && func.push(setTabGroupColorBarWidth(!!checked));
        break;
      case USER_CSS:
        changed && func.push(applyUserStyle());
        break;
      case USER_CSS_USE:
        sidebar[item] = !!checked;
        changed && func.push(applyUserStyle());
        break;
      default:
        if (Object.prototype.hasOwnProperty.call(sidebar, item)) {
          sidebar[item] = !!checked;
        }
    }
  }
  return Promise.all(func);
};

/**
 * set variables
 *
 * @param {object} data - data
 * @returns {Promise.<Array>} - results of each handler
 */
export const setVars = async (data = {}) => {
  const items = Object.entries(data);
  const func = [];
  for (const item of items) {
    const [key, value] = item;
    const { newValue } = value;
    func.push(setVar(key, newValue || value, !!newValue));
  }
  return Promise.all(func);
};

/* restore tabs */
/**
 * restore highlighted tabs
 *
 * @returns {void}
 */
export const restoreHighlightedTabs = async () => {
  const { windowId } = sidebar;
  const allTabs = document.querySelectorAll(TAB_QUERY);
  const items = await getHighlightedTab(windowId);
  const tabIds = new Set();
  for (const item of items) {
    const { id } = item;
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
 *
 * @returns {Promise.<Array>} - results of each handler
 */
export const restoreTabGroups = async () => {
  const { tabGroupOnExpandCollapseOther: multi, windowId } = sidebar;
  const tabList = await getSessionTabList(TAB_LIST, windowId);
  const func = [];
  if (isObjectNotEmpty(tabList)) {
    const { recent } = tabList;
    const listItems = Object.entries(recent);
    const listItemIndexes = new Map();
    for (const [index, listItem] of listItems) {
      const { url } = listItem;
      if (listItemIndexes.has(url)) {
        const indexes = listItemIndexes.get(url);
        indexes.push(index * 1);
        listItemIndexes.set(url, indexes);
      } else {
        listItemIndexes.set(url, [index * 1]);
      }
    }
    const items = document.querySelectorAll(TAB_QUERY);
    const l = items.length;
    let i = 0;
    while (i < l) {
      const item = items[i];
      const { dataset: { tab: itemTab } } = item;
      const { pinned, url: itemUrl } = JSON.parse(itemTab);
      if (pinned) {
        const listItem = recent[i];
        const {
          collapsed, headingLabel: headingLabelTextContent, headingShown
        } = listItem;
        const container = document.getElementById(PINNED);
        const heading = container.querySelector(`.${CLASS_HEADING}`);
        const headingLabel = container.querySelector(`.${CLASS_HEADING_LABEL}`);
        container.appendChild(item);
        if (collapsed) {
          container.classList.add(CLASS_TAB_COLLAPSED);
        } else {
          container.classList.remove(CLASS_TAB_COLLAPSED);
        }
        headingLabel.textContent = headingLabelTextContent || '';
        heading.hidden = !headingShown;
        func.push(addListenersToHeadingItems(heading, multi));
      } else if (i && listItemIndexes.has(itemUrl)) {
        const prevItem = items[i - 1];
        const { dataset: { tab: prevItemTab } } = prevItem;
        const { url: prevItemUrl } = JSON.parse(prevItemTab);
        const container = prevItem.parentNode;
        const indexes = listItemIndexes.get(itemUrl);
        const heading = container.querySelector(`.${CLASS_HEADING}`);
        const headingLabel = container.querySelector(`.${CLASS_HEADING_LABEL}`);
        for (const index of indexes) {
          const listItem = recent[index];
          const prevListItem = index > 0 ? recent[index - 1] : {};
          const {
            collapsed, containerIndex: listContainerIndex,
            headingLabel: headingLabelTextContent, headingShown
          } = listItem;
          const {
            containerIndex: prevListContainerIndex, url: prevListUrl
          } = prevListItem;
          if (listContainerIndex === prevListContainerIndex &&
              (index === i || prevItemUrl === prevListUrl)) {
            container.appendChild(item);
            if (collapsed) {
              container.classList.add(CLASS_TAB_COLLAPSED);
            } else {
              container.classList.remove(CLASS_TAB_COLLAPSED);
            }
            headingLabel.textContent = headingLabelTextContent || '';
            heading.hidden = !headingShown;
            func.push(addListenersToHeadingItems(heading, multi));
            break;
          }
        }
      }
      i++;
    }
  }
  return Promise.all(func);
};

/**
 * emulate tabs in order
 *
 * @param {Array} arr - array of tabs.Tab
 * @returns {void}
 */
export const emulateTabsInOrder = async arr => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const tab = arr.shift();
  const opt = {
    emulate: true
  };
  isObjectNotEmpty(tab) && await handleCreatedTab(tab, opt);
  arr.length && await emulateTabsInOrder(arr);
};

/**
 * emulate tabs in sidebar
 *
 * @returns {Function} - emulateTabsInOrder()
 */
export const emulateTabs = async () => {
  const allTabs = await getAllTabsInWindow();
  return emulateTabsInOrder(allTabs);
};

/**
 * set main
 *
 * @returns {void} - result of each handler
 */
export const setMain = async () => {
  const main = document.getElementById(SIDEBAR_MAIN);
  const newTab = document.getElementById(NEW_TAB_BUTTON);
  main.addEventListener('mousedown', handleCreateNewTab);
  main.addEventListener('dblclick', handleCreateNewTab);
  main.addEventListener('wheel', handleWheelEvt);
  main.addEventListener('dragover', handleDragOver);
  main.addEventListener('drop', handleDrop);
  newTab.addEventListener('click', handleCreateNewTab);
};

// For test
export { ports };
