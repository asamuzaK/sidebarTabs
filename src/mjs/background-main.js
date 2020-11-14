/**
 * background-main.js
 */

import {
  getType, isString
} from './common.js';

/* constant */
import { SIDEBAR_STATE_UPDATE, TOGGLE_STATE } from './constant.js';

/* api */
const { sidebarAction, windows } = browser;
const { WINDOW_ID_NONE } = windows;

/* sidebar */
export const sidebar = {
  windowId: null,
  isOpen: false
};

/**
 * set sidebar state
 *
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
 *
 * @returns {?Function} - sidebarAction.close() / sidebarAction.open()
 */
export const toggleSidebar = async () => {
  const { isOpen, windowId } = sidebar;
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
 *
 * @param {!object} msg - message
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleMsg = async msg => {
  const items = Object.entries(msg);
  const func = [];
  for (const [key, value] of items) {
    switch (key) {
      case SIDEBAR_STATE_UPDATE: {
        const { windowId } = value;
        func.push(setSidebarState(windowId));
        break;
      }
      default:
    }
  }
  return Promise.all(func);
};

/**
 * handle command
 *
 * @param {!string} cmd - command
 * @returns {?Function} - promise chain
 */
export const handleCmd = async cmd => {
  if (!isString(cmd)) {
    throw new TypeError(`Expected String but got ${getType(cmd)}.`);
  }
  let func;
  switch (cmd) {
    case TOGGLE_STATE:
      func = toggleSidebar().then(setSidebarState);
      break;
    default:
  }
  return func || null;
};
