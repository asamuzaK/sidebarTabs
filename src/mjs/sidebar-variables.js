/**
 * sidebar-variables.js
 */

import {
  getType, isObjectNotEmpty, isString,
} from "./common.js";
import {
  clearStorage, getAllContextualIdentities, getCurrentWindow, getOs,
  getRecentlyClosedTab, getStorage, restoreSession, setSessionWindowValue,
} from "./browser.js";
import {
  setTabHeight, setTheme,
} from "./theme.js";

/* constants */
import {
  TAB_GROUP_NEW_TAB_AT_END, TAB_LIST,
  THEME_DARK, THEME_LIGHT, THEME_TAB_COMPACT,
} from "./constant.js";

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
  if (store) {
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

/**
 * set variable
 * @param {string} item - item
 * @param {Object} obj - value object
 * @param {boolean} changed - changed
 * @returns {Promise.<Array>} - results of each handler
 */
export const setVar = async (item, obj, changed = false) => {
  if (!isString(item)) {
    throw new TypeError(`Expected String but got ${getType(item)}.`);
  }
  const func = [];
  if (isObjectNotEmpty(obj)) {
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
