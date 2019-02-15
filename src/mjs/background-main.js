/**
 * background-main.js
 */

/* api */
const {sidebarAction, windows} = browser;

/* constant */
import {SIDEBAR_STATE_UPDATE} from "./constant.js";
const {WINDOW_ID_NONE} = windows;

/* sidebar */
export const sidebar = {
  windowId: null,
  isOpen: false,
};

/**
 * set sidebar state
 * @param {number} windowId - window ID
 * @returns {void}
 */
export const setSidebarState = async windowId => {
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  if (windowId === WINDOW_ID_NONE) {
    sidebar.windowId = null;
    sidebar.isOpen = false;
  } else {
    const isOpen = await sidebarAction.isOpen({});
    sidebar.windowId = windowId;
    sidebar.isOpen = !!isOpen;
  }
};

/**
 * toggle sidebar
 * @returns {?AsyncFunction} - sidebarAction.close() / sidebarAction.open()
 */
export const toggleSidebar = async () => {
  const {isOpen, windowId} = sidebar;
  let func;
  if (Number.isInteger(windowId)) {
    if (isOpen) {
      func = sidebarAction.close();
    } else {
      func = sidebarAction.open();
    }
  }
  return func;
};

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
      case SIDEBAR_STATE_UPDATE: {
        const {windowId} = value;
        func.push(setSidebarState(windowId));
        break;
      }
      default:
    }
  }
  return Promise.all(func);
};
