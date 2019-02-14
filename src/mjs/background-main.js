/**
 * background-main.js
 */

import {
  getType,
} from "./common.js";

/* api */
const {sidebarAction, windows} = browser;

/* constant */
import {SIDEBAR_STATE_UPDATE} from "./constant.js";
const {WINDOW_ID_NONE} = windows;

/* sidebar */
export const sidebar = {
  windowId: windows.WINDOW_ID_CURRENT,
  isOpen: false,
};

/**
 * set sidebar window ID
 * @param {number} windowId - window ID
 * @returns {void}
 */
export const setSidebarWindowId = async windowId => {
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === WINDOW_ID_NONE) {
    sidebar.windowId = windows.WINDOW_ID_CURRENT;
  } else {
    sidebar.windowId = windowId;
  }
};

/**
 * set sidebar isOpen state
 * @returns {void}
 */
export const setSidebarIsOpenState = async () => {
  const {windowId} = sidebar;
  const isOpen = await sidebarAction.isOpen({windowId});
  sidebar.isOpen = !!isOpen;
};

/**
 * toggle sidebar
 * @returns {?AsyncFunction} - sidebarAction.close() / sidebarAction.open()
 */
export const toggleSidebar = async () => {
  let func;
  const {isOpen} = sidebar;
  if (isOpen) {
    func = sidebarAction.close();
  } else {
    func = sidebarAction.open();
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
        func.push(setSidebarWindowId(windowId).then(setSidebarIsOpenState));
        break;
      }
      default:
    }
  }
  return Promise.all(func);
};
